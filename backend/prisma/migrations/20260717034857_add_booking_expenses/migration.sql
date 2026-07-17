-- CreateEnum
CREATE TYPE "BkExpensePeriod" AS ENUM ('MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "bk_expenses" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "period_type" "BkExpensePeriod" NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bk_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bk_expenses_user_id_year_month_idx" ON "bk_expenses"("user_id", "year", "month");

-- CreateIndex
CREATE INDEX "bk_expenses_user_id_period_type_year_idx" ON "bk_expenses"("user_id", "period_type", "year");

-- AddForeignKey
ALTER TABLE "bk_expenses" ADD CONSTRAINT "bk_expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
