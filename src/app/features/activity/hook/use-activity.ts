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
        {
            ...filters,
            take: 29,
        },
        {
            initialCursor: null,
            getNextPageParam: (lastPage) =>
                lastPage.length
                    ? lastPage[lastPage.length - 1].id
                    : undefined,
        }
    )

    const activities = query.data?.pages.flat() ?? []

    return {
        ...query,
        activities,
    }
}