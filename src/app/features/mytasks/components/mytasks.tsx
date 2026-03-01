"use client"

import { EntityContainer, EntitySelect } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import DialogTask, { Formtype } from "./dialog"
import { useAccessibleProjects, useCreateTask, useMyProjects, useSuspenseTasks } from "../hooks/use-tasks"


export const MytasksHeader = () => {
    return (
        <div className="w-full ">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">My Tasks</h1>
                    <p className="text-sm text-muted-foreground">
                        Focus on what martters today. You have 4 high priority taskts.
                    </p>
                </div>
                <CreateTaskDialog
                    trigger={
                        <Button>
                            <PlusIcon className="size-4" />
                            <span>New Task</span>
                        </Button>
                    }
                    mode="create"

                />
            </div>
        </div>
    )
}

interface CreateTaskProps {
    trigger?: React.ReactNode
    title?: string
    description?: string
    mode: "create" | "update"
    TaskId?: string
}

export const CreateTaskDialog = ({ trigger, title, description, mode, TaskId }: CreateTaskProps) => {

    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutate: createTask, isPending: isCreating } = useCreateTask()
    const handleSubmit = (values: Formtype) => {
        if (mode === 'create') {

            createTask({
                title: values.title,
                description: values.description,
                assigneeId: values.assigneeId,
                projectId: values.projectId,
                dueDate: values.dueDate,
                priority: values.priority,
                status: values.status,

            }, {
                onSuccess: () => {
                    setDialogOpen(false)
                }
            })
        }
        // else if (mode === 'update') {
        //     if (!projectId) return
        //     updateProject({
        //         id: projectId,
        //         name: values.name,
        //         description: values.description
        //     })
        // }
    }

    return (
        <>
            <div className="contents" onClick={() => setDialogOpen(true)} >
                {trigger}
            </div>


            <DialogTask
                mode={mode}
                title={title}
                description={description}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
            />
        </>
    )
}


type TaskTab = "today" | "week" | "overdue" | "completed"

type TaskTabsProps = {
    value: TaskTab
    onChange: (v: TaskTab) => void
}
export function TaskTabs({ value, onChange }: TaskTabsProps) {

    return (
        <Tabs value={value} onValueChange={(v) => onChange(v as TaskTab)}>
            <TabsList
                className="bg-transparent p-0 h-auto gap-6"
                variant="line"
            >
                <TabsTrigger value="today">
                    Today
                </TabsTrigger>

                <TabsTrigger value="week">
                    This Week
                </TabsTrigger>

                <TabsTrigger value="overdue">
                    Overdue
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                        2
                    </span>
                </TabsTrigger>

                <TabsTrigger value="completed">
                    Completed
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}


type Priority = "LOW" | "MEDIUM" | "HIGH"
type SortOrder = "newest" | "oldest"

type MytasksSelectedProps = {
    priority?: Priority
    setPriority: React.Dispatch<React.SetStateAction<Priority | undefined>>

    date?: SortOrder
    setDate: React.Dispatch<React.SetStateAction<SortOrder | undefined>>

    projectId?: string
    setProjectId: React.Dispatch<React.SetStateAction<string | undefined>>
}

const PRIORITY_OPTIONS = [
    { label: "All", value: "ALL" },
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
]

export const MytasksSelected = ({
    date,
    priority,
    projectId,
    setDate,
    setPriority,
    setProjectId,
}: MytasksSelectedProps) => {

    const { data: myprojects } = useAccessibleProjects()

    const projects =
        myprojects?.map((p) => ({
            label: p.name,
            value: p.id,
        })) ?? []

    return (
        <div className="flex p-4 bg-white rounded-md shadow-md gap-4">

            <EntitySelect
                options={PRIORITY_OPTIONS}
                value={priority ?? "ALL"}
                onChange={(v) =>
                    setPriority(v === "ALL" ? undefined : (v as Priority))
                }
            />

            <EntitySelect
                options={[
                    { label: "All", value: "ALL" },
                    { label: "Newest First", value: "newest" },
                    { label: "Oldest First", value: "oldest" },
                ]}
                value={date ?? "ALL"}
                onChange={(v) =>
                    setDate(v === "ALL" ? undefined : (v as SortOrder))
                }
            />

            <EntitySelect
                options={[
                    { label: "All", value: "ALL" },
                    ...projects,
                ]}
                value={projectId ?? "ALL"}
                onChange={(v) =>
                    setProjectId(v === "ALL" ? undefined : v)
                }
            />

        </div>
    )
}

const PRIORITY_COLOR: Record<string, string> = {
    HIGH: "bg-red-500",
    MEDIUM: "bg-blue-500",
    LOW: "bg-gray-300",
}

type TableProps = {
    priority?: Priority
    date?: SortOrder
    projectId?: string
    tab?: TaskTab
}

export const MyTasksTable = ({
    date,
    priority,
    projectId,
    tab,
}: TableProps) => {

    const [tasks] = useSuspenseTasks({ priority, projectId, date, tab })



    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Task Name</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                Not Found
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell><Checkbox /></TableCell>
                                <TableCell className="font-semibold">{task.title}</TableCell>
                                <TableCell>{task.project?.name}</TableCell>
                                <TableCell className={`flex items-center gap-3`}>
                                    <span
                                        className={`inline-block rounded-full w-2.5 h-2.5 ${PRIORITY_COLOR[task.priority]}`}
                                    />
                                    {task.priority}
                                </TableCell>
                                <TableCell>
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString()
                                        : "-"}
                                </TableCell>
                                <TableCell>{task.status}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    )
}

export const MytasksContainer = () => {

    const [priority, setPriority] = useState<Priority | undefined>()
    const [projectId, setProjectId] = useState<string | undefined>()
    const [date, setDate] = useState<SortOrder | undefined>()
    const [activeTab, setActiveTab] = useState<TaskTab>("today")

    return (
        <EntityContainer header={<MytasksHeader />}>
            <TaskTabs onChange={setActiveTab} value={activeTab} />

            <MytasksSelected
                date={date}
                priority={priority}
                projectId={projectId}
                setDate={setDate}
                setPriority={setPriority}
                setProjectId={setProjectId}
            />

            <MyTasksTable
                date={date}
                priority={priority}
                projectId={projectId}
                tab={activeTab}
            />

        </EntityContainer>
    )
}