-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "role" "ProjectRole" NOT NULL DEFAULT 'MEMBER';
