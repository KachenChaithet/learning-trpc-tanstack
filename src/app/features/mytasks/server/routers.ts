import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const TaskRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            title: z.string()
                .min(1, "Project name is required")
                .max(100, "Project too long")
            ,
            description: z.string()
                .max(500, "Description too long")
                .optional(),
            projectId: z.string(),
            assigneeId: z.string().min(1, "Assignee is required"),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"])
                .optional(),

            status: z.enum(["TODO", "IN_PROGRESS", "DONE"])
                .optional(),

            dueDate: z.coerce.date().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const isMember = await prisma.projectMember.findFirst({
                where: {
                    projectId: input.projectId,
                    userId: ctx.user.id
                }
            })

            if (!isMember) {
                throw new TRPCError({ code: "FORBIDDEN" })
            }

            return prisma.task.create({
                data: {
                    title: input.title,
                    projectId: input.projectId,
                    assigneeId: input.assigneeId,
                    ...(input.description !== undefined && {
                        description: input.description
                    }),
                    dueDate: input.dueDate,
                    status: input.status,
                    priority: input.priority
                }
            })
        }),
    getMany: protectedProcedure
        .input(
            z.object({
                projectId: z.string().optional(),
                priority: z.enum(["ALL", "LOW", "MEDIUM", "HIGH"]).optional(),
                date: z.enum(["newest", "oldest"]).optional(),
                tab: z.enum(["today", "week", "overdue", "completed"]).optional()
            })
        )
        .query(({ ctx, input }) => {
            const now = new Date()

            const startOfToday = new Date(now)
            startOfToday.setHours(0, 0, 0, 0)

            const endOfToday = new Date(now)
            endOfToday.setHours(23, 59, 59, 999)

            const endOfWeek = new Date(now)
            endOfWeek.setDate(now.getDate() + 7)

            return prisma.task.findMany({
                where: {
                    assigneeId: ctx.user.id,

                    ...(input?.projectId &&
                        input.projectId !== "ALL" && {
                        projectId: input.projectId,
                    }),

                    ...(input?.priority &&
                        input.priority !== "ALL" && {
                        priority: input.priority,
                    }),

                    //  Tab Filter
                    ...(input?.tab === "today" && {
                        dueDate: {
                            gte: now
                        },
                    }),

                    ...(input?.tab === "week" && {
                        dueDate: {
                            gte: now,
                            lte: endOfWeek,
                        },
                    }),

                    ...(input?.tab === 'overdue' && {
                        dueDate: {
                            lt: now
                        }
                    }),

                    ...(input?.tab === 'completed' && {
                        status: 'DONE'
                    })

                },

                orderBy: input?.date
                    ? {
                        dueDate: input.date === "newest" ? "desc" : "asc",
                    }
                    : undefined,

                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            })
        }),
    getMineProjects: protectedProcedure
        .query(({ ctx }) => {
            return prisma.project.findMany({
                where: {
                    projectMembers: {
                        some: {
                            userId: ctx.user.id,
                            role: 'OWNER'
                        }
                    }
                },
                select: {
                    id: true,
                    name: true
                }
            })
        }),
    getMembers: protectedProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const isMember = await prisma.projectMember.findFirst({
                where: {
                    projectId: input.projectId,
                    userId: ctx.user.id
                }
            })
            if (!isMember) {
                throw new TRPCError({ code: "FORBIDDEN" })
            }

            const members = await prisma.projectMember.findMany({
                where: {
                    projectId: input.projectId,
                    userId: {
                        not: ctx.user.id
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            })

            return members.map((p) => ({
                userId: p.user.id,
                userName: p.user.name,
                userEmail: p.user.email
            }))
        }),
    getMyAccessible: protectedProcedure
        .query(({ ctx }) => {
            return prisma.project.findMany({
                where: {
                    projectMembers: {
                        some: {
                            userId: ctx.user.id
                        }
                    }
                }
            })
        })
    // remove: protectedProcedure
    //     .input(z.object({ id: z.string() }))
    //     .mutation(({ ctx, input }) => {
    //         return prisma.project.delete({
    //             where: {
    //                 id: input.id,
    //             }
    //         })
    //     }),

    // update: protectedProcedure
    //     .input(z.object({
    //         id: z.string(),
    //         name: z.string()
    //             .min(1, "Project name is required")
    //             .max(100, "Project too long"),
    //         description: z.string()
    //             .max(500, "Description too long")
    //             .optional()
    //     }))
    //     .mutation(async ({ ctx, input }) => {
    //         const project = await prisma.project.findFirst({
    //             where: {
    //                 id: input.id,
    //                 projectMembers: {
    //                     some: {
    //                         userId: ctx.user.id
    //                     }
    //                 }
    //             }
    //         })

    //         if (!project) throw new TRPCError({ code: "FORBIDDEN" })

    //         return prisma.project.update({
    //             where: {
    //                 id: input.id,
    //             },
    //             data: {
    //                 name: input.name,
    //                 description: input.description
    //             }
    //         })
    //     })
})