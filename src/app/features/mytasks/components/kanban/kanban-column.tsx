"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./kanban-card"

type Task = {
    id: string
    title: string
    priority: string
    dueDate: Date | null
    project: { name: string } | null
    assignee: { name: string | null } | null
}

type Props = {
    id: string
    title: string
    tasks: Task[]
}

export const KanbanColumn = ({ id, title, tasks }: Props) => {

    const { setNodeRef, isOver } = useDroppable({ id })
    return (
        <div className="flex flex-col gap-3 w-full ">
            {/* header */}
            <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {tasks.length}
                </span>
            </div>

            {/* board */}
            <div
                ref={setNodeRef}
                className={`flex flex-col gap-2 min-h-150  flex-1 p-2 rounded-lg transition-colors ${isOver ? 'bg-muted/80' : 'bg-muted/40'}`}
            >
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((t) => (
                        <KanbanCard key={t.id} task={t} />
                    ))}
                </SortableContext>


                {tasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center ">
                        <p className="text-xs text-muted-foreground">No tasks</p>
                    </div>
                )}
            </div>

        </div>
    )
}