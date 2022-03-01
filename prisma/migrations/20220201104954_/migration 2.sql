/*
  Warnings:

  - The `timezone` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "timezone",
ADD COLUMN     "timezone" TEXT;

-- DropEnum
DROP TYPE "Timezone";
