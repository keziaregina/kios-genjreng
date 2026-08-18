-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'MERCHANT');
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'BUYER';
