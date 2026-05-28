CREATE TABLE IF NOT EXISTS "public"."TrustedDeviceToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userAgent" TEXT,
  "ip" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),

  CONSTRAINT "TrustedDeviceToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TrustedDeviceToken_tokenHash_key"
ON "public"."TrustedDeviceToken"("tokenHash");

CREATE INDEX IF NOT EXISTS "TrustedDeviceToken_userId_idx"
ON "public"."TrustedDeviceToken"("userId");

CREATE INDEX IF NOT EXISTS "TrustedDeviceToken_expiresAt_idx"
ON "public"."TrustedDeviceToken"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'TrustedDeviceToken_userId_fkey'
  ) THEN
    ALTER TABLE "public"."TrustedDeviceToken"
    ADD CONSTRAINT "TrustedDeviceToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
