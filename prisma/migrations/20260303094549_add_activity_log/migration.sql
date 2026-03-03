-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TASK_CREATED', 'TASK_STATUS_CHANGED', 'TASK_PRIORITY_CHANGED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED', 'TASK_DELETED', 'PROJECT_CREATED', 'PROJECT_MEMBER_ADDED', 'PROJECT_MEMBER_REMOVED', 'COMMENT_ADDED');

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "projectId" TEXT,
    "taskId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_projectId_idx" ON "ActivityLog"("projectId");

-- CreateIndex
CREATE INDEX "ActivityLog_taskId_idx" ON "ActivityLog"("taskId");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_idx" ON "ActivityLog"("actorId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
