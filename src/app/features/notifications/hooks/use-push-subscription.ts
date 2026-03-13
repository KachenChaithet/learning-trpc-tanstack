import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";

export function usePushSubscription() {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    const subscribeMutation = trpc.notification.subscribe.useMutation();
    const unsubscribeMutation = trpc.notification.unsubscribe.useMutation();

    useEffect(() => {
        setIsSupported("serviceWorker" in navigator && "PushManager" in window);
    }, []);

    useEffect(() => {
        if (!isSupported) return;
        navigator.serviceWorker.ready.then((registration) => {
            registration.pushManager.getSubscription().then(setSubscription);
        });
    }, [isSupported]);

    const { data: dbSubscription, refetch } = trpc.notification.getSubscription.useQuery(
        { endpoint: subscription?.endpoint ?? "" },
        { enabled: !!subscription }
    );

    const subscribe = async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            });

            const key = sub.getKey("p256dh");
            const auth = sub.getKey("auth");

            await subscribeMutation.mutateAsync({
                endpoint: sub.endpoint,
                p256dh: Buffer.from(key!).toString("base64"),
                auth: Buffer.from(auth!).toString("base64"),
            });

            setSubscription(sub);
            await refetch(); // sync กับ DB
        } catch (err) {
            console.error("Subscribe failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribe = async () => {
        if (!subscription) return;
        setIsLoading(true);
        try {
            await subscription.unsubscribe();
            await unsubscribeMutation.mutateAsync({
                endpoint: subscription.endpoint,
            });

            setSubscription(null);
            await refetch(); // sync กับ DB
        } catch (err) {
            console.error("Unsubscribe failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isSupported,
        isSubscribed: !!subscription && !!dbSubscription?.isSubscribed, // ต้องมีทั้งคู่
        isLoading,
        subscribe,
        unsubscribe,
    };
}