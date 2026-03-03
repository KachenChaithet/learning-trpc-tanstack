"use client"

import { EntityContainer } from "@/app/components/entity-components"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
    AlertTriangleIcon,
    CalendarIcon,
    CheckCircle2Icon,
    FolderIcon,
    PlusIcon,
} from "lucide-react"
import { useOverview } from "../hooks/use-dashboards"
import { Suspense } from "react"
import { useGetRecent } from "../../activity/hook/use-activity"
import { formatDistanceToNow } from "date-fns"

/* ================================
   Dashboard Stats
================================ */



/* ================================
   Activity Types
================================ */

export type ActivityType =
    | "status_update"
    | "comment"
    | "project_created"
    | "file_attachment"

export interface ActivityItem {
    id: string
    type: ActivityType

    actor: {
        id: string
        name: string
        avatarUrl?: string
        isSystem?: boolean
    }

    target?: {
        id: string
        name: string
        type: "task" | "project" | "file"
    }

    metadata?: {
        status?: string
        comment?: string
        attachments?: {
            id: string
            fileName: string
            fileUrl: string
        }[]
    }

    projectCategory?: string
    createdAt: string
}

/* ================================
   Mock Activity Feed
================================ */

export const activityFeed: ActivityItem[] = [
    {
        id: "1",
        type: "status_update",
        actor: {
            id: "u1",
            name: "Sarah Jenkins",
            avatarUrl: "/avatars/sarah.png",
        },
        target: {
            id: "t1",
            name: "UI Audit Report",
            type: "task",
        },
        metadata: {
            status: "Done",
        },
        projectCategory: "Website Redesign",
        createdAt: "2024-02-19T10:00:00Z",
    },
    {
        id: "2",
        type: "comment",
        actor: {
            id: "u2",
            name: "Michael Torres",
            avatarUrl: "/avatars/michael.png",
        },
        target: {
            id: "t2",
            name: "Database Schema Design",
            type: "task",
        },
        metadata: {
            comment:
                "The indexing looks correct for the new customer profile table.",
        },
        projectCategory: "API Infrastructure",
        createdAt: "2024-02-19T09:30:00Z",
    },
    {
        id: "3",
        type: "project_created",
        actor: {
            id: "system",
            name: "System",
            isSystem: true,
        },
        target: {
            id: "p1",
            name: "Q4 Marketing Campaign",
            type: "project",
        },
        createdAt: "2024-02-19T08:00:00Z",
    },
    {
        id: "4",
        type: "file_attachment",
        actor: {
            id: "u3",
            name: "Alex Morgan",
            avatarUrl: "/avatars/alex.png",
        },
        target: {
            id: "t3",
            name: "Style Guide Update",
            type: "task",
        },
        metadata: {
            attachments: [
                {
                    id: "f1",
                    fileName: "brand-colors.pdf",
                    fileUrl: "/files/brand-colors.pdf",
                },
                {
                    id: "f2",
                    fileName: "typography.pdf",
                    fileUrl: "/files/typography.pdf",
                },
                {
                    id: "f3",
                    fileName: "icons.zip",
                    fileUrl: "/files/icons.zip",
                },
            ],
        },
        projectCategory: "Brand Identity",
        createdAt: "2024-02-19T07:00:00Z",
    },
]

/* ================================
    type activity
================================ */
type TaskCreatedMeta = {
    title: string
}

type TaskStatusChangedMeta = {
    from: string
    to: string
}

type ActivityItemViewProps = {
    name?: string
    action: string
    target?: string
    comment?: string
    createdAt: Date
    category?: string
    extra?: React.ReactNode
    attachments?: {
        id: string
        fileUrl: string
        fileName: string
    }[]
    isSystem?: boolean
}


/* ================================
   Activity Item Component
================================ */

function ActivityItem({
    name,
    action,
    target,
    comment,
    createdAt,
    category,
    extra,
    attachments,
    isSystem,
}: ActivityItemViewProps) {

    const displayName = isSystem ? "System" : name ?? "Unknown"
    const timeLabel = formatDistanceToNow(createdAt, { addSuffix: true })

    return (
        <div className="flex gap-4 p-4">
            <Avatar className="h-9 w-9">
                {!isSystem && (
                    <AvatarImage src="/avatar.png" />
                )}
                <AvatarFallback>
                    {isSystem ? "S" : displayName[0]}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
                <div className="text-sm">
                    <span className="font-medium">{displayName}</span>{" "}
                    <span className="text-muted-foreground">{action} </span>

                    {target && (
                        <span className="text-primary hover:underline cursor-pointer">
                            {target}
                        </span>
                    )}{" "}

                    {extra}
                </div>

                {comment && (
                    <p className="text-sm text-muted-foreground italic border-l-2 pl-3">
                        “{comment}”
                    </p>
                )}

                {attachments?.length ? (
                    <div className="flex gap-2 mt-2">
                        {attachments.map((file) => (
                            <a
                                key={file.id}
                                href={file.fileUrl}
                                className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-xs hover:bg-muted/70"
                            >
                                {file.fileName.split(".").pop()?.toUpperCase()}
                            </a>
                        ))}
                    </div>
                ) : null}

                <div className="text-xs text-muted-foreground">
                    {timeLabel}
                    {category && ` • ${category}`}
                </div>
            </div>
        </div>
    )
}

