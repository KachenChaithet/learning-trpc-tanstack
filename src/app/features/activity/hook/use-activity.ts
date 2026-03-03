import { trpc } from "@/trpc/client"

export const useGetRecent = () => {
    return trpc.activity.getRecent.useQuery()
}