"use client"

import { EntitySelect } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import z from "zod"

const formSchema = z.object({
    title: z.string()
        .min(1, "Project name is required")
        .max(100, "Project too long")
    ,
    description: z.string()
        .max(500, "Description too long")
        .optional()
    , projectId: z.string(),
    assigneeId: z.string().min(1, "Assignee is required"),


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

        }
    })

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false)
        form.reset({
        })
    }

    useEffect(() => {
        if (open) {
            form.reset({
                title: title ?? "",
                description: description ?? ""
            })
        }
    }, [open, title, description, form])

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
                        <FormField control={form.control} name="assigneeId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Assignee</FormLabel>
                                <EntitySelect
                                    
                                    onChange={field.onChange}
                                    value={field.value}
                                    options={[
                                        { label: "guy", value: "s" },
                                        { label: "kar", value: "IX2NS4DFAIXslVWOMgSUeZqzkM8DDQnW" }
                                    ]}
                                    placeholder="Choose user"
                                />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="projectId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Project</FormLabel>
                                <EntitySelect
                                    onChange={field.onChange}
                                    value={field.value}
                                    options={[
                                        { label: "gotostart", value: "s" },
                                        { label: "computer", value: "cmm0htfb8000er8vdu8tlyavi" }
                                    ]}
                                    placeholder="Choose project"
                                />
                                <FormMessage />
                            </FormItem>
                        )} />

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