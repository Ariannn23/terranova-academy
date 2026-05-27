ALTER TABLE "Payment"
ADD COLUMN "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Payment"
SET "balance" = CASE
  WHEN "status" = 'PAGADO' THEN 0
  ELSE "amount"
END;

CREATE TABLE "PaymentTransaction" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "method" TEXT NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentTransaction_paymentId_idx" ON "PaymentTransaction"("paymentId");
CREATE INDEX "PaymentTransaction_paidAt_idx" ON "PaymentTransaction"("paidAt");
CREATE INDEX "PaymentTransaction_createdBy_idx" ON "PaymentTransaction"("createdBy");

ALTER TABLE "PaymentTransaction"
ADD CONSTRAINT "PaymentTransaction_paymentId_fkey"
FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
