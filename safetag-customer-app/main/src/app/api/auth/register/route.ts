import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/audit";

function dbErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (
    msg.includes("does not exist") ||
    msg.includes("P2021") ||
    msg.includes("P1001") ||
    msg.includes("Can't reach database")
  ) {
    return "Database is not set up yet. Run prisma db push against Neon, or apply prisma/bootstrap.sql in the Neon SQL Editor.";
  }
  if (msg.includes("P2002") || msg.includes("Unique constraint")) {
    return "Email or phone already registered";
  }
  if (msg.includes("AUTH_SECRET") || msg.includes("secret")) {
    return "Server auth is not configured (AUTH_SECRET).";
  }
  return "Server error";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured on the server." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const first =
        fieldErrors.password?.[0] ||
        fieldErrors.email?.[0] ||
        fieldErrors.phone?.[0] ||
        "Invalid registration details";
      return NextResponse.json({ error: first, fieldErrors }, { status: 400 });
    }

    const { email, password, phone } = parsed.data;
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || null,
        role: "CUSTOMER",
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    await writeAuditLog({
      userId: user.id,
      action: "USER_CREATED",
      targetType: "User",
      targetId: user.id,
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
}
