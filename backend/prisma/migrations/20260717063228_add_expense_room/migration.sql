-- AlterTable
ALTER TABLE "bk_expenses" ADD COLUMN     "room_id" INTEGER;

-- CreateIndex
CREATE INDEX "bk_expenses_room_id_idx" ON "bk_expenses"("room_id");

-- AddForeignKey
ALTER TABLE "bk_expenses" ADD CONSTRAINT "bk_expenses_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "bk_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
