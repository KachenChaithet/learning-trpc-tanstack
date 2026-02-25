import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { ProjectRouter } from '@/app/features/projects/server/routers';
export const appRouter = createTRPCRouter({
    hello: protectedProcedure
        .query(({ ctx, input }) => {
            return {
                greeting: `hello ${ctx.user.name}`,
            };
        }),
    projects: ProjectRouter,

});
// export type definition of API
export type AppRouter = typeof appRouter;