import { trpc } from "@/trpc/client"
import { exitCode } from "process"
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
    view: "assignedToMe" | "assignedByMe"

}

export const useSuspenseTasks = (filter?: TaskFilter) => {
    return trpc.tasks.getMany.useSuspenseQuery({ view: filter?.view ?? 'assignedToMe', ...filter })
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

export const useUpdateStatus = () => {
    const utils = trpc.useUtils()
    return trpc.tasks.updateStatus.useMutation({
        onSuccess: (data) => {
            toast.success(`update ${data?.title}`)
            utils.tasks.getMany.invalidate()
            utils.projects.getMine.invalidate()
            utils.tasks.myUpcomingTasks.invalidate()
        },
        onError: (err) => {
            if (err.data?.code === "FORBIDDEN") {
                toast.error("You don't have permission")
                return
            }
            toast.error(err.message)
        }
    })
}
