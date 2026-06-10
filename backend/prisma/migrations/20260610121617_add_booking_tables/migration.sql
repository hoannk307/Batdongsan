-- CreateEnum
CREATE TYPE "BkBookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "bk_rooms" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bk_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bk_sources" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bk_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bk_bookings" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "source_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(50),
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "price_per_night" DECIMAL(15,2) NOT NULL,
    "estimated_revenue" DECIMAL(15,2) NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "comment" TEXT,
    "status" "BkBookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bk_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bk_surcharges" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bk_surcharges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bk_payments" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bk_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bk_locked_days" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "locked_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bk_locked_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bk_rooms_user_id_idx" ON "bk_rooms"("user_id");

-- CreateIndex
CREATE INDEX "bk_sources_user_id_idx" ON "bk_sources"("user_id");

-- CreateIndex
CREATE INDEX "bk_bookings_room_id_idx" ON "bk_bookings"("room_id");

-- CreateIndex
CREATE INDEX "bk_bookings_user_id_idx" ON "bk_bookings"("user_id");

-- CreateIndex
CREATE INDEX "bk_bookings_check_in_check_out_idx" ON "bk_bookings"("check_in", "check_out");

-- CreateIndex
CREATE INDEX "bk_surcharges_booking_id_idx" ON "bk_surcharges"("booking_id");

-- CreateIndex
CREATE INDEX "bk_payments_booking_id_idx" ON "bk_payments"("booking_id");

-- CreateIndex
CREATE INDEX "bk_locked_days_room_id_locked_date_idx" ON "bk_locked_days"("room_id", "locked_date");

-- CreateIndex
CREATE UNIQUE INDEX "bk_locked_days_room_id_locked_date_key" ON "bk_locked_days"("room_id", "locked_date");

-- AddForeignKey
ALTER TABLE "bk_rooms" ADD CONSTRAINT "bk_rooms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_sources" ADD CONSTRAINT "bk_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_bookings" ADD CONSTRAINT "bk_bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "bk_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_bookings" ADD CONSTRAINT "bk_bookings_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "bk_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_bookings" ADD CONSTRAINT "bk_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_surcharges" ADD CONSTRAINT "bk_surcharges_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bk_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_payments" ADD CONSTRAINT "bk_payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bk_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_locked_days" ADD CONSTRAINT "bk_locked_days_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "bk_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
