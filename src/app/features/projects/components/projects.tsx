"use client"
import { EntityContainer, EntitySearch, EntitySelect } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Banknote, CalendarIcon, EllipsisVerticalIcon, PlusIcon, ReceiptRussianRuble } from "lucide-react"
import { useState } from "react"



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
                <Button>
                    <PlusIcon className="size-4" />
                    <span>Add Project</span>
                </Button>
            </div>
        </div>
    )
}

export const ProjectSearch = () => {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <EntitySearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search projects"
        />
    )
}

export const ProjectStatusSelect = () => {
    const [status, setStatus] = useState("")
    return (
        <EntitySelect

            value={status}
            onChange={setStatus}
            options={projectStatusOptions}
            placeholder="Select status"

        />
    )
}

export const ProjectOwnderSelect = () => {
    const [owner, setOwner] = useState("")
    return (
        <EntitySelect
            value={owner}
            onChange={setOwner}
            options={owners}
            placeholder="Select Owner"
        />
    )
}

type ProjectCardProps = {
    title: string
    description: string
    progress: number
    avatars: number
    extraMembers: number
    dueDate: string
}

export const projects: ProjectCardProps[] = [
    {
        "title": "Q4 Marketing Launch",
        "description": "Preparation and execution of the year-end marketing...",
        "progress": 65,
        "avatars": 3,
        "extraMembers": 2,
        "dueDate": "2023-12-15"
    },
    {
        "title": "Website Redesign",
        "description": "UI/UX improvement and performance optimization...",
        "progress": 40,
        "avatars": 4,
        "extraMembers": 1,
        "dueDate": "2023-11-30"
    },
    {
        "title": "Mobile App Development",
        "description": "Building core features and API integration...",
        "progress": 80,
        "avatars": 5,
        "extraMembers": 0,
        "dueDate": "2023-12-20"
    }
]

export const ProjectCard = ({ title, description, avatars, progress, extraMembers, dueDate }: ProjectCardProps) => {

    return (
        <Card className="max-w-xs">
            <CardHeader className="flex items-center justify-between">
                <div className="w-8 h-8 bg-blue-200 flex items-center justify-center rounded-md text-blue-700">
                    <Banknote />
                </div>
                <EllipsisVerticalIcon />
            </CardHeader>
            <CardContent>
                <h1 className="font-semibold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="w-full">
                    <div className=" flex items-center justify-between ">
                        <p className="text-muted-foreground">Progress</p>
                        <p className="text-primary">{progress}%</p>
                    </div>
                    <Progress value={progress} />

                </div>
                <div className="text-muted-foreground flex items-center justify-end w-full gap-2">
                    <CalendarIcon className="size-4" />
                    <span className="text-sm">{new Date(dueDate).toLocaleDateString()}</span>
                </div>
            </CardFooter>
        </Card>
    )
}

export const ProjectCardAdd = () => {
    return (
        <Card className="max-w-xs border-4 border-dashed flex items-center justify-center text-muted-foreground hover:bg-gray-50">

            <PlusIcon />
            <span className="font-semibold">Create New Project</span>
            <span className="text-sm">Starf from scratch or template</span>
        </Card>
    )
}


export const ProjectContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<ProjectHeader />}
            search={<ProjectSearch />}
            statusSelect={<ProjectStatusSelect />}
            ownerSelect={<ProjectOwnderSelect />}
        >
            <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
                {children}
            </div>
        </EntityContainer>
    )
}