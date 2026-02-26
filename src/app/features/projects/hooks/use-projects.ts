import { trpc } from "@/trpc/client"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export const useSuspenseProjectsMine = () => {
    return trpc.projects.getMine.useSuspenseQuery()
}

export const useSuspenseProjectsPublic = () => {
    return trpc.projects.getPublic.useSuspenseQuery()
}

export const useCreateProject = () => {
    const utils = trpc.useUtils()

    return trpc.projects.create.useMutation({
        onSuccess: async (data) => {
            toast.success(`Project "${data.name}"`)
            await utils.projects.getMine.invalidate()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
}

export const useRemoveProject = () => {
    const utils = trpc.useUtils()
    return trpc.projects.remove.useMutation({
        onSuccess: async (data) => {
            toast.success(`Delete Project "${data.name}"`)
            await utils.projects.getMine.invalidate()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
}

export const useUpdateProject = () => {
    const utils = trpc.useUtils()
    return trpc.projects.update.useMutation({
        onSuccess: async (data) => {
            toast.success(`Update Project "${data.name}"`)
            await utils.projects.getMine.invalidate()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
}