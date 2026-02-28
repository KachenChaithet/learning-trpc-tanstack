"use client"

import { EntitySearch } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArchiveIcon, FileClock, PlusIcon, UserPlus, UserPlusIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import { useApproveJoinRequest, useRejectJoinRequest, useRequestCancelJoinProject, useRequestJoinProject, useSuspenseProjectJoinRequests, useSuspenseProjectsPublic } from "../hooks/use-projects"
import Image from "next/image"

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



interface ListProjectCardProps {
    Icon: LucideIcon
    projectName: string
    projectId: string
    owner: string | undefined
    status: "APPROVED" | "REJECTED" | "PENDING"
}


const ListProjectCard = ({ Icon, projectName, owner, projectId, status }: ListProjectCardProps) => {
    const { mutate, isPending } = useRequestJoinProject()

    const { mutate: cancelMutate, isPending: isCancelPending } = useRequestCancelJoinProject()
    const handleClick = () => {
        if (status === "PENDING") {
            cancelMutate({ projectId })
        } else {
            mutate({ projectId })
        }
    }

    const getVariant = () => {
        if (status === 'APPROVED') return "secondary"
        if (status === 'REJECTED') return "destructive"
        if (status === "PENDING") return "outline"
        return "default"
    }

    const getLabel = () => {
        if (isPending) return "Sending..."
        if (isCancelPending) return "Cancelling..."

        switch (status) {
            case "PENDING":
                return "Cancel Request"
            case "APPROVED":
                return "You are a member"
            case "REJECTED":
                return "Request Rejected"
            default:
                return "Send Request"
        }
    }
    return (
        <Card className="w-full p-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">

                    <div className="flex items-center justify-center size-10 rounded-full bg-muted">
                        <Icon className="size-5 text-primary" />
                    </div>

                    <div>
                        <p className="font-medium text-sm">{projectName}</p>
                        <p className="text-xs text-muted-foreground ">
                            Owned by {owner}
                        </p>
                    </div>

                </div>

                <Button
                    size="sm"
                    variant={getVariant()}
                    disabled={
                        isPending ||
                        isCancelPending ||
                        status === "APPROVED" ||
                        status === 'REJECTED'
                    }
                    onClick={handleClick}
                >
                    {getLabel()}
                </Button>

            </div>
        </Card >
    )
}



export const DialogProjectJoin = ({ open, onOpenChange }: PropsJoin) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [projectsPublic] = useSuspenseProjectsPublic()
    const filteredPublicProjects = projectsPublic.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        (p.owner ?? "").toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLocaleLowerCase())
    )

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
                        {filteredPublicProjects.map((project) => (
                            <ListProjectCard
                                key={project.id}
                                projectId={project.id}
                                Icon={ArchiveIcon}
                                owner={project.owner ?? undefined}
                                projectName={project.name}
                                status={project.JoinRequestStatus}
                            />
                        ))}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


interface PropsRequest {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const projectCard = [
    { ImageProfile: 'https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png', userName: 'Kachen Chiyathet', projectName: 'Marketing Redesign' },
    { ImageProfile: 'https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png', userName: 'Kachen Chiyathet', projectName: 'Marketing Art' },
    { ImageProfile: 'https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png', userName: 'Kachen Chiyathet', projectName: 'Marketing computer' },
    { ImageProfile: 'https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png', userName: 'Kachen Chiyathet', projectName: 'Marketing 2' },
    { ImageProfile: 'https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png', userName: 'Kachen Chiyathet', projectName: 'Marketing 21' },
]

interface projectCardRequestProps {
    ImageProfile: string
    userName: string
    projectName: string
    RequestId: string
}

const ProjectCardRequest = ({ ImageProfile, userName, projectName, RequestId }: projectCardRequestProps) => {

    const { mutate: approveJoin, isPending: isApproving } = useApproveJoinRequest()
    const { mutate: rejectJoin, isPending: isRejecting } = useRejectJoinRequest()
    return (
        <Card className="w-full p-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Image src={ImageProfile} alt='User profile' width={50} height={50} className="rounded-full" />

                    <div className="">
                        <p className="text-sm font-semibold">{userName}</p>
                        <p className="text-xs text-muted-foreground ">wants to join {projectName}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant={'outline'} onClick={() => rejectJoin({ requestId: RequestId })} disabled={isRejecting}>
                        Reject
                    </Button>
                    <Button onClick={() => approveJoin({ requestId: RequestId })} disabled={isApproving}>
                        Accept
                    </Button>
                </div>

            </div>
        </Card>
    )
}



export const DialogProjectRequest = ({ open, onOpenChange }: PropsRequest) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [joinRequests] = useSuspenseProjectJoinRequests()

    const filteredJoinRequests = joinRequests.filter((j) =>
        j.userName?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        j.projectName.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())


    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <FileClock className="size-4 text-primary" />
                        Manage Join Requests
                    </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="mt-4">
                    <EntitySearch
                        onChange={setSearchTerm}
                        value={searchTerm}
                        placeholder="Search by project or owner..."
                    />
                </div>

                {/* List Section */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground">
                            {joinRequests.length} Pending Requests
                        </p>
                    </div>

                    <div className="space-y-3 max-h-87.5 overflow-y-auto pr-1">
                        {filteredJoinRequests.map((request) => (
                            <ProjectCardRequest
                                key={request.id}
                                ImageProfile={'https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png'}
                                projectName={request.projectName}
                                userName={request.userName ?? "Unknown"}
                                RequestId={request.id}
                            />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}