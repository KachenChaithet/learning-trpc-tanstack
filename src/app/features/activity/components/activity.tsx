"use client"
import { EntityContainer, EntitySearch, EntitySelect } from "@/app/components/entity-components"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ActivityType } from "@/generated/prisma/enums"
import { trpc } from "@/trpc/client"
import React, { useEffect, useState } from "react"
import { useInfiniteActivities } from "../hook/use-activity"
import { inferRouterOutputs } from "@trpc/server"
import { AppRouter } from "@/trpc/routers/_app"
import { ostring } from "zod/v3"
import { ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"


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
type Props = {
    filters: ActivityFiltersState
    onChange: (filters: ActivityFiltersState) => void
    projectOptions: { value: string; label: string }[]
    userOptions: { value: string; label: string }[]
}

export const ActivityFilters = ({
    filters,
    onChange,
    projectOptions,
    userOptions
}: Props) => {
    const eventTypeOptions = Object.values(ActivityType).map((type) => ({
        value: type,
        label: type
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
    }))
    return (
        <div className="flex gap-8">
            <EntitySearch
                value={filters.search ?? ""}
                onChange={(value) =>
                    onChange({ ...filters, search: value })
                }
                placeholder="Search activities..."
            />

            <EntitySelect
                value={filters.projectId ?? ""}
                onChange={(value) =>
                    onChange({ ...filters, projectId: value })
                }
                options={projectOptions}
                placeholder="All Projects"
            />

            <EntitySelect
                value={filters.userId ?? ""}
                onChange={(value) =>
                    onChange({ ...filters, userId: value })
                }
                options={userOptions}
                placeholder="All Users"
            />

            <EntitySelect
                value={filters.eventType ?? ""}
                onChange={(value) =>
                    onChange({
                        ...filters,
                        eventType: value as ActivityType,
                    })
                }
                options={eventTypeOptions}
                placeholder="Event Type"
            />

            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    onChange({
                        search: "",
                        projectId: undefined,
                        userId: undefined,
                        eventType: undefined,
                        sort: "desc",
                    })
                }
            >
                Clear Filters
            </Button>

            <EntitySelect
                value={filters.sort}
                onChange={(value) =>
                    onChange({
                        ...filters,
                        sort: value as "asc" | "desc",
                    })
                }
                options={[
                    { value: "desc", label: "Newest First" },
                    { value: "asc", label: "Oldest First" },
                ]}
            />
        </div>
    )
}

export type ActivityFiltersState = {
    search?: string
    projectId?: string
    userId?: string
    eventType?: ActivityType
    sort: "asc" | "desc"
}
type RouterOutputs = inferRouterOutputs<AppRouter>
type Activity = RouterOutputs["activity"]["list"]["items"][number] // ← เปลี่ยนตรงนี้
type ActivityListProps = {
    activities: Activity[]
    fetchNextPage: () => void
    hasNextPage: boolean
    isFetchingNextPage: boolean
    isLoading: boolean
}

export const ActivityList = ({ activities, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading }: ActivityListProps) => {
    if (isLoading) {
        return <div>Loading...</div>
    }



    const formatName = (fullName?: string) => {
        if (!fullName) return "Unknown"

        return fullName
            .trim()
            .split(/\s+/)
            .map((part, index) =>
                index === 0 ? part : part.charAt(0)
            )
            .join(" ")
    }


    if (!activities.length) {
        return <div>No activities found.</div>
    }

    const grouped = activities.reduce((acc, activity) => {
        const key = activity.dateKey

        if (!acc[key]) {
            acc[key] = []
        }

        acc[key].push(activity)
        return acc
    }, {} as Record<string, typeof activities>)

    const getDateLabel = (dateKey: string) => {
        const date = new Date(dateKey)
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return "TODAY"
        }

        if (date.toDateString() === yesterday.toDateString()) {
            return "YESTERDAY"
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <div className="space-y-8 text-center">
            {Object.entries(grouped).map(([dateKey, items]) => (
                <div key={dateKey} className="space-y-4">

                    {/* Section Header */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-muted-foreground">
                            {getDateLabel(dateKey)}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Items */}
                    {items.map((activity) => (
                        <div key={activity.id} className="flex justify-between">
                            <div className="flex gap-2 max-h-10 items-center">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>
                                        {activity?.name?.[0] ?? "U"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="text-xs md:text-[16px]">
                                    <span>
                                        {formatName(activity.name)}{" "}
                                        {activity.action}
                                    </span>

                                    {activity.target && (
                                        <Button className="text-primary  cursor-pointer text-xs md:text-[16px]" variant={'link'} asChild>
                                            <Link href={`/my-tasks/${activity.targetId}`}>
                                                {activity.target}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                                {new Date(activity.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            {hasNextPage && (
                <Button
                    variant={'outline'}
                    className="text-center "
                    size={'lg'}
                    onClick={fetchNextPage}
                    disabled={isFetchingNextPage}
                >
                    <ChevronDown />
                    {isFetchingNextPage ? "Loading..." : "Load More Activities"}
                </Button>
            )}
        </div>
    )
}

export const ActivityContainer = ({ children }: { children: React.ReactNode }) => {
    const [filters, setFilters] = useState<ActivityFiltersState>({
        search: "",
        projectId: undefined,
        userId: undefined,
        eventType: undefined,
        sort: "desc",
    })
    const { data: projects } = trpc.projects.listForFilter.useQuery()
    const { data: users } = trpc.activity.listForFilter.useQuery()

    const projectOptions = projects?.map((p) => ({
        value: p.id,
        label: p.name
    })) ?? []

    const { activities,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading } = useInfiniteActivities(filters)

    console.log("activities count:", activities.length)
    const userOptions = users?.map((p) => ({
        value: p.id,
        label: p.name ?? "Unknow User"
    })) ?? []


    return (
        <EntityContainer
            header={<ActivityHeader />}
        >
            <ActivityFilters filters={filters} onChange={setFilters} projectOptions={projectOptions} userOptions={userOptions} />
            <Separator />
            <ActivityList activities={activities} fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} isLoading={isLoading} />
        </EntityContainer>
    )
}