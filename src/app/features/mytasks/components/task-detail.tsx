import { EntityContainer } from "@/app/components/entity-components"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar1, Pencil, Send, SendHorizonal } from "lucide-react"


export const TaskDetailHeader = () => {
    return (
        <div className="w-full ">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Task Name</h1>
                    <p className="text-sm text-muted-foreground">
                        project Name
                    </p>
                </div>

            </div>
        </div>
    )
}

export const TaskDetailsSection = () => {
    return (
        <div className="space-y-4">

            <div className="space-y-4">
                <h1 className="font-semibold text-primary text-lg tracking-wide uppercase">Description</h1>
                <p>Review and finalize the quarterly budget report for Q3.
                    Ensure all departments have submitted their final spending tallies
                    and reconcile any discrepancies found in the July audit.</p>
                <ul className="list-disc pl-5" >
                    <li>Verify IT infrastructure expenditure</li>
                    <li>Sync with HR on hiring bonuses</li>
                    <li>Prepare visualization charts for the executive meeting</li>
                </ul>
            </div>

            <div className="flex justify-between gap-4">
                <div className="">
                    <label className="font-semibold text-primary text-lg tracking-wide uppercase">Assignee</label>
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarFallback>ka</AvatarFallback>
                        </Avatar>
                        <div className="">
                            <h1 className="font-semibold text-sm">Kachen chiyathet</h1>
                            <p className="text-muted-foreground text-xs">Owner</p>
                        </div>
                    </div>
                </div>
                <div className="">
                    <label className="font-semibold text-primary text-lg uppercase">Due Date</label>
                    <div className="flex items-center gap-2  text-sm text-muted-foreground">
                        <Calendar1 className="h-4 w-4 text-primary" />
                        {new Date().toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="font-semibold text-primary text-lg tracking-wide uppercase">Activity Log</h1>
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Pencil className="h-4 w-4" />
                    </div>

                    <div className="text-sm">
                        <p>
                            <span className="font-medium">Kachen B.</span>{" "}
                            changed status to{" "}
                            <span className="text-primary">In Progress</span>
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
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

export const TaskDetailComments = () => {
    return (
        <div className="space-y-4 min-h-140">
            <header className="flex justify-between">
                <h1 className="font-semibold text-primary text-lg tracking-wide uppercase">COLLABORATION</h1>
                <Badge>3 comment</Badge>
            </header>
            <main className="max-h-150 overflow-auto">
                <CommentItem />
                <CommentItem />
            </main>

        </div>

    )
}



export const TaskDetailContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<TaskDetailHeader />}

        >
            <div className="flex flex-col md:flex-row border-t -ml-10 ">
                <div className="flex-1 pr-10 pt-10 pl-10">
                    <TaskDetailsSection />
                </div>

                <div className="flex-1 border-l border-border bg-muted flex flex-col -mr-10">
                    <div className="pl-10 pr-10 pt-10 ">
                        <TaskDetailComments />
                    </div>

                    <CommnetInput />
                </div>
            </div>

            <div className="bg-muted h-full -mx-10 -mt-4"></div>
        </EntityContainer>
    )
}