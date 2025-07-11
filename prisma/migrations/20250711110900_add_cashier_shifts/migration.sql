-- AlterTable
ALTER TABLE "cashiers" ADD COLUMN     "shifts" TEXT[] DEFAULT ARRAY[]::TEXT[];
