-- CreateEnum
CREATE TYPE "PropertyPublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "google_map_coordinates" VARCHAR(255),
ADD COLUMN     "status" "PropertyPublishStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "url_video" VARCHAR(255);
