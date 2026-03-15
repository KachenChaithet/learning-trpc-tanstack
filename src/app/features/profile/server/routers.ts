import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const ProfileRouter = createTRPCRouter({
    getProfile: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    _count: {
                        select: {
                            projectMembers: true,
                            assignedTasks: true
                        }
                    }
                }
            })

            const completedTasks = await prisma.task.count({
                where: { assigneeId: ctx.user.id, status: 'DONE' }
            })

            return { ...user, completedTasks }
        }),
    updateProfile: protectedProcedure
        .input(z.object({ name: z.string().min(1).max(100) }))
        .mutation(({ ctx, input }) => {
            return prisma.user.update({
                where: { id: ctx.user.id },
                data: { name: input.name }
            })
        })
})