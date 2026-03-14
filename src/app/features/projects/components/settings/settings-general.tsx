"use client"

import { trpc } from "@/trpc/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { toast } from "sonner"
import { useEffect } from "react"

const formSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100),
    description: z.string().max(500).optional(),
    visibility: z.enum(["PRIVATE", "PUBLIC"])
})

type FormType = z.infer<typeof formSchema>

interface Props {
    projectId: string
}

export const GeneralSettings = ({ projectId }: Props) => {
    const { data: projects = [] } = trpc.projects.getMine.useQuery()
    const project = projects.find((p) => p.id === projectId)

    const updateProject = trpc.projects.update.useMutation({
        onSuccess: () => toast.success("Project updated"),
        onError: (err) => toast.error(err.message)
    })

    const removeProject = trpc.projects.remove.useMutation({
        onSuccess: () => {
            toast.success("Project deleted")
            window.location.href = "/projects"
        },
        onError: (err) => toast.error(err.message)
    })

    const form = useForm<FormType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            visibility: "PRIVATE"
        }
    })

    // set ค่าจาก project ที่ดึงมา
    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name,
                description: project.description ?? "",
                visibility: project.visibility
            })
        }
    }, [project, form])

    const onSubmit = (values: FormType) => {
        updateProject.mutate({
            id: projectId,
            name: values.name,
            description: values.description,
            visibility: values.visibility
        })
    }

    return (
        <div className="space-y-6 mt-4">
            <Card className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Project Name..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe the project..." className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="visibility" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Visibility</FormLabel>
                                <FormControl>
                                    <ToggleGroup
                                        type="single"
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="w-full bg-muted p-1 rounded-md"
                                    >
                                        <ToggleGroupItem value="PRIVATE" className="flex-1 data-[state=on]:bg-background">
                                            Private
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="PUBLIC" className="flex-1 data-[state=on]:bg-background">
                                            Public
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </FormControl>
                                <FormDescription>
                                    Private projects are only visible to members
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Button disabled={updateProject.isPending}>
                            {updateProject.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </Form>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-red-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-red-600">Delete Project</p>
                        <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                    </div>
                    <Button
                        variant="destructive"
                        disabled={removeProject.isPending}
                        onClick={() => removeProject.mutate({ id: projectId })}
                    >
                        {removeProject.isPending ? "Deleting..." : "Delete Project"}
                    </Button>
                </div>
            </Card>
        </div>
    )
}