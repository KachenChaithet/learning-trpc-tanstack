"use client"
import { EntityContainer, EntitySearch, EntitySelect } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { PlusIcon, ReceiptRussianRuble } from "lucide-react"
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


export const ProjectContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<ProjectHeader />}
            search={<ProjectSearch />}
            statusSelect={<ProjectStatusSelect />}
            ownerSelect={<ProjectOwnderSelect />}
        >
            <></>
        </EntityContainer>
    )
}