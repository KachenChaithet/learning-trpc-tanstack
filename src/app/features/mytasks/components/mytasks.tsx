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
import { useCreateTask, useSuspenseTasks } from "../hooks/use-tasks"


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



export function TaskTabs() {
    const [activeTab, setActiveTab] = useState("today")

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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

const prioritys = [
    { "label": "All", "value": "all" },
    { "label": "Low", "value": "low" },
    { "label": "Medium", "value": "medium" },
    { "label": "High", "value": "high" }
]
const dates = [
    { "label": "Ascending", "value": "asc" },
    { "label": "Descending", "value": "desc" },
    { "label": "Newest First", "value": "newest" },
    { "label": "Oldest First", "value": "oldest" }
]

const projects = [
    { "label": "All", "value": "all" },
    { "label": "Website Redesign", "value": "website-redesign" },
    { "label": "Mobile App Development", "value": "mobile-app" },
    { "label": "Q4 Marketing Launch", "value": "q4-marketing" }
]

export const MytasksSelected = () => {
    const [priority, setPriority] = useState('')
    const [date, setDate] = useState('')
    const [project, setProject] = useState('')

    return (
        <div className="flex border-muted-foreground p-4 bg-white rounded-md shadow-md gap-4">
            <EntitySelect
                options={prioritys}
                onChange={setPriority}
                value={priority}
                placeholder="Priority: All"

            />
            <EntitySelect
                options={dates}
                onChange={setDate}
                value={date}
                placeholder="Due Date: Ascending"

            />
            <EntitySelect
                options={projects}
                onChange={setProject}
                value={project}
                placeholder="Project: All"

            />
        </div>
    )
}

const tasks = [
    {
        "id": "1",
        "taskName": "Review Q3 Marketing Strategy Assets",
        "description": "Last updated 2h ago",
        "project": "MARKETING",
        "priority": "high",
        "dueDate": "2023-10-25T17:00:00",
        "dueLabel": "Today, 5:00 PM",
        "status": "in-progress"
    },
    {
        "id": "2",
        "taskName": "API Documentation for v2.4 Release",
        "description": "Shared with Engineering",
        "project": "CORE API",
        "priority": "medium",
        "dueDate": "2023-10-24T00:00:00",
        "dueLabel": "Oct 24, 2023",
        "status": "todo"
    },
    {
        "id": "3",
        "taskName": "Client Presentation: Brand Refresh",
        "description": "Internal draft required",
        "project": "CLIENT X",
        "priority": "high",
        "dueDate": "2023-10-26T10:00:00",
        "dueLabel": "Tomorrow, 10:00 AM",
        "status": "in-progress"
    },
    {
        "id": "4",
        "taskName": "Weekly Sync with Product Team",
        "description": "Recurring event",
        "project": "INTERNAL",
        "priority": "low",
        "dueDate": "2023-10-26T00:00:00",
        "dueLabel": "Oct 26, 2023",
        "status": "todo"
    }
]

const PRIORITY_COLOR: Record<string, string> = {
    HIGH: "bg-red-500",
    MEDIUM: "bg-blue-500",
    LOW: "bg-gray-300",
}

export const MyTasksTable = () => {
    const [tasks] = useSuspenseTasks()

    return (
        <Card>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Check Box</TableHead>
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
                            <TableRow className="h-12" key={task.id}>
                                <TableCell><Checkbox /></TableCell>
                                <TableCell className="font-semibold">{task.title}</TableCell>
                                <TableCell>{task.project?.name}</TableCell>
                                <TableCell className="space-x-2">
                                    <span
                                        className={`inline-block w-2.5 h-2.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}
                                    ></span>
                                    <span>{task.priority}</span>
                                </TableCell>
                                <TableCell>
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString()
                                        : "Nothing"}
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

export const MytasksContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<MytasksHeader />}
        >
            <TaskTabs />
            <MytasksSelected />
            <MyTasksTable />
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </EntityContainer>
    )
}