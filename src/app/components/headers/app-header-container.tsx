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
            <Image src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQanlasPgQjfGGU6anray6qKVVH-ZlTqmuTHw&s'} alt="image profile" width={32} height={32} />
        </div>
    )

}