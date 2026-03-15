import { trpc } from "@/trpc/client"
import { toast } from "sonner"

export const useProfile = () => {
    return trpc.profile.getProfile.useQuery()
}

export const useUpdateProfile = () => {
    const utils = trpc.useUtils()

    return trpc.profile.updateProfile.useMutation({
        onSuccess: () => {
            toast.success("Profile updated")
            utils.profile.getProfile.invalidate()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
}