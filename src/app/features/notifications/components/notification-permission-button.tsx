"use client";

import { usePushSubscription } from "../hooks/use-push-subscription";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

export function NotificationPermissionButton() {
    const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } =
        usePushSubscription();

    if (!isSupported) return null;

    return (
        <Button
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            disabled={isLoading}
            onClick={isSubscribed ? unsubscribe : subscribe}
        >
            {isSubscribed ? (
                <>
                    <BellOff className="mr-2 h-4 w-4" />
                    {isLoading ? "กำลังยกเลิก..." : "ปิดการแจ้งเตือน"}
                </>
            ) : (
                <>
                    <Bell className="mr-2 h-4 w-4" />
                    {isLoading ? "กำลังเปิด..." : "เปิดการแจ้งเตือน"}
                </>
            )}
        </Button>
    );
}