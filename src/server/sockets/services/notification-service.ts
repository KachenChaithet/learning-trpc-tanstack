import { NotificationType } from "@/generated/prisma/enums"
import { prisma } from "@/lib/db"
import { io } from ".."

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

    console.log('hey');
    
    io.to(`user:${userId}`).emit("notification:new", notification)

    return notification
}