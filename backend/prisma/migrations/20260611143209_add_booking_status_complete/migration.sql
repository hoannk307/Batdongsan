/*
  Warnings:

  - The values [CONFIRMED,CANCELLED] on the enum `BkBookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BkBookingStatus_new" AS ENUM ('COMPLETED', 'DEPOSITED', 'UNPAID');
ALTER TABLE "public"."bk_bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bk_bookings" ALTER COLUMN "status" TYPE "BkBookingStatus_new" USING ("status"::text::"BkBookingStatus_new");
ALTER TYPE "BkBookingStatus" RENAME TO "BkBookingStatus_old";
ALTER TYPE "BkBookingStatus_new" RENAME TO "BkBookingStatus";
DROP TYPE "public"."BkBookingStatus_old";
ALTER TABLE "bk_bookings" ALTER COLUMN "status" SET DEFAULT 'DEPOSITED';
COMMIT;

-- AlterTable
ALTER TABLE "bk_bookings" ALTER COLUMN "status" SET DEFAULT 'DEPOSITED';
