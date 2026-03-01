import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const DashboardRouter = createTRPCRouter({
    getOverview: protectedProcedure
        .query(async ({ ctx }) => {
            const now = new Date()

            const startOfToday = new Date(now)
            startOfToday.setHours(0, 0, 0, 0)

            const endOfDay = new Date(now)
            endOfDay.setHours(23, 59, 59, 999)

            const startOfWeek = new Date(now)
            startOfWeek.setDate(now.getDate() - now.getDate())
            startOfWeek.setHours(0, 0, 0, 0)

            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            const totalProjects = await prisma.project.count({
                where: {
                    projectMembers: {
                        some: {
                            userId: ctx.user.id
                        }
                    }
                }
            })

            const activeThisWeek = await prisma.project.count({
                where: {
                    projectMembers: {
                        some: {
                            userId: ctx.user.id
                        }
                    },
                    updatedAt: {
                        gte: startOfWeek
                    }

                }
            })

            const tasksDueToday = await prisma.task.count({
                where: {
                    project: {
                        projectMembers: {
                            some: { userId: ctx.user.id }
                        }
                    },
                    dueDate: {
                        gte: startOfToday,
                        lte: endOfDay
                    },
                    status: {
                        not: "DONE"
                    }
                }
            })

            const overdue = await prisma.task.count({
                where: {
                    project: {
                        projectMembers: {
                            some: {
                                userId: ctx.user.id
                            }
                        }
                    },
                    dueDate: {
                        lt: now
                    },
                    status: {
                        not: 'DONE'
                    }
                }
            })

            const completed = await prisma.task.count({
                where: {
                    project: {
                        projectMembers: {
                            some: { userId: ctx.user.id }
                        }
                    },
                    status: "DONE"
                }
            })


            return {
                totalProjects,
                activeThisWeek,
                tasksDueToday,
                overdue,
                completed
            }
        })
}) 