# SafeTag — Customer App

Customer-facing SafeTag application: registration, login, profile management,
emergency mode toggle, and the public NFC tag landing page (`/p/[publicTagId]`).

Staff/admin tooling is a **separate app** (not included in this zip) that
connects to the **same database**. See "Two-app architecture" below.

## What's inside

```
main/                      ← set this as the Vercel Root Directory
  src/app/                 ← Next.js App Router pages & API routes
  src/components/
  src/lib/                 ← auth, prisma client, validation, permissions
  prisma/schema.prisma     ← database schema (shared schema, same DB as staff app)
  prisma/bootstrap.sql     ← schema-only fallback if you can't run `prisma db push`
  package.json
  .env.example
```

## 1. Create the GitHub repo

```bash
cd main
git init
git add .
git commit -m "Initial commit: SafeTag customer app"
git branch -M main
git remote add origin https://github.com/<you>/safetag-customer.git
git push -u origin main
```

## 2. Set up Neon (PostgreSQL)

1. Create a Neon project (or reuse the one the staff app will also use — see below).
2. Copy the pooled connection string it gives you.

## 3. Deploy to Vercel

1. Import the GitHub repo into Vercel.
2. **Root Directory**: leave as `.` (this zip's `main/` folder *is* the repo root once pushed).
3. Environment variables (Project Settings → Environment Variables):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string |
   | `AUTH_SECRET` | a random string, 32+ characters (`openssl rand -base64 32`) |
   | `NEXT_PUBLIC_APP_URL` | your customer domain, e.g. `https://safetag.co.za` |
   | `NEXT_PUBLIC_APP_NAME` | `SafeTag` |
4. Deploy.

## 4. Create the database tables

From your local machine, with `DATABASE_URL` set to the same Neon connection string:

```bash
npm install
npx prisma db push
```

This creates every table Prisma's schema defines (`User`, `Profile`, `NFCTag`,
`EmergencyContact`, `GuardianRelationship`, `EmergencyEvent`, `AuditLog`, etc).
Don't run `bootstrap.sql` unless `prisma db push` is unavailable to you — it
only creates the `User` table as a minimal fallback.

## Two-app architecture

This app and the staff app are **fully separate Next.js codebases**, each with
their own repo and Vercel deployment/domain, but they point at the **same**
`DATABASE_URL` (same Neon database). There's no shared code between them by
design — a customer never loads any staff code, and vice versa.

- Customer app (this one): public marketing page, `/login`, `/register`,
  `/dashboard`, `/dashboard/profile/[id]`, `/p/[publicTagId]` (public tag page).
- Staff app (separate zip): `/login` (staff-only), dashboard, profile
  management, NFC tag admin, guardians, active emergencies, audit log,
  superadmin XLSX export.

Give each app its **own** `AUTH_SECRET`. Sessions are cookie-scoped to each
app's own domain anyway, but using different secrets means a compromise of
one app's secret can't be used to forge sessions on the other.

## Security notes

- `AUTH_SECRET` must be 32+ random characters — the app refuses to start
  without one, on purpose.
- Never commit real credentials to `prisma/bootstrap.sql` or anywhere else in
  this repo. Staff accounts are created via the seed script in the **admin**
  app, which reads credentials from environment variables at run time only.
- If you ever find a plaintext password or hash in git history, rotating the
  credential is what actually fixes the exposure — deleting the file or
  rewriting history afterwards is hygiene, not a fix on its own.
