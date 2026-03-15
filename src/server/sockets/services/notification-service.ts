import { NotificationType } from "@/generated/prisma/enums"
import { prisma } from "@/lib/db"
import { getIO } from "../socket-instance"
import { socket } from "@/lib/socket"
import { sendPush } from "@/lib/webpush"

type CreateNotificationParams = {
    userId: string
    type: NotificationType
    link: string
}

export const createNotification = async ({
    userId,
    type,
    link
}: CreateNotificationParams) => {

    const notification = await prisma.notification.create({
        data: {
            userId,
            type,
            link
        }
    })
    const subscriptions = await prisma.pushSubscription.findMany({
        where: {
            userId
        }
    })
    console.log("subscriptions found:", subscriptions.length) 
    for (const sub of subscriptions) {
        await sendPush(sub, notification)
    }

    socket.emit('notification:new', { userId, notification })

    return notification
}