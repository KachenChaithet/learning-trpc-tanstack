import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { ProjectRouter } from '@/app/features/projects/server/routers';
import { TaskRouter } from '@/app/features/mytasks/server/routers';
import { DashboardRouter } from '@/app/features/dashboard/server/routers';
import { activityRouter } from '@/app/features/activity/server/routers';
import { notificationRouter } from '@/app/features/notifications/server/routers';
import { ProfileRouter } from '@/app/features/profile/server/routers';
export const appRouter = createTRPCRouter({
    hello: protectedProcedure
        .query(({ ctx, input }) => {
            return {
                greeting: `hello ${ctx.user.name}`,
            };
        }),
    projects: ProjectRouter,
    tasks: TaskRouter,
    dashboard: DashboardRouter,
    activity: activityRouter,
    notification: notificationRouter,
    profile: ProfileRouter,

});
// export type definition of API
export type AppRouter = typeof appRouter;