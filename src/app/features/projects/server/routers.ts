import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
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
                .optional()
        }))
        .mutation(({ ctx, input }) => {
            return prisma.project.create({
                data: {
                    name: input.name,
                    description: input.description,
                    projectMembers: {
                        create: {
                            userId: ctx.user.id,
                            role: "OWNER"
                        }
                    }
                }
            })
        }),
    getMany: protectedProcedure.query(({ ctx }) => {
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
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.project.delete({
                where: {
                    id: input.id,
                }
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
                .optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const project = await prisma.project.findFirst({
                where: {
                    id: input.id,
                    projectMembers: {
                        some: {
                            userId: ctx.user.id
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
                    description: input.description
                }
            })
        })
})