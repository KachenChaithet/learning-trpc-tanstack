import { TaskStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { createNotification } from "@/server/sockets/services/notification-service";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { task } from "better-auth/react";
import { id, pl } from "date-fns/locale";
import { ReceiptRussianRuble, TicketSlash } from "lucide-react";
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

            return prisma.$transaction(async (tx) => {
                const task = await tx.task.create({
                    data: {
                        title: input.title,
                        projectId: input.projectId,
                        assigneeId: input.assigneeId,
                        ...(input.description !== undefined && {
                            description: input.description
                        }),
                        createdById: ctx.user.id,
                        dueDate: input.dueDate,
                        status: input.status,
                        priority: input.priority
                    }
                })

                await tx.activityLog.create({
                    data: {
                        type: 'TASK_CREATED',
                        actorId: ctx.user.id,
                        projectId: input.projectId,
                        taskId: task.id,
                        metadata: {
                            title: task.title
                        }
                    }
                })
                if (input.assigneeId) {
                    const assignee = await tx.user.findUnique({
                        where: {
                            id: input.assigneeId
                        },
                        select: {
                            name: true
                        }
                    })
                    await tx.activityLog.create({
                        data: {
                            type: 'TASK_ASSIGNED',
                            actorId: ctx.user.id,
                            projectId: task.projectId,
                            taskId: task.id,
                            metadata: {
                                assigneeId: input.assigneeId,
                                assigneeName: assignee?.name ?? "Unknown User",
                            }
                        }
                    })
                }

                if (input.assigneeId !== ctx.user.id) {
                    createNotification({
                        userId: input.assigneeId,
                        type: 'TASK_ASSIGNED',
                        link: `/my-tasks/${task.id}`
                    })
                }



                return task
            })

        }),
    updatePriority: protectedProcedure
        .input(z.object({
            taskId: z.string(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"])
        }))
        .mutation(async ({ ctx, input }) => {
            return prisma.$transaction(async (tx) => {
                const task = await tx.task.findUnique({
                    where: { id: input.taskId },
                    select: { priority: true, projectId: true }
                })

                if (!task) throw new TRPCError({ code: "NOT_FOUND" })

                const isMember = await tx.projectMember.findFirst({
                    where: { projectId: task.projectId, userId: ctx.user.id }
                })
                if (!isMember) throw new TRPCError({ code: "FORBIDDEN" })

                const updatedTask = await tx.task.update({
                    where: { id: input.taskId },
                    data: { priority: input.priority }
                })

                await tx.activityLog.create({
                    data: {
                        type: "TASK_PRIORITY_CHANGED",
                        actorId: ctx.user.id,
                        projectId: task.projectId,
                        taskId: input.taskId,
                        metadata: {
                            from: task.priority,
                            to: input.priority
                        }
                    }
                })

                return updatedTask
            })
        }),
    updateStatus: protectedProcedure
        .input(z.object({ taskId: z.string(), status: z.nativeEnum(TaskStatus) }))
        .mutation(async ({ ctx, input }) => {
            return prisma.$transaction(async (tx) => {

                const existingTask = await tx.task.findUnique({
                    where: { id: input.taskId },
                    select: { status: true, projectId: true }
                })

                if (!existingTask) {
                    throw new TRPCError({ code: "NOT_FOUND" })
                }

                if (existingTask.status === input.status) {
                    throw new TRPCError({ code: "FORBIDDEN" })
                }
                const isAssignee = await tx.task.findFirst({
                    where: { id: input.taskId, assigneeId: ctx.user.id }
                })
                if (!isAssignee) {
                    throw new TRPCError({ code: "FORBIDDEN", message: "You are not the assignee" })
                }

                const updatedTask = await tx.task.update({
                    where: {
                        id: input.taskId,
                        assigneeId: ctx.user.id
                    },
                    data: {
                        status: input.status
                    }
                })
                await tx.activityLog.create({
                    data: {
                        type: "TASK_STATUS_CHANGED",
                        actorId: ctx.user.id,
                        projectId: existingTask.projectId,
                        taskId: input.taskId,
                        metadata: {
                            form: existingTask.status,
                            to: input.status
                        }
                    }
                })




                if (input.status === 'DONE') {
                    const owners = await tx.projectMember.findMany({
                        where: {
                            projectId: existingTask.projectId,
                            role: 'OWNER'
                        },
                        select: {
                            userId: true
                        }
                    })
                    for (const owner of owners) {
                        if (owner.userId !== ctx.user.id) {
                            await createNotification({
                                userId: owner.userId,
                                link: `/my-tasks/${input.taskId}`,
                                type: "TASK_COMPLETED"
                            })
                        }
                    }
                }


                return updatedTask
            })
        }),
    getMany: protectedProcedure
        .input(
            z.object({
                projectId: z.string().optional(),
                priority: z.enum(["ALL", "LOW", "MEDIUM", "HIGH"]).optional(),
                date: z.enum(["newest", "oldest"]).optional(),
                tab: z.enum(["today", "week", "overdue", "completed"]).optional(),
                view: z.enum(["assignedToMe", "assignedByMe"]),
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
                    archived: false,
                    ...(input.view === 'assignedToMe' && {
                        assigneeId: ctx.user.id
                    }),

                    ...(input.view === 'assignedByMe' && {
                        createdById: ctx.user.id,

                    }),

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
                        OR: [
                            {
                                dueDate: {
                                    gte: now
                                }
                            },
                            {
                                dueDate: null
                            }
                        ],
                        status: {
                            not: 'DONE'
                        }
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
                        },
                        status: {
                            not: 'DONE'
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
                    assignee: {
                        select: {
                            name: true
                        }
                    }
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
        }),
    myUpcomingTasks: protectedProcedure
        .query(async ({ ctx }) => {
            const now = new Date()

            const tasks = await prisma.task.findMany({
                where: {
                    assigneeId: ctx.user.id,
                    dueDate: {
                        gte: now
                    },
                    status: {
                        not: 'DONE'
                    },
                },
                include: {
                    project: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    dueDate: 'asc'
                },
                take: 5
            })

            return tasks.map((p) => ({
                id: p.id,
                projectName: p.project.name,
                projectId: p.projectId,
                taskTitle: p.title,
                dueDate: p.dueDate
            }))
        }),
    getDetailTask: protectedProcedure
        .input(z.object({
            taskId: z.string()
        }))
        .query(async ({ ctx, input }) => {

            const baseTask = await prisma.task.findUnique({
                where: { id: input.taskId },
                select: { projectId: true }
            })

            if (!baseTask) return null

            const task = await prisma.task.findUnique({
                where: { id: input.taskId },
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            projectMembers: {
                                where: { userId: ctx.user.id },
                                select: { role: true }
                            }
                        }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            image: true,
                            name: true,
                            projectMembers: {
                                select: {
                                    id: true,
                                    role: true
                                }
                            }
                        }
                    },
                    activityLogs: {
                        orderBy: { createdAt: 'desc' },
                        select: {
                            actor: {
                                select: {
                                    id: true,
                                    image: true,
                                    name: true
                                }
                            },
                            id: true,
                            type: true,
                            createdAt: true,
                            task: true,
                            project: true,
                            metadata: true

                        }
                    },

                },

            })

            if (!task) return null

            const activities = task.activityLogs.map((a) => {
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
                            dateKey: a.createdAt.toISOString().split("T")[0],
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

            return {
                ...task,
                activityLogs: activities,
                currentUserRole: task.project.projectMembers[0]?.role ?? null
            }
        }),
    getTaskComments: protectedProcedure
        .input(z.object({ taskId: z.string() }))
        .query(async ({ ctx, input }) => {
            const comments = await prisma.comment.findMany({
                where: {
                    taskId: input.taskId
                },
                include: {
                    author: true
                }
            })

            return comments.map((c) => ({
                id: c.id,
                message: c.content,
                author: {
                    id: c.author.id,
                    name: c.author.name,
                    image: c.author.image
                },
                createdAt: c.createdAt
            }))
        }),
    createComment: protectedProcedure
        .input(z.object({ message: z.string().min(1), taskId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const comment = await prisma.comment.create({
                data: {
                    content: input.message,
                    authorId: ctx.user.id,
                    taskId: input.taskId,
                },
                include: {
                    author: true
                }
            })


            const task = await prisma.task.findUnique({
                where: {
                    id: input.taskId
                },
                select: {
                    assigneeId: true,
                    projectId: true
                }
            })

            await prisma.activityLog.create({
                data: {
                    type: 'COMMENT_ADDED',
                    actorId: ctx.user.id,
                    projectId: task?.projectId,
                    taskId: input.taskId,
                    metadata: {
                        commentId: comment.id
                    }
                }
            })


            if (task?.assigneeId && task.assigneeId != ctx.user.id) {
                createNotification({
                    userId: task?.assigneeId,
                    link: `/my-tasks/${input.taskId}`,
                    type: 'TASK_COMMENT'
                })
            }

            return {
                id: comment.id,
                message: comment.content,
                taskId: comment.taskId,
                author: {
                    id: comment.author.id,
                    name: comment.author.name,
                    image: comment.author.image
                },
                createdAt: comment.createdAt
            }
        }),
    updateArchive: protectedProcedure
        .input(z.object({ taskId: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const task = await prisma.task.findUnique({
                where: {
                    id: input.taskId
                },
                include: {
                    project: {
                        include: {
                            projectMembers: true
                        }
                    }
                }
            })

            if (!task) throw new TRPCError({ code: 'NOT_FOUND' })

            const member = task.project.projectMembers.find(m => m.userId === ctx.user.id)
            if (!member) throw new TRPCError({ code: 'FORBIDDEN', message: "You are not a member of this project" })

            if (member.role === 'MEMBER') throw new TRPCError({ code: 'FORBIDDEN', message: "You don't have permission to archive this task" })

            return prisma.task.update({
                where: {
                    id: input.taskId
                },
                data: {
                    archived: true
                }
            })
        }),
    duplicateTask: protectedProcedure
        .input(z.object({ taskId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const task = await prisma.task.findUnique({
                where: {
                    id: input.taskId
                }
            })

            if (!task) throw new Error('Task not found')

            const baseTitle = task.title.replace(/\s\(copy.*\)$/, "")

            const copies = await prisma.task.count({
                where: {
                    title: { startsWith: baseTitle },
                    projectId: task.projectId
                }
            })

            let newTitle = `${baseTitle} (copy)`

            if (copies > 1) {
                newTitle = `${baseTitle} (copy ${copies})`
            }
            const newTask = await prisma.task.create({
                data: {
                    title: newTitle,
                    description: task.description,
                    status: 'TODO',
                    priority: task.priority,
                    projectId: task.projectId,
                    assigneeId: task.assigneeId,
                    createdById: task.createdById,
                    dueDate: task.dueDate
                }
            })

            return newTask
        }),
    unassignTask: protectedProcedure
        .input(z.object({ taskId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return prisma.$transaction(async (tx) => {
                const task = await tx.task.findUnique({
                    where: { id: input.taskId },
                    select: {
                        assigneeId: true,
                        projectId: true,
                        title: true
                    }
                })

                if (!task) throw new TRPCError({ code: 'NOT_FOUND' })

                const isMember = await tx.projectMember.findFirst({
                    where: {
                        projectId: task.projectId,
                        userId: ctx.user.id,
                        role: { in: ['ADMIN', 'OWNER'] }
                    }
                })
                if (!isMember) throw new TRPCError({ code: "FORBIDDEN" })

                const updateTask = await tx.task.update({
                    where: { id: input.taskId },
                    data: { assigneeId: null }
                })

                await tx.activityLog.create({
                    data: {
                        type: 'TASK_UNASSIGNED',
                        actorId: ctx.user.id,
                        projectId: task.projectId,
                        taskId: input.taskId,
                        metadata: {
                            previousAssigneeId: task.assigneeId
                        }
                    }
                })

                return updateTask
            })
        }),
    removeTask: protectedProcedure
        .input(z.object({ taskId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const task = await prisma.task.findUnique({
                where: { id: input.taskId },
                include: {
                    createdBy: true,
                }
            })

            if (!task) throw new TRPCError({ code: "NOT_FOUND" })

            const isOwner = await prisma.projectMember.findFirst({
                where: {
                    projectId: task.projectId,
                    userId: ctx.user.id,
                    role: "OWNER"
                }
            })


            if (!isOwner && task.createdById !== ctx.user.id) {
                throw new TRPCError({ code: "FORBIDDEN" })
            }

            return prisma.$transaction(async (tx) => {
                await tx.activityLog.create({
                    data: {
                        type: "TASK_DELETED",
                        actorId: ctx.user.id,
                        projectId: task.projectId,
                        metadata: {
                            taskTitle: task.title
                        }
                    }
                })

                return tx.task.delete({
                    where: {
                        id: input.taskId
                    }
                })
            })

        })

})