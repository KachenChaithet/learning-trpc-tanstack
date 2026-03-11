import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { id } from "date-fns/locale";
import { exit, rawListeners } from "process";
import z, { string } from "zod";
import { owners } from "../components/projects";
import { JoinRequestStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

export const ProjectRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            name: z.string()
                .min(1, "Project name is required")
                .max(100, "Project too long")
            ,
            description: z.string()
                .max(500, "Description too long")
                .optional(),
            visibility: z.enum(["PRIVATE", "PUBLIC"])

        }))
        .mutation(async ({ ctx, input }) => {
            return await prisma.$transaction(async (tx) => {
                const project = await tx.project.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        visibility: input.visibility,
                        projectMembers: {
                            create: {
                                userId: ctx.user.id,
                                role: "OWNER"
                            }
                        }
                    }
                })

                await tx.activityLog.create({
                    data: {
                        type: 'PROJECT_CREATED',
                        actorId: ctx.user.id,
                        projectId: project.id,
                        metadata: {
                            projectName: project.name
                        }

                    }
                })


                return project
            })


        }),
    getMine: protectedProcedure.query(async ({ ctx }) => {
        const projects = await prisma.project.findMany({
            where: {
                projectMembers: {
                    some: {
                        userId: ctx.user.id
                    }
                },
            },
            include: {
                tasks: {
                    select: {
                        status: true
                    }
                }
            }
        })

        return projects.map(({ tasks, ...project }) => {
            const total = tasks.length
            const done = tasks.filter(t => t.status === 'DONE').length


            return {
                ...project,
                totalTasks: total,
                completedTasks: done,
                progress: total === 0 ? 0 : Math.round((done / total) * 100)
            }
        })
    }),
    getPublic: protectedProcedure.query(async ({ ctx }) => {
        const projects = await prisma.project.findMany({
            where: {
                visibility: 'PUBLIC',
                NOT: {
                    projectMembers: {
                        some: { userId: ctx.user.id }
                    },
                }
            },
            include: {
                projectMembers: {
                    where: { role: "OWNER" },
                    select: {
                        user: { select: { name: true } }
                    }
                },
                projectJoinRequests: {
                    where: { userId: ctx.user.id },
                    select: { status: true },
                    take: 1
                }
            },
        })

        return projects.map(p => ({
            id: p.id,
            name: p.name,
            owner: p.projectMembers[0]?.user.name ?? null,
            JoinRequestStatus: p.projectJoinRequests[0]?.status ?? null

        }))

    }),
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const project = await prisma.project.findFirst({
                where: {
                    id: input.id,
                    projectMembers: {
                        some: {
                            userId: ctx.user.id,
                            role: 'OWNER'
                        }
                    }
                }
            })
            if (!project) {
                throw new TRPCError({ code: "FORBIDDEN" })
            }

            return prisma.project.delete({
                where: { id: input.id }
            })
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string()
                .min(1, "Project name is required")
                .max(100, "Project too long"),
            description: z.string()
                .max(500, "Description too long")
                .optional(),
            visibility: z.enum(["PRIVATE", "PUBLIC"])

        }))
        .mutation(async ({ ctx, input }) => {
            const project = await prisma.project.findFirst({
                where: {
                    id: input.id,
                    projectMembers: {
                        some: {
                            userId: ctx.user.id,
                            role: { in: ['OWNER', 'ADMIN'] }
                        }
                    }
                }
            })

            if (!project) throw new TRPCError({ code: "FORBIDDEN" })

            return prisma.project.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    description: input.description,
                    visibility: input.visibility
                }
            })
        }),
    getJoinRequests: protectedProcedure
        .query(async ({ ctx }) => {
            const projectJoinRequests = await prisma.projectJoinRequest.findMany({
                where: {
                    status: 'PENDING',
                    project: {
                        projectMembers: {
                            some: {
                                userId: ctx.user.id,
                                role: 'OWNER'
                            }
                        }
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            return projectJoinRequests.map((r) => ({
                id: r.id,
                projectId: r.project.id,
                projectName: r.project.name,
                userId: r.user.id,
                userName: r.user.name,
                userEmail: r.user.email,
                createdAt: r.createdAt
            }))
        }),

    requestJoin: protectedProcedure.input(z.object({ projectId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await prisma.projectJoinRequest.findFirst({
                where: {
                    projectId: input.projectId,
                    userId: ctx.user.id,
                    status: 'PENDING'
                }
            })

            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You already have a pending request for this project."
                })
            }

            return prisma.projectJoinRequest.create({
                data: {
                    projectId: input.projectId,
                    userId: ctx.user.id
                },
                include: {
                    project: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        }),
    cancelJoin: protectedProcedure.input(z.object({ projectId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await prisma.projectJoinRequest.delete({
                where: {
                    projectId_userId: {
                        projectId: input.projectId,
                        userId: ctx.user.id
                    }
                }
            })
        }),
    approveJoin: protectedProcedure
        .input(z.object({ requestId: z.string() }))
        .mutation(async ({ ctx, input }) => {

            // user ขอ project ไหน ตรวจจาก projectJoinRequest.id
            const request = await prisma.projectJoinRequest.findFirst({
                where: { id: input.requestId },
                include: { project: true }
            })

            if (!request) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }

            const isOwner = await prisma.projectMember.findFirst({
                where: {
                    projectId: request.projectId,
                    userId: ctx.user.id,
                    role: "OWNER"
                }
            })

            if (!isOwner) {
                throw new TRPCError({ code: 'FORBIDDEN' })
            }

            if (request.status !== 'PENDING') {
                throw new TRPCError({ code: "BAD_REQUEST" })
            }

            await prisma.$transaction([
                prisma.projectJoinRequest.update({
                    where: { id: input.requestId },
                    data: { status: "APPROVED" }
                }),
                prisma.projectMember.create({
                    data: {
                        projectId: request.projectId,
                        userId: request.userId,
                        role: 'MEMBER'
                    }
                })
            ])

            return { success: true }

        }),
    rejectJoin: protectedProcedure
        .input(z.object({ requestId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const request = await prisma.projectJoinRequest.findFirst({
                where: { id: input.requestId }
            })

            if (!request) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }

            const isOwner = await prisma.projectMember.findFirst({
                where: {
                    projectId: request.projectId,
                    userId: ctx.user.id,
                    role: 'OWNER'
                }
            })

            if (!isOwner) {
                throw new TRPCError({ code: 'FORBIDDEN' })
            }

            await prisma.projectJoinRequest.update({
                where: { id: input.requestId, },
                data: { status: 'REJECTED' }
            })

        }),
    listForFilter: protectedProcedure.query(async ({ ctx }) => {
        return prisma.project.findMany({
            where: {
                projectMembers: {
                    some: { userId: ctx.user.id },
                },
            },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        })
    }),
    ownerProject: protectedProcedure.query(async ({ ctx }) => {
        const owners = await prisma.projectMember.findMany({
            where: {
                project: {
                    projectMembers: {
                        some: {
                            userId: ctx.user.id
                        }
                    }
                },
                role: 'OWNER'
            },
            distinct: ["userId"],
            select: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        return owners.map(o => o.user)
    }),
    filterProjects: protectedProcedure
        .input(z.object({
            search: z.string().optional(),
            status: z.enum(["planning", "in_progress", "on_hold", "completed"]).default("planning").optional(),
            owner: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {

            const conditions: Prisma.ProjectWhereInput[] = []

            conditions.push({
                projectMembers: {
                    some: { userId: ctx.user.id }
                }
            })

            if (input.owner) {
                conditions.push({
                    projectMembers: {
                        some: {
                            userId: input.owner,
                            role: "OWNER"
                        }
                    }
                })
            }

            if (input.search) {
                conditions.push({
                    OR: [
                        {
                            name: {
                                contains: input.search,
                                mode: "insensitive"
                            }
                        },
                        {
                            description: {
                                contains: input.search,
                                mode: "insensitive"
                            }
                        }
                    ]
                })
            }

            const projects = await prisma.project.findMany({
                where: {
                    AND: conditions
                },
                include: {
                    tasks: {
                        select: { status: true }
                    }
                }
            })

            const mappedProjects = projects.map(({ tasks, ...project }) => {

                const total = tasks.length
                const done = tasks.filter(t => t.status === "DONE").length

                let status: "planning" | "in_progress" | "on_hold" | "completed" = "planning"

                if (total === 0) status = "planning"
                else if (tasks.some(t => t.status === "IN_PROGRESS")) status = "in_progress"
                else if (tasks.every(t => t.status === "DONE")) status = "completed"
                else status = "on_hold"

                return {
                    ...project,
                    totalTasks: total,
                    completedTasks: done,
                    progress: total === 0 ? 0 : Math.round((done / total) * 100),
                    status
                }
            })

            if (input.status) {
                return mappedProjects.filter(p => p.status === input.status)
            }

            return mappedProjects
        })
})