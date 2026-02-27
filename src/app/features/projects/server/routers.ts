import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { id } from "date-fns/locale";
import { exit, rawListeners } from "process";
import z, { string } from "zod";
import { owners } from "../components/projects";
import { JoinRequestStatus } from "@/generated/prisma/enums";

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
        .mutation(({ ctx, input }) => {
            return prisma.project.create({
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
        }),
    getMine: protectedProcedure.query(({ ctx }) => {
        return prisma.project.findMany({
            where: {
                projectMembers: {
                    some: {
                        userId: ctx.user.id
                    }
                },
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

})