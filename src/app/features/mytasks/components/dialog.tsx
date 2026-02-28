"use client"

import { EntitySelect } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ChevronDownIcon, PlusIcon } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import { useMyProjects, useProjectMembers } from "../hooks/use-tasks"

const formSchema = z.object({
    title: z.string()
        .min(1, "Project name is required")
        .max(100, "Project too long")
    ,
    description: z.string()
        .max(500, "Description too long")
        .optional(),
    projectId: z.string().min(1, "Selected Project is required"),
    assigneeId: z.string().min(1, "Assignee is required"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"])
        .optional(),

    status: z.enum(["TODO", "IN_PROGRESS", "DONE"])
    ,
    dueDate: z.date().optional()


})
export type Formtype = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    title?: string
    description?: string
    mode: "create" | "update"
}

const DialogTask = ({ open, onOpenChange, onSubmit, title, description, mode }: Props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            assigneeId: "",
            projectId: "",
            dueDate: undefined,
            priority: "LOW",
            status: "TODO",
        }
    })
    const selectedProjectId = form.watch('projectId')

    const { data: members, error, isLoading: membersLoading } = useProjectMembers(selectedProjectId)
    const { data: projects, isLoading: projectsLoading } = useMyProjects()

    console.log(members);
    

    const assigneeOptions =
        members?.map((m) => ({
            value: m.userId,
            label: m.userName ?? m.userEmail,
        })) ?? []

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false)
        form.reset({
        })
    }

    useEffect(() => {
        if (open && mode === "update") {
            form.reset({
                title: title ?? "",
                description: description ?? "",
                assigneeId: "",
                projectId: "",
                dueDate: undefined,
                priority: "LOW",
            })
        }
    }, [open, title, description, form])

    useEffect(() => {
        if (!selectedProjectId) return
        form.setValue("assigneeId", "")
    }, [selectedProjectId, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode === "update" ? "Update Task" : "Create Task"}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the information below to create a new Task.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Task Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tasl Name..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    Give your task a clear and meaningful name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Task Desription</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe the task..."
                                        className="min-h-30"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Briefly describe the purpose or goals of this task.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="assigneeId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Assignee</FormLabel>
                                    <EntitySelect
                                        disabled={!selectedProjectId || membersLoading}
                                        onChange={field.onChange}
                                        value={field.value}
                                        options={assigneeOptions}
                                        placeholder="Choose user"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="projectId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Project</FormLabel>
                                    <EntitySelect
                                        disabled={projectsLoading}
                                        onChange={field.onChange}
                                        value={field.value}
                                        options={projects?.map((p) => ({
                                            value: p.id, label: p.name
                                        })) ?? []}
                                        placeholder="Choose project"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <FormControl>
                                            <ToggleGroup
                                                defaultValue="LOW"
                                                type="single"
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className="w-full bg-muted p-1 rounded-md"

                                            >
                                                <ToggleGroupItem
                                                    value="LOW"
                                                    className="flex-1 data-[state=on]:bg-background"
                                                >
                                                    LOW
                                                </ToggleGroupItem>

                                                <ToggleGroupItem
                                                    value="MEDIUM"
                                                    className="flex-1 data-[state=on]:bg-background"
                                                >
                                                    MEDIUM
                                                </ToggleGroupItem>

                                                <ToggleGroupItem
                                                    value="HIGH"
                                                    className="flex-1 data-[state=on]:bg-background"
                                                >
                                                    HIGH
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Status</FormLabel>
                                    <EntitySelect
                                        onChange={field.onChange}
                                        value={field.value}

                                        options={[
                                            { label: "todo", value: "TODO" },
                                            { label: "in-progress", value: "IN_PROGRESS" },
                                            { label: "done", value: "DONE" }
                                        ]}
                                        placeholder="Choose project"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem >
                                    <FormLabel>Due Date</FormLabel>
                                    <FormControl >
                                        <Popover >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-auto justify-between font-normal"
                                                >
                                                    {field.value
                                                        ? format(field.value, "PPP")
                                                        : "Select date"}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent
                                                className="w-auto overflow-hidden p-0 "
                                                align="start"

                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    captionLayout="dropdown"
                                                    defaultMonth={field.value ?? new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button>
                            <PlusIcon className="size-4" />
                            {mode === 'update' ? "Update" : "Create"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}
export default DialogTask