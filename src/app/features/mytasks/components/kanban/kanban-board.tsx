"use client"

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { KanbanCard } from "./kanban-card"
import { KanbanColumn } from "./kanban-column"
import { useState } from "react"
import { useUpdateStatus } from "../../hooks/use-tasks"
import { TaskStatus } from "@/generated/prisma/enums"


const COLUMNS = [
    { id: "TODO", title: "Todo" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "DONE", title: "Done" },
]


type Task = {
    id: string
    title: string
    status: string
    priority: string
    dueDate: Date | null
    project: { name: string } | null
    assignee: { name: string | null } | null
}

type Props = {
    tasks: Task[]
}


export function KanbanBoard({ tasks }: Props) {
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const { mutate: updateStatus } = useUpdateStatus()

    // PointerSensor ป้องกัน drag ติดตอน click
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find((t) => t.id === event.active.id)
        setActiveTask(task ?? null)
        // เก็บ task ที่กำลัง drag ไว้ใช้ใน DragOverlay
    }


    const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"]
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)

        if (!over) return

        // ถ้า drop บน column → over.id = "TODO"
        // ถ้า drop บน card   → over.id = task.id → หา status ของ card นั้น
        const newStatus = VALID_STATUSES.includes(over.id as string)
            ? (over.id as TaskStatus)
            : (tasks.find((t) => t.id === over.id)?.status as TaskStatus)

        if (!newStatus) return

        const task = tasks.find((t) => t.id === active.id)

        if (!task || task.status === newStatus) return

        updateStatus({ taskId: task.id, status: newStatus })
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-3 gap-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={tasks.filter((t) => t.status === col.id)}
                    />
                ))}
            </div>

            {/* DragOverlay คือ card ที่ลอยตาม cursor ตอน drag */}
            <DragOverlay>
                {activeTask && <KanbanCard task={activeTask} />}
            </DragOverlay>
        </DndContext>
    )
}