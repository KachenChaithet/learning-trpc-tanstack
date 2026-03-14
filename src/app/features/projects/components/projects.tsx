"use client"
import { EntityContainer, EntitySearch, EntitySelect } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Banknote, CalendarIcon, Clock, EllipsisVerticalIcon, FileClock, PlusIcon, ReceiptRussianRuble, UserPlusIcon } from "lucide-react"
import React, { Suspense, useState } from "react"
import DialogProjects, { DialogProjectJoin, DialogProjectRequest, Formtype } from "./dialog"
import { useCreateProject, useFilterProject, useRemoveProject, useSuspenseProjectsMine, useUpdateProject } from "../hooks/use-projects"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { trpc } from "@/trpc/client"
import { AppRouter } from "@/trpc/routers/_app"
import { inferRouterOutputs } from "@trpc/server"
import { useRouter } from "next/navigation"



const projectStatusOptions = [
    { label: "Planning", value: "planning" },
    { label: "In Progress", value: "in_progress" },
    { label: "On Hold", value: "on_hold" },
    { label: "Completed", value: "completed" },
]

type Owners = {
    value: string
    label: string
}

export const owners: Owners[] = [
    {
        label: "Alice Johnson",
        value: "Alice Johnson",
    },
    {
        label: "Bob Smith",
        value: "Bob Smith",
    },
    {
        label: "Charlie Lee",
        value: "Charlie Lee",
    },
]




export const ProjectHeader = () => {

    return (
        <div className="w-full ">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Project</h1>
                <div className="space-x-2">
                    <span>
                        <CreateProjectDialog
                            mode="create"
                            trigger={
                                <Button>
                                    <PlusIcon className="size-4" />
                                    <span>Add Project</span>
                                </Button>
                            }

                        />
                    </span>
                    <span>
                        <ProjectJoin
                            trigger={
                                <Button>
                                    <UserPlusIcon className="size-4" />
                                    <span>Join</span>
                                </Button>
                            }
                        />
                    </span>
                    <span>
                        <ProjectRequest
                            trigger={
                                <Button>
                                    <FileClock className="size-4" />
                                    <span>Request</span>
                                </Button>
                            }
                        />
                    </span>

                </div>
            </div>

        </div>
    )
}

interface CreateProjectProps {
    trigger?: React.ReactNode
    title?: string
    description?: string
    mode: "create" | "update"
    projectId?: string
    visibility?: 'PRIVATE' | 'PUBLIC'
}


export const CreateProjectDialog = ({ trigger, title, description, mode, projectId, visibility }: CreateProjectProps) => {

    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutate: createProject, isPending: isCreating } = useCreateProject()
    const handleSubmit = (values: Formtype) => {
        if (mode === 'create') {
            createProject({
                name: values.name,
                description: values.description,
                visibility: values.visibility
            }, {
                onSuccess: () => {
                    setDialogOpen(false)
                }
            })
        }
    }

    return (
        <>
            <div className="contents" onClick={() => setDialogOpen(true)} >
                {trigger}
            </div>


            <DialogProjects
                mode={mode}
                title={title}
                description={description}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                visibility={visibility}
            />
        </>
    )
}

interface ProjectJoinProps {
    trigger?: React.ReactNode
}

export const ProjectJoin = ({ trigger }: ProjectJoinProps) => {
    const [dialogOpen, setDialogOpen] = useState(false)


    return (
        <>
            <div className="contents" onClick={() => setDialogOpen(true)} >
                {trigger}
            </div>

            <Suspense fallback={<Spinner />}>
                {dialogOpen && (
                    <DialogProjectJoin
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                    />
                )}
            </Suspense>
        </>
    )
}

export const ProjectRequest = ({ trigger }: ProjectJoinProps) => {
    const [dialogOpen, setDialogOpen] = useState(false)


    return (
        <>
            <div className="contents" onClick={() => setDialogOpen(true)} >
                {trigger}
            </div>

            <Suspense fallback={<Spinner />}>
                {dialogOpen && (
                    <DialogProjectRequest
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                    />
                )}
            </Suspense>
        </>
    )
}

type ProjectSearchProps = {
    search: string
    setSearch: (value: string) => void
}

export const ProjectSearch = ({ search, setSearch }: ProjectSearchProps) => {

    return (
        <EntitySearch
            value={search}
            onChange={(value) =>
                setSearch(value)

            }
            placeholder="Search projects"
        />
    )
}
type ProjectSelectProps = {
    filters: ProjectFiltersState
    onChage: (filters: ProjectFiltersState) => void
    ownerOptions: { value: string, label: string }[]
}

export const ProjectSelect = ({ filters, onChage, ownerOptions }: ProjectSelectProps) => {
    return (
        <div className="flex gap-2">
            <EntitySelect

                value={filters.status}
                onChange={(value) =>
                    onChage({ ...filters, status: value as ProjectFiltersState['status'] })
                }
                options={projectStatusOptions}
                placeholder="Select status"

            />
            <EntitySelect
                value={filters.owner}
                onChange={(value) =>
                    onChage({ ...filters, owner: value })
                }
                options={ownerOptions}
                placeholder="Select Owner"
            />
        </div>
    )
}



