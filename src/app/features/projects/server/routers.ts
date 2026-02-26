import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { id } from "date-fns/locale";
import z from "zod";

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
    getPublic: protectedProcedure.query(({ ctx }) => {
        return prisma.project.findMany({
            where: {
                visibility: 'PUBLIC',
                NOT: {
                    projectMembers: {
                        some: {
                            userId: ctx.user.id
                        }
                    }
                }
            },
            include: {
                projectMembers: {
                    where: {
                        role: "OWNER"
                    },
                    select: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })
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
                            role: { in: ['OWNER', "MEMBER", 'ADMIN'] }
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
        })
})