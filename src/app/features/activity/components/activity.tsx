"use client"
import { EntityContainer, EntitySearch, EntitySelect } from "@/app/components/entity-components"
import React, { useState } from "react"


export const ActivityHeader = () => {
    return (
        <div className="w-full">
            <div>
                <h1 className="text-2xl font-semibold">Activity Feed</h1>
                <p className="text-sm text-muted-foreground">
                    Full history of events across your workspace.
                </p>
            </div>
        </div>
    )
}

export const ActivityFilters = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [project, setProject] = useState('')
    const [user, setUser] = useState('')
    const [event, setEvent] = useState('')
    return (
        <div className="flex gap-4 max-w-[70%]">

            <EntitySearch
                onChange={setSearchTerm}
                value={searchTerm}
                placeholder="Search activities..."
            />

            <EntitySelect
                onChange={setProject}
                value={project}
                placeholder="All Projects"
                options={[
                    { value: 'project1', label: "project1" },
                    { value: 'project2', label: "project2" },
                ]}

            />
            <EntitySelect
                onChange={setUser}
                value={user}
                placeholder="All Users"
                options={[
                    { value: 'user1', label: "user1" },
                    { value: 'user2', label: "user2" },
                ]}

            />
            <EntitySelect
                onChange={setEvent}
                value={event}
                placeholder="Event Type"
                options={[
                    { value: 'event1', label: "event1" },
                    { value: 'event2', label: "event2" },
                ]}

            />
        </div>


    )
}


export const ActivityContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<ActivityHeader />}
        >
            <ActivityFilters />
        </EntityContainer>
    )
}