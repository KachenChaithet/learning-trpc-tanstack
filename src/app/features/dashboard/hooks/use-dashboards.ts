import { trpc } from "@/trpc/client"

export const useOverview = () => {
    const utils = trpc.useUtils()

    return trpc.dashboard.getOverview.useQuery()

}