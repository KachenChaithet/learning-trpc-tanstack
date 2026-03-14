"use client"
import { Card } from "@/components/ui/card"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"

const PRIORITY_COLOR: Record<string, string> = {
    HIGH: "bg-red-500",
    MEDIUM: "bg-blue-500",
    LOW: "bg-gray-300",
}

type Task = {
    id: string
    title: string
    priority: string
    dueDate: Date | null
    project: { name: string } | null
    assignee: { name: string | null } | null
}

type Props = {
    task: Task
}

export const KanbanCard = ({ task }: Props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging

    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,

    }

    return (
        <div
            style={style}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
        >
            <Card className="p-3 cursor-grab active:cursor-grabbing space-y-2">
                {/* Title */}
                <Link href={`/my-tasks/${task.id}`} className="font-medium text-sm hover:underline">
                    {task.title}
                </Link>

                {/* Project */}
                <p className="text-xs text-muted-foreground">{task.project?.name}</p>

                {/* Priority + Due Date */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className={`inline-block rounded-full w-2 h-2 ${PRIORITY_COLOR[task.priority]}`} />
                        <span className="text-xs">{task.priority}</span>
                    </div>

                    {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                            {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </Card>
        </div>
    )
}