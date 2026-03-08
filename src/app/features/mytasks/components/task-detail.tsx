"use client"

import { EntityContainer } from "@/app/components/entity-components"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/trpc/client"
import { AppRouter } from "@/trpc/routers/_app"
import { inferRouterOutputs } from "@trpc/server"
import { formatDistanceToNow } from "date-fns"
import { BookCopy, Calendar1, MessageSquare, Pencil, Send, SendHorizonal, Share2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type RouterOutputs = inferRouterOutputs<AppRouter>
type Task = RouterOutputs["tasks"]["getDetailTask"]
type TaskDetailHeaderProps = {
    task: Task
}
export const TaskDetailHeader = ({ task }: TaskDetailHeaderProps) => {
    return (
        <div className="w-full flex justify-between items-center">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{task?.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {task?.project.name} • Task ID: {task?.id}
                    </p>
                </div>

            </div>
            <Button className="cursor-pointer" variant={'ghost'} asChild>
                <Link href={'/my-tasks'} >
                    <X className="text-muted-foreground" />
                </Link>
            </Button>
        </div>
    )
}

export const TaskDetailsSection = ({ task }: { task: Task }) => {

    const formattedDueDate = task?.dueDate
        ? new Date(task.dueDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "No due date"
    return (
        <div className="min-h-full flex flex-col gap-4 ">

            <div className="space-y-4">
                <h1 className="font-semibold text-primary text-lg tracking-wide uppercase">Description</h1>
                <p>{task?.description}</p>

            </div>

            <div className="flex justify-between gap-4">
                <div className="">
                    <label className="font-semibold text-primary text-lg tracking-wide uppercase">Reporter</label>
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={task?.createdBy?.image ?? ''} />
                            <AvatarFallback>
                                {task?.createdBy?.name?.[0]?.toUpperCase() ?? "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="">
                            <h1 className="font-semibold text-sm">{task?.createdBy?.name}</h1>
                            <p className="text-muted-foreground text-xs">{task?.createdBy?.projectMembers[0].role}</p>
                        </div>
                    </div>
                </div>

                <div className="">
                    <label className="font-semibold text-primary text-lg uppercase">Due Date</label>
                    <div className="flex items-center gap-2  text-sm text-muted-foreground">
                        <Calendar1 className="h-4 w-4 text-primary" />
                        {formattedDueDate}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="font-semibold text-primary text-lg tracking-wide uppercase">Activity Log</h1>

                <div className=" max-h-70 overflow-auto  space-y-6">
                    {task?.activityLogs.map((a) => {
                        const name = a.name?.split(" ").map((n, i) => (i === 0 ? n : `${n[0]}.`)).join(" ")
                        return (
                            <div className="flex items-start gap-3 ">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <Pencil className="h-4 w-4" />
                                </div>


                                <div className="text-sm">
                                    <p>
                                        <span className="font-medium">{name}</span>{" "}
                                        {a.action}{" "}
                                        <span className="text-primary">{a.target}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                        )
                    })}

                </div>

            </div>

        </div >
    )
}

const CommnetInput = () => {
    return (
        <div className="bg-white p-4 border flex items-end gap-2">
            <Textarea
                placeholder="Write a comment..."
                className="resize-none min-h-10 max-h-50"
            />
            <Button>
                <SendHorizonal className=" text-white size-4 rounded-md" />
            </Button>
        </div>
    )
}

const CommentEmptyState = () => {
    return (
        <div className=" w-full h-full flex flex-col text-center  justify-center items-center gap-4">
            <span className="bg-background  p-8 rounded-full">
                <MessageSquare className="text-muted-foreground size-10" />
            </span>
            <div className="space-y-2">
                <h1 className="font-semibold text-lg text-primary">No comments yet</h1>
                <p className="text-xs text-muted-foreground">Be the first start to conversation!</p>
            </div>
        </div>
    )
}

const CommentItem = () => {
    return (
        <>
            <div className="flex gap-2 ">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white">hi</AvatarFallback>
                </Avatar>
                <div className="">


                    <div className="flex-1 rounded-2xl rounded-tl-none  max-w-140  bg-white p-4 text-sm">
                        <h1>text message text message text message text message text message text message </h1>
                    </div>
                    <span className="text-xs text-muted-foreground">Kachen.•1H AGO</span>
                </div>

            </div>
        </>
    )
}

export const TaskDetailComments = ({ task }: { task: Task }) => {
    const comments = task?.comments ?? []
    return (
        <div className="space-y-4 flex flex-col h-140 ">
            <header className="flex justify-between">
                <h1 className="font-semibold text-primary text-lg tracking-wide uppercase">COLLABORATION</h1>
                <Badge>3 comment</Badge>
            </header>
            <main className="flex-1 max-h-130 overflow-auto ">
                {comments.length > 0
                    ? <CommentItem />
                    : <CommentEmptyState />
                }
            </main>


        </div>

    )
}



export const TaskDetailContainer = ({ children, taskId }: { children: React.ReactNode, taskId: string }) => {
    const { data } = trpc.tasks.getDetailTask.useQuery({ taskId })
    console.log(data);

    if (!data) {
        return <div className="p-10">Loading...</div>
    }
    return (
        <EntityContainer
            header={<TaskDetailHeader task={data} />}
        >
            <div className="flex flex-col md:flex-row border-t -ml-10 ">
                <div className="flex-1 pr-10 pt-10 pl-10 ">
                    <TaskDetailsSection task={data} />
                </div>

                <div className="flex-1 border-l border-border bg-muted flex flex-col -mr-10">
                    <div className="pl-10 pr-10 pt-10 ">
                        <TaskDetailComments task={data} />
                    </div>

                    <CommnetInput />
                </div>
            </div>

            <div className="bg-muted h-full -mx-10 -mt-4 -mb-6 flex items-center justify-between px-10">
                <div className="space-x-8">
                    <Button className="" variant={'ghost'}>
                        <Share2 />
                        Share Task
                    </Button>
                    <Button className="" variant={'ghost'}>
                        <BookCopy />
                        Duplicate
                    </Button>
                </div>
                <div className="">
                    <div className="space-x-8">
                        <Button className="" variant={'ghost'}>
                            Archive
                        </Button>
                        <Button className="" >
                            Complete Task
                        </Button>
                    </div>
                </div>
            </div>
        </EntityContainer>
    )
}