/* ================================
   Dashboard Header
================================ */

export const DashboardHeader = () => {
    const [data] = useOverview()


    const dashboardStats = [
        {
            title: "Total Projects",
            value: data?.totalProjects ?? 0,
            description: `${data?.activeThisWeek ?? 0} active this week`,
            icon: FolderIcon,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            title: "Tasks Due Today",
            value: data?.tasksDueToday ?? 0,
            description: `Next due in ${data?.nextDueInHours ?? 'not have'} hours`,
            icon: CalendarIcon,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
        },
        {
            title: "Overdue",
            value: data?.overdue,
            description: "Requires attention",
            icon: AlertTriangleIcon,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
        },
        {
            title: "Completed",
            value: data?.completed ?? 0,
            description: `+${data?.completedThisMonth ?? 0} this month`,
            icon: CheckCircle2Icon,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
    ]
    return (
        <div className="w-full">
            <div>
                <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
                <p className="text-sm text-muted-foreground">
                    Welcome back, kachen. Here is a summary of your workspace.
                </p>
            </div>

            <div className="grid md:grid-cols-4  w-full gap-6 mt-6">
                {dashboardStats.map((status) => (
                    <Card key={status.title}>
                        <CardHeader className="flex items-center justify-between">
                            <CardDescription className="text-muted-foreground font-semibold">
                                {status.title}
                            </CardDescription>
                            <div className={`p-2 rounded-md ${status.iconBg}`}>
                                <status.icon
                                    className={`w-4 h-4 ${status.iconColor}`}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="font-semibold text-2xl">
                            <CardTitle>
                                {status.value}

                            </CardTitle>
                        </CardContent>
                        <CardFooter className="text-sm text-muted-foreground">
                            {status.description}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

/* ================================
   Activity Feed Dashboard
================================ */

export const ActivityFeedDashboard = () => {
    const { data } = useGetRecent()

    return (
        <Card className="w-full  flex-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Activity Feed</h2>
                <Button variant="link" size="sm">
                    Filters
                </Button>
            </CardHeader>

            <CardContent className="p-0 max-h-100 overflow-auto">
                {data?.map((a) => (
                    <ActivityItem
                        key={a.id}
                        {...a}
                    />
                ))}
            </CardContent>

            <CardFooter className="justify-center border-t">
                <Button variant="link" size="sm">
                    View Full Activity Log
                </Button>
            </CardFooter>
        </Card>
    )
}


/* ================================
   My Upcoming Tasks
================================ */

type Task = {
    id: string
    title: string
    dueDate: string
    dueType: "today" | "tomorrow" | "weekday"
    category: string
    completed: boolean
}

const tasks: Task[] = [
    {
        id: "1",
        title: "Review Q4 Budget Draft",
        dueDate: "Today, 4:00 PM",
        dueType: "today",
        category: "Finance",
        completed: false,
    },
    {
        id: "2",
        title: "Prep for Client Presentation",
        dueDate: "Tomorrow",
        dueType: "tomorrow",
        category: "Project Alpha",
        completed: false,
    },
    {
        id: "3",
        title: "Prep for Client Presentation",
        dueDate: "Tomorrow",
        dueType: "tomorrow",
        category: "Project Alpha",
        completed: false,
    },
    {
        id: "4",
        title: "Prep for Client Presentation",
        dueDate: "Tomorrow",
        dueType: "tomorrow",
        category: "Project Alpha",
        completed: false,
    },
    {
        id: "5",
        title: "Weekly Team Sync",
        dueDate: "Thursday",
        dueType: "weekday",
        category: "Internal",
        completed: false,
    },
]


export const MyUpcomingTasksDashboard = () => {
    return (
        <Card className="w-full  flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">My Upcoming Tasks</h2>
                <Button variant="link" size="sm">
                    <PlusIcon className="size-6" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-5 max-h-100 overflow-auto">
                {tasks.map((task) => (
                    <Card className="" key={task.id}>
                        <CardContent className="flex gap-3 ">
                            <Checkbox className="mt-1" />
                            <div className="space-y-2">
                                <p className="font-medium">{task.title}</p>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-muted-foreground/20 text-muted-foreground">
                                        {task.dueDate}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {task.category}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>

            <CardFooter>

                <div className="border-2 border-dashed rounded-2xl p-4 text-center text-muted-foreground hover:bg-muted/40 cursor-pointer transition w-full">
                    + Add Task
                </div>
            </CardFooter>
        </Card>
    )
}


/* ================================
   Dashboard Container
================================ */

export const DashboardContainer = ({ children }: { children: React.ReactNode }) => {

    return (
        <EntityContainer header={
            <Suspense fallback={<>Loading...</>}>
                <DashboardHeader />
            </Suspense>

        }>
            <div className="flex gap-10 flex-wrap">
                <ActivityFeedDashboard />
                <MyUpcomingTasksDashboard />
            </div>

        </EntityContainer>
    )
}
