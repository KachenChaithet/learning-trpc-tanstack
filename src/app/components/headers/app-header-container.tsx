"use client"
import { BellIcon } from "lucide-react"
import { Button } from "../../../components/ui/button"
import Image from "next/image"
import { trpc } from "@/trpc/client"
import { NotificationDropdown } from "./notification-dropdown"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { useNotifications } from "../hooks/use-notification"
import { useEffect } from "react"
import { socket } from "@/lib/socket"
import { authClient } from "@/lib/auth-client"
import { registerPush } from "@/app/features/notifications/hooks/use-push"
import { NotificationPermissionButton } from "@/app/features/notifications/components/notification-permission-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export const AppHeaderContainer = () => {

    const { data: session } = authClient.useSession()
    const userId = session?.user.id


    const { data = [], isLoading } = useNotifications()
    const utils = trpc.useUtils()

    useEffect(() => {
        if (!userId) return

        const handleNewNotification = () => {
            utils.notification.getNotifications.invalidate()
        }

        socket.emit("join-user", userId)

        socket.on("notification:new", handleNewNotification)

        return () => {
            socket.emit("leave-user", userId)
            socket.off("notification:new", handleNewNotification)
        }

    }, [userId, utils])
    const unreadCount = data.filter(n => !n.read).length ?? 0
    const subscribeMutation = trpc.notification.subscribe.useMutation()

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js")
        }
        if (Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    registerPush(subscribeMutation.mutateAsync)
                }
            })
        } else if (Notification.permission === "granted") {
            registerPush(subscribeMutation.mutateAsync)
        }
    }, [])
    return (
        <div className="flex items-center gap-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button className="relative" variant={'ghost'} size={'icon'}>
                        <BellIcon className="size-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs px-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <NotificationDropdown data={data} isLoading={isLoading} />
            </Popover>
            <NotificationPermissionButton />
            <Link href={'/profile'}>
                <Avatar>
                    <AvatarImage src={session?.user.image ?? ""} />
                    <AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
                </Avatar>
            </Link>
        </div>
    )

}