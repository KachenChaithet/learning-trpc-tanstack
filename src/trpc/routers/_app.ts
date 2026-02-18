import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
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
});
// export type definition of API
export type AppRouter = typeof appRouter;