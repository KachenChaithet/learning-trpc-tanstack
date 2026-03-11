"use client"

import { PopoverContent } from "@/components/ui/popover"
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMarkAsRead } from "../hooks/use-notification";
import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>
type Notification = RouterOutputs["notification"]["getNotifications"][number]
type NotificationDropdownProps = {
    data: Notification[]
    isLoading: boolean
}

export const NotificationDropdown = ({ data, isLoading }: NotificationDropdownProps) => {
    const { mutate: markAsRead } = useMarkAsRead()
    return (
        <PopoverContent className="w-80 p-0" side="left">

            <div className="border-b px-4 py-3 font-medium">
                Notifications
            </div>

            <div className="max-h-80 overflow-y-auto">

                {isLoading && (
                    <div className="p-4 text-sm text-muted-foreground">
                        Loading...
                    </div>
                )}

                {!isLoading && data.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">
                        No notifications
                    </div>
                )}

                {data?.map((notification) => (
                    <Link
                        href={notification.link}
                        onClick={() => markAsRead({ id: notification.id })}
                        key={notification.id}
                        className="flex flex-col gap-1 px-4 py-3 hover:bg-muted cursor-pointer"
                    >
                        <span className="text-sm">
                            {notification.type}
                        </span>

                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                    </Link>
                ))}

            </div>

        </PopoverContent>
    )
}