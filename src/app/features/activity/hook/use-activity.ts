import { ActivityType } from "@/generated/prisma/enums"
import { trpc } from "@/trpc/client"

export const useGetRecent = () => {
    return trpc.activity.getRecent.useQuery()
}

type Filters = {
    search?: string
    projectId?: string
    userId?: string
    eventType?: ActivityType
    sort: "asc" | "desc"
}

export const useInfiniteActivities = (filters: Filters) => {
    const query = trpc.activity.list.useInfiniteQuery(
        { ...filters, take: 10 },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        }
    )
    console.log("pageParams:", JSON.stringify(query.data?.pageParams)) // ← ตรงนี้
    console.log("page[1]:", JSON.stringify(query.data?.pages[1]))
    const activities = query.data?.pages.flatMap((p) => p.items) ?? []
    return {
        ...query,
        activities,
    }
}