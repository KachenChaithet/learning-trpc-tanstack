"use client"
import { EntityContainer, EntitySearch } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useState } from "react"

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
    console.log(searchTerm);

    return (
        <EntitySearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search projects"
        />
    )
}

export const ProjectSelect = () => {

}

export const ProjectContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<ProjectHeader />}
            search={<ProjectSearch />}
        >
            <></>
        </EntityContainer>
    )
}