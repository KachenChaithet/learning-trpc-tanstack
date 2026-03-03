import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const activityRouter = createTRPCRouter({
    getRecent: protectedProcedure.query(async ({ ctx }) => {
        const activities = await prisma.activityLog.findMany({
            where: {
                project: {
                    projectMembers: {
                        some: { userId: ctx.user.id }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 4,
            include: {
                actor: true,
                task: true,
                project: true
            }
        })
        return activities.map((a) => {
            switch (a.type) {
                case "TASK_CREATED":
                    return {
                        id: a.id,
                        name: a.actor?.name ?? "Unknown User",
                        action: "created task",
                        target: a.task?.title,
                        createdAt: a.createdAt,
                        category: a.type,
                        isSystem: !a.actor,
                    }

                case "TASK_STATUS_CHANGED":
                    return {
                        id: a.id,
                        name: a.actor?.name ?? "Unknown User",
                        action: "changed status of",
                        target: a.task?.title,
                        createdAt: a.createdAt,
                        category: a.type,
                        isSystem: !a.actor,
                    }
                case "TASK_ASSIGNED": {
                    const meta = a.metadata as {
                        assigneeId?: string
                        assigneeName?: string
                    } | null
                    return {
                        id: a.id,
                        name: a.actor?.name ?? "Unknown User",
                        action: meta?.assigneeName
                            ? `assigned task to ${meta.assigneeName}`
                            : 'assigned task',
                        target: a.task?.title,
                        createdAt: a.createdAt,
                        category: a.type,
                        isSystem: !a.actor,
                    }
                }
                case "PROJECT_CREATED": {
                    return {
                        id: a.id,
                        name: a.actor?.name ?? "Unknown User",
                        action: "created project",
                        target: a.project?.name,
                        createdAt: a.createdAt,
                        category: a.type,
                        isSystem: !a.actor,
                    }
                }
               

                default:
                    return {
                        id: a.id,
                        name: a.actor?.name ?? "Unknown User",
                        action: "did something",
                        createdAt: a.createdAt,
                        category: a.type,
                        isSystem: !a.actor,
                    }
            }
        })
    })
})