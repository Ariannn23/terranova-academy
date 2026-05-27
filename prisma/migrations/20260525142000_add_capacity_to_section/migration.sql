-- Idempotente: la baseline (20260524000000) ya incluye Section.capacity.
ALTER TABLE "public"."Section"
ADD COLUMN IF NOT EXISTS "capacity" INTEGER NOT NULL DEFAULT 30;
