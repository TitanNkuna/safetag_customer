-- SafeTag bootstrap for Neon (run once in the SQL Editor ONLY if `npx prisma db push` is unavailable)
-- Creates the enum + User table so registration / staff login can work.
--
-- Prefer: npx prisma db push   (creates the FULL schema — all tables)
--
-- IMPORTANT: This file intentionally contains NO credentials. Never commit
-- passwords, password hashes, or other secrets to this repository — it is
-- public. To create or reset a staff (ADMIN) account, run the seed script
-- instead, which reads credentials from environment variables and never
-- writes them to disk or git history:
--
--   SEED_ADMIN_EMAIL="you@example.com" SEED_ADMIN_PASSWORD="choose-a-strong-password" npm run seed:admin
--
-- If you previously ran an older version of this file that inserted a
-- hardcoded staff email/password hash, that credential is compromised
-- (it was committed to a public repo) and must be rotated immediately by
-- running the seed script above with a NEW password, regardless of
-- whether git history is scrubbed.

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'GUARDIAN', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "passwordHash" TEXT,
  phone TEXT,
  "phoneVerified" TIMESTAMP(3),
  role "UserRole" NOT NULL DEFAULT 'CUSTOMER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"(email);
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"(phone);
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User"(phone);
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"(role);

-- No INSERT statements here on purpose. Create the staff account with:
--   npm run seed:admin
