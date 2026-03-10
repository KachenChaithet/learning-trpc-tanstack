"use client"

import { EntityContainer } from "@/app/components/entity-components"
import NotFound from "@/app/features/mytasks/components/not-found"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
import { socket } from "@/lib/socket"
import { trpc } from "@/trpc/client"
import { AppRouter } from "@/trpc/routers/_app"
import { inferRouterOutputs } from "@trpc/server"
import { formatDistanceToNow } from "date-fns"
import { BookCopy, Calendar1, FolderClosed, MessageSquare, Pencil, Send, SendHorizonal, Share2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useDuplicateTask, useUpdateArchive, useUpdateStatus } from "../hooks/use-tasks"

type RouterOutputs = inferRouterOutputs<AppRouter>
type Task = RouterOutputs["tasks"]["getDetailTask"]
type Comments = RouterOutputs["tasks"]["getTaskComments"][number]
type TaskDetailHeaderProps = {
    task: Task
}
export const TaskDetailHeader = ({ task }: TaskDetailHeaderProps) => {
    return (
        <div className="w-full flex justify-between items-center">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{task?.title}</h1>
                    <p className="text-sm text-muted-foreground flex  items-center gap-2">
                        <FolderClosed className="size-4" /> {task?.project.name} • Task ID: {task?.id}
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
                            <div className="flex items-start gap-3 " key={a.id}>
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
type CommnetInputprops = {
    message: string
    setMessage: (message: string) => void
    onSubmit: () => void
}
const CommnetInput = ({ message, setMessage, onSubmit }: CommnetInputprops) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSubmit()
        }
    }
    return (
        <div className="bg-white p-4 border flex items-end gap-2">
            <Textarea
                placeholder="Write a comment..."
                className="resize-none min-h-10 max-h-50"
                value={message}
                onChange={(value) => setMessage(value.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button onClick={onSubmit}>
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

type CommentItemProps = {
    comment: Comments
}
const CommentItem = ({ comment }: CommentItemProps) => {
    const { data: session } = authClient.useSession()


    const isMe = comment.author.id === session?.user.id
    const name = comment.author.name?.split(" ").map((n, i) => n[0]).join('').toUpperCase()

    return (
        <>
            <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.image ?? "Unknow User"} />
                    <AvatarFallback className="bg-white">{name}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                    <div className={`inline-block max-w-140  p-4 text-sm break-all 
                    ${isMe
                            ? 'rounded-2xl rounded-tr-none bg-primary text-white'
                            : "rounded-2xl rounded-tl-none bg-white "
                        } `}>
                        {comment.message}
                    </div>
                    <span className="text-xs text-muted-foreground ">{comment.author.name} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                </div>

            </div>
        </>
    )
}

export const TaskDetailComments = ({ comments }: { comments: Comments[] }) => {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comments])
    return (
        <div className="space-y-4 flex flex-col h-140 ">
            <header className="flex justify-between">
                <h1 className="font-semibold text-primary text-lg tracking-wide uppercase">COLLABORATION</h1>
                <Badge>{comments.length} comment</Badge>
            </header>
            <main className="flex-1 max-h-130 overflow-auto flex flex-col gap-4">
                {comments.length > 0
                    ? (
                        comments.map((c) => (
                            <CommentItem key={c.id} comment={c} />
                        ))
                    )
                    : <CommentEmptyState />
                }
                <div ref={bottomRef} />
            </main>


        </div>

    )
}



export const TaskDetailContainer = ({ children, taskId }: { children: React.ReactNode, taskId: string }) => {

    const { data, isLoading } = trpc.tasks.getDetailTask.useQuery({ taskId })
    const [form, setForm] = useState({
        message: ''
    })

    const { mutate: updateStatus } = useUpdateStatus()
    const { mutate: updateArchive, isPending: isupdateArchive } = useUpdateArchive()
    const { mutate: duplicateTask, isPending: isduplicateTask } = useDuplicateTask()

    const utils = trpc.useUtils()

    const { mutate: createComment } = trpc.tasks.createComment.useMutation({
        onSuccess: (comment) => {
            socket.emit("send-comment", comment)
        }
    })
    const { data: comments = [] } = trpc.tasks.getTaskComments.useQuery({ taskId })

    useEffect(() => {
        socket.emit('join-task', taskId)
        const handleNewComment = (comment: Comments) => {
            utils.tasks.getTaskComments.setData({ taskId }, (old) => {
                if (!old) return [comment]

                const exists = old.some((c) => c.id === comment.id)
                if (exists) return old

                return [...old, comment]
            })
        }
        socket.on("new-comment", handleNewComment)

        return () => {
            socket.off('new-comment', handleNewComment)
            socket.emit('leave-task', taskId)
        }

    }, [taskId, utils])



    const handleSubmitComment = () => {
        createComment({ message: form.message, taskId })
        setForm((prev) => ({ ...prev, message: '' }))
    }


    if (isLoading) {
        return <div className="p-10">Loading...</div>
    }
    if (!data) {
        return <NotFound />
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
                        <TaskDetailComments comments={comments} />
                    </div>

                    <CommnetInput onSubmit={handleSubmitComment} message={form.message} setMessage={(msg) => setForm((prev) => ({ ...prev, message: msg }))} />
                </div>
            </div>

            <div className="bg-muted h-full -mx-10 -mt-4 -mb-6 flex items-center justify-between px-10">
                <div className="space-x-8">
                    <Button className="" variant={'ghost'}
                        onClick={async () => {
                            await navigator.clipboard.writeText(`${window.location.origin}/my-tasks/${taskId}`)
                            toast.success("copy successfully!")
                        }}
                    >
                        <Share2 />
                        Share Task
                    </Button>
                    <Button
                        variant={'ghost'}
                        disabled={isduplicateTask}
                        onClick={() => duplicateTask({ taskId })}
                    >
                        <BookCopy />
                        Duplicate
                    </Button>
                </div>
                <div className="">
                    <div className="space-x-8">
                        <Button
                            variant={'ghost'}
                            disabled={isupdateArchive}
                            onClick={() => updateArchive({ taskId })}
                        >
                            Archive
                        </Button>
                        <Button
                            disabled={data.status === 'DONE'}
                            onClick={() => updateStatus({ status: "DONE", taskId })}
                        >
                            Complete Task
                        </Button>
                    </div>
                </div>
            </div>
        </EntityContainer >
    )
}