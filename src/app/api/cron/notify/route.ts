import { prisma } from "@/lib/db";
import { createNotification } from "@/server/sockets/services/notification-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await prisma.task.findMany({
        where: {
            dueDate: { lte: tomorrow },
            notifiedAt: null,
            archived: false,
            status: { not: "DONE" },
            assigneeId: { not: null },
        },
    });

    const results = await Promise.allSettled(
        tasks.map(async (task) => {
            await createNotification({
                userId: task.assigneeId!,
                type: "TASK_DUE",
                link: `/my-tasks/${task.id}`,
            });

            await prisma.task.update({
                where: { id: task.id },
                data: { notifiedAt: new Date() },
            });
        })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ succeeded, failed });
}