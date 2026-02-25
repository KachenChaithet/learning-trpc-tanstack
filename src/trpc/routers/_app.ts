import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { ProjectRouter } from '@/app/features/projects/server/routers';
import { TaskRouter } from '@/app/features/mytasks/server/routers';
export const appRouter = createTRPCRouter({
    hello: protectedProcedure
        .input(
            z.object({
                text: z.string(),
            }),
        )
        .query(({ ctx, input }) => {
            return {
                greeting: `hello ${input.text} ${ctx.user.name}`,
            };
        }),
<<<<<<< Updated upstream
=======
    projects: ProjectRouter,
    tasks: TaskRouter,

>>>>>>> Stashed changes
});
// export type definition of API
export type AppRouter = typeof appRouter;