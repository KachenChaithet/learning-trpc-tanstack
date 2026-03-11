import { trpc } from "@/trpc/client"
import { toast } from "sonner"

export const useNotifications = () => {
    return trpc.notification.getNotifications.useQuery()
}

export const useMarkAsRead = () => {
    const utils = trpc.useUtils()

    return trpc.notification.markAsRead.useMutation({
        onSuccess: () => {
            utils.notification.getNotifications.invalidate()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
}