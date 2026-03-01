import { trpc } from "@/trpc/client"
import { toast } from "sonner"

export const useCreateTask = () => {
    const utils = trpc.useUtils()

    return trpc.tasks.create.useMutation({
        onSuccess: async (data) => {
            toast.success(`Task "${data.title}"`)
        },
        onError: (err) => {
            if (err.data?.code === 'FORBIDDEN') {
                toast.error("You don't have permission")
                return
            }
            toast.error(err.message)
        }
    })
}

type TaskFilter = {
    projectId?: string
    priority?: "ALL" | "LOW" | "MEDIUM" | "HIGH"
    date?: "newest" | "oldest"
    tab?: "today" | "week" | "overdue" | "completed"
}

export const useSuspenseTasks = (filter?: TaskFilter) => {
    return trpc.tasks.getMany.useSuspenseQuery(filter ?? {})
}

export const useProjectMembers = (projectId?: string) => {
    return trpc.tasks.getMembers.useQuery(
        { projectId: projectId as string },
        {
            enabled: !!projectId,

        },
    )
}

export const useMyProjects = () => {
    return trpc.tasks.getMineProjects.useQuery()
}

export const useAccessibleProjects = () => {
    return trpc.tasks.getMyAccessible.useQuery()
}

