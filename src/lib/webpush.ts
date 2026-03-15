import webpush from "web-push"
import { prisma } from "@/lib/db"

webpush.setVapidDetails(
    "mailto:test@test.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export const sendPush = async (sub: any, payload: any) => {
    const subscription = {
        endpoint: sub.endpoint,
        keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
        }
    }

    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
        )
    } catch (err: any) {
        // 404, 410 = subscription หมดอายุหรือไม่มีแล้ว → ลบออกจาก DB
        if (err.statusCode === 404 || err.statusCode === 410) {
            await prisma.pushSubscription.delete({
                where: { endpoint: sub.endpoint }
            })
        }
        // error อื่นๆ → ไม่ throw ให้ flow ทำงานต่อได้
        console.error("Push failed:", err.statusCode, sub.endpoint)
    }
}