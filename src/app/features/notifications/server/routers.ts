import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const notificationRouter = createTRPCRouter({
    getNotifications: protectedProcedure.query(({ ctx }) => {
        return prisma.notification.findMany({
            where: {
                userId: ctx.user.id
            },
            orderBy: { createdAt: 'desc' },
        })
    }),
    markAsRead: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await prisma.notification.update({
                where: {
                    id: input.id
                },
                data: {
                    read: true
                }
            })
        }),
    // บันทึก push subscription เมื่อ user กด allow
    subscribe: protectedProcedure
        .input(
            z.object({
                endpoint: z.string(),
                p256dh: z.string(),
                auth: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await prisma.pushSubscription.upsert({
                where: { endpoint: input.endpoint },
                update: {
                    p256dh: input.p256dh,
                    auth: input.auth,
                },
                create: {
                    userId: ctx.user.id,
                    endpoint: input.endpoint,
                    p256dh: input.p256dh,
                    auth: input.auth,
                },
            });

            return { success: true };
        }),

    // ลบ subscription เมื่อ user กด unsubscribe
    unsubscribe: protectedProcedure
        .input(z.object({ endpoint: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await prisma.pushSubscription.deleteMany({
                where: {
                    endpoint: input.endpoint,
                    userId: ctx.user.id,
                },
            });

            return { success: true };
        }),

    // เช็คว่า user subscribe อยู่ไหม
    getSubscription: protectedProcedure
        .input(z.object({ endpoint: z.string() }))
        .query(async ({ ctx, input }) => {
            const subscription = await prisma.pushSubscription.findUnique({
                where: { endpoint: input.endpoint },
            });

            return { isSubscribed: !!subscription };
        }),
})