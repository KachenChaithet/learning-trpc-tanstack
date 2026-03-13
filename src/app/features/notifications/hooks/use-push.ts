"use client"

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

type SubscribeFn = (input: {
    endpoint: string
    p256dh: string
    auth: string
}) => Promise<unknown>

export const registerPush = async (subscribeFn: SubscribeFn) => {
    const registration = await navigator.serviceWorker.ready
    const vapidKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    )

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
    })

    const key = subscription.getKey("p256dh")
    const auth = subscription.getKey("auth")

    await subscribeFn({
        endpoint: subscription.endpoint,
        p256dh: Buffer.from(key!).toString("base64"),
        auth: Buffer.from(auth!).toString("base64"),
    })
}