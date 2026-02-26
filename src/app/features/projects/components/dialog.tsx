"use client"

import { EntitySearch } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArchiveIcon, PlusIcon, UserPlus, UserPlusIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import { useSuspenseProjectsPublic } from "../hooks/use-projects"

const formSchema = z.object({
    name: z.string()
        .min(1, "Project name is required")
        .max(100, "Project too long")
    ,
    description: z.string()
        .max(500, "Description too long")
        .optional(),
    visibility: z.enum(["PRIVATE", "PUBLIC"])

})

export type Formtype = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    title?: string
    description?: string
    mode: "create" | "update"
    visibility?: 'PRIVATE' | 'PUBLIC'
}

const DialogProjects = ({ open, onOpenChange, onSubmit, title, description, mode, visibility }: Props) => {


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            visibility: "PRIVATE"
        }
    })

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false)
        form.reset({
        })
    }

    useEffect(() => {
        if (open && mode === 'update') {
            form.reset({
                name: title ?? "",
                description: description ?? "",
                visibility: visibility
            })
        }
    }, [open, title, description, form, visibility])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode === "update" ? "Update Project" : "Create Project"}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the information below to create a new project.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Project Name..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    Give your project a clear and meaningful name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Desription</FormLabel>
                                <FormControl>

                                    <Textarea
                                        placeholder="Describe the project..."
                                        className="min-h-30"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Briefly describe the purpose or goals of this project.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Visibility</FormLabel>
                                    <FormControl>
                                        <ToggleGroup
                                            defaultValue="Private"
                                            type="single"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="w-full bg-muted p-1 rounded-md"

                                        >
                                            <ToggleGroupItem
                                                value="PRIVATE"
                                                className="flex-1 data-[state=on]:bg-background"
                                            >
                                                Private
                                            </ToggleGroupItem>

                                            <ToggleGroupItem
                                                value="PUBLIC"
                                                className="flex-1 data-[state=on]:bg-background"
                                            >
                                                Public
                                            </ToggleGroupItem>


                                        </ToggleGroup>
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
export default DialogProjects

interface PropsJoin {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const projectCard = [
    { iconProject: ArchiveIcon, projectName: 'Marketing Redesign', owner: 'Alex Rivera' }
]

interface ListProjectCardProps {
    Icon: LucideIcon
    projectName: string
    owner: string | undefined
}
const ListProjectCard = ({ Icon, projectName, owner }: ListProjectCardProps) => {


    return (
        <Card className="w-full p-2">
            <div className="flex items-center justify-between">
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3">

                    {/* Icon circle */}
                    <div className="flex items-center justify-center size-10 rounded-full bg-muted">
                        <Icon className="size-5 text-primary" />
                    </div>

                    {/* Text */}
                    <div>
                        <p className="font-medium text-sm">{projectName}</p>
                        <p className="text-xs text-muted-foreground ">
                            Owned by {owner}
                        </p>
                    </div>

                </div>

                {/* RIGHT SIDE BUTTON */}
                <Button size="sm">
                    Send Request
                </Button>

            </div>
        </Card>
    )
}


export const DialogProjectJoin = ({ open, onOpenChange }: PropsJoin) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [projectsPublic] = useSuspenseProjectsPublic()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent >
                <DialogHeader >
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlusIcon className="size-4 text-primary" />
                        Join a Project
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <EntitySearch
                        onChange={setSearchTerm}
                        value={searchTerm}
                        placeholder="Search for projects by name or owner..."
                    />
                </div>
                <DialogFooter className="">
                    <div className="mt-4 flex flex-col gap-3 w-full max-h-100 overflow-auto">
                        {projectsPublic.map((project) => (
                            <ListProjectCard
                                key={project.id}
                                Icon={ArchiveIcon}
                                owner={project.projectMembers[0]?.user?.name ?? "Unknown owner"}
                                projectName={project.name}
                            />
                        ))}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}