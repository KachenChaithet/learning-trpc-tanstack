import { ActivityType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

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
    }),
    list: protectedProcedure
        .input(z.object({
            search: z.string().optional(),
            projectId: z.string().optional(),
            userId: z.string().optional(),
            eventType: z.nativeEnum(ActivityType).optional(),
            sort: z.enum(["asc", "desc"]).default('desc'),
            take: z.number().default(20),
            cursor: z.string().nullish(),
        }))
        .query(async ({ ctx, input }) => {
            console.log("cursor:", input.cursor)
            const items = await prisma.activityLog.findMany({
                where: {
                    project: {
                        projectMembers: {
                            some: { userId: ctx.user.id }
                        }
                    },

                    ...(input.projectId && {
                        projectId: input.projectId
                    }),

                    ...(input.userId && {
                        actorId: input.userId
                    }),

                    ...(input.eventType && {
                        type: input.eventType
                    }),

                    ...(input.search && {
                        OR: [
                            {
                                task: {
                                    title: {
                                        contains: input.search,
                                        mode: 'insensitive'
                                    }
                                },
                                project: {
                                    name: {
                                        contains: input.search,
                                        mode: "insensitive"
                                    }
                                }
                            }
                        ]
                    })
                },
                take: input.take + 1,
                include: {
                    actor: true,
                    task: true,
                    project: true
                },
                cursor: input.cursor
                    ? { id: input.cursor }
                    : undefined,
                skip: input.cursor ? 1 : 0,
                orderBy: {
                    createdAt: input.sort
                }
            })

            return items.map((a) => {
                switch (a.type) {
                    case "TASK_CREATED":
                        return {
                            id: a.id,
                            name: a.actor?.name ?? "Unknown User",
                            action: "created task",
                            target: a.task?.title,
                            targetId: a.task?.id,
                            createdAt: a.createdAt,
                            category: a.type,
                            isSystem: !a.actor,
                            dateKey: a.createdAt.toISOString().split("T")[0],
                        }

                    case "TASK_STATUS_CHANGED":
                        return {
                            id: a.id,
                            name: a.actor?.name ?? "Unknown User",
                            action: "changed status of",
                            target: a.task?.title,
                            targetId: a.task?.id,
                            createdAt: a.createdAt,
                            category: a.type,
                            isSystem: !a.actor,
                            dateKey: a.createdAt.toISOString().split("T")[0],
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
                            targetId: a.task?.id,
                            createdAt: a.createdAt,
                            category: a.type,
                            isSystem: !a.actor,
                            dateKey: a.createdAt.toISOString().split("T")[0],
                        }
                    }
                    case "PROJECT_CREATED": {
                        return {
                            id: a.id,
                            name: a.actor?.name ?? "Unknown User",
                            action: "created project",
                            target: a.project?.name,
                            targetId: a.task?.id,
                            createdAt: a.createdAt,
                            category: a.type,
                            isSystem: !a.actor,
                            dateKey: a.createdAt.toISOString().split("T")[0],
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
                            dateKey: a.createdAt.toISOString().split("T")[0],
                        }
                }
            })
        }),
    listForFilter: protectedProcedure.query(async ({ ctx }) => {
        return prisma.user.findMany({
            where: {
                projectMembers: {
                    some: {
                        project: {
                            projectMembers: {
                                some: { userId: ctx.user.id },
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        })
    })

})