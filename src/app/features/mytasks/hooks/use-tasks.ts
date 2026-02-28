import { trpc } from "@/trpc/client"
import { toast } from "sonner"

export const useCreateTask = () => {
    const utils = trpc.useUtils()

    return trpc.tasks.create.useMutation({
        onSuccess: async (data) => {
            toast.success(`Task "${data.title}"`)
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
}

export const useSuspenseTasks = () => {
    return trpc.tasks.getMany.useSuspenseQuery()
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