type ProjectCardProps = {
    title: string
    description?: string
    totalTasks?: number
    completedTasks?: number
    progress?: number
    avatars?: number
    extraMembers?: number
    dueDate?: string
    id: string
    visibility: 'PRIVATE' | 'PUBLIC'
}

export const projects: ProjectCardProps[] = [
    {
        "id": "1",
        "title": "Q4 Marketing Launch",
        "description": "Preparation and execution of the year-end marketing...",
        "progress": 65,
        "avatars": 3,
        "extraMembers": 2,
        "dueDate": "2023-12-15",
        "visibility": 'PRIVATE'
    },
    {
        "id": "2",
        "title": "Website Redesign",
        "description": "UI/UX improvement and performance optimization...",
        "progress": 40,
        "avatars": 4,
        "extraMembers": 1,
        "dueDate": "2023-11-30",
        "visibility": 'PRIVATE'
    },
    {
        "id": "3",
        "title": "Mobile App Development",
        "description": "Building core features and API integration...",
        "progress": 80,
        "avatars": 5,
        "extraMembers": 0,
        "dueDate": "2023-12-20",
        "visibility": 'PRIVATE'
    }
]

export const ProjectCard = ({ title, description, avatars, progress, completedTasks, totalTasks, extraMembers, dueDate, id, visibility }: ProjectCardProps) => {
    const removeProject = useRemoveProject()

    const handleRemove = () => {
        removeProject.mutate({ id: id })

    }
    const router = useRouter()


    return (
        <Card className="max-w-xs ">
            <CardHeader className="flex items-center justify-between">
                <div className="w-8 h-8 bg-blue-200 flex items-center justify-center rounded-md text-blue-700">
                    <Banknote />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted">
                            <EllipsisVerticalIcon className="size-4" />
                        </button>

                    </DropdownMenuTrigger>


                    <DropdownMenuContent align="end">

                        <DropdownMenuItem onClick={() => router.push(`/projects/${id}/settings`)}>
                            Settings
                        </DropdownMenuItem>


                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent >
                <h1 className="font-semibold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="flex items-end justify-center flex-col w-full">
                    <p className="text-muted-foreground text-sm">tasks</p>
                    <p className="font-semibold">{completedTasks} / {totalTasks}</p>
                </div>
                <div className="w-full">
                    <div className=" flex items-center justify-between ">
                        <p className="text-muted-foreground">Progress</p>
                        <p className="text-primary">{progress}%</p>
                    </div>
                    <Progress value={progress} />

                </div>

                {dueDate && (
                    <div className="text-muted-foreground flex items-center justify-end w-full gap-2">
                        <CalendarIcon className="size-4" />
                        <span className="text-sm">{new Date(dueDate).toLocaleDateString()}</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}

export const ProjectCardAdd = () => {
    return (
        <CreateProjectDialog
            mode="create"
            trigger={<Card className="max-w-xs border-4 border-dashed flex items-center justify-center text-muted-foreground hover:bg-gray-50">

                <PlusIcon />
                <span className="font-semibold">Create New Project</span>
                <span className="text-sm">Starf from scratch or template</span>
            </Card>}
        />

    )
}
type RouterOutputs = inferRouterOutputs<AppRouter>
type Project = RouterOutputs["projects"]["filterProjects"][number]
type ProjectListProps = {
    projects: Project[]
}
export const ProjectList = ({ projects }: ProjectListProps) => {



    return (
        <>
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.name}
                    description={project.description ?? undefined}
                    visibility={project.visibility}
                    progress={project.progress}
                    completedTasks={project.completedTasks}
                    totalTasks={project.totalTasks}
                />

            ))}
            <ProjectCardAdd />
        </>
    )
}
type ProjectContainerProps = {
    children: React.ReactNode
}
type ProjectFiltersState = {
    search: string
    status: "planning" | "in_progress" | "on_hold" | "completed"
    owner: string
}

export const ProjectContainer = ({ children }: ProjectContainerProps) => {
    const [filters, setFilters] = useState<ProjectFiltersState>({
        search: '',
        status: "planning",
        owner: "",
    })
    const { data: owners } = trpc.projects.ownerProject.useQuery()

    const { data: projects = [], isLoading: isProjects } = useFilterProject(filters)


    const ownerOptions = owners?.map((o) => ({
        value: o.id,
        label: o.name ?? "Unknow User"
    })) ?? []
    return (
        <EntityContainer
            header={<ProjectHeader />}
            search={<ProjectSearch search={filters.search} setSearch={(value) => setFilters((prev) => ({
                ...prev,
                search: value
            }))} />}
            select={<ProjectSelect filters={filters} onChage={setFilters} ownerOptions={ownerOptions} />}
        >
            <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
                {
                    isProjects ? (
                        <Spinner className="size-8 text-muted-foreground" />
                    ) : (
                        <ProjectList projects={projects} />
                    )
                }
            </div>
        </EntityContainer>
    )
}