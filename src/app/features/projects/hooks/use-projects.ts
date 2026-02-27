import { trpc } from "@/trpc/client"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export const useSuspenseProjectsMine = () => {
    return trpc.projects.getMine.useSuspenseQuery()
}

export const useSuspenseProjectsPublic = () => {
    return trpc.projects.getPublic.useSuspenseQuery()
}
export const useSuspenseProjectJoinRequests = () => {
    return trpc.projects.getJoinRequests.useSuspenseQuery()
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

export const useRequestJoinProject = () => {
    const utils = trpc.useUtils()

    return trpc.projects.requestJoin.useMutation({
        onSuccess: async (data) => {
            toast.success(`Join to Project ${data?.project.name}`)
            await utils.projects.getPublic.invalidate()
        },
        onError: (err) => {
            if (err.data?.code === "CONFLICT") {
                toast.warning("You already requested to join this project.")
            } else {
                toast.error("Something went wrong.")
            }
        }
    })
}

export const useRequestCancelJoinProject = () => {
    const utils = trpc.useUtils()

    return trpc.projects.cancelJoin.useMutation({
        onSuccess: async () => {
            toast.success("Request cancelled")
            await utils.projects.getPublic.invalidate()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
}
