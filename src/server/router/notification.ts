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
            take: 20
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
        })
})