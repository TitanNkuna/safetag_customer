import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.passwordHash || !user.isActive) {
      await writeAuditLog({ action: "LOGIN_FAILURE", metadata: { email, portal: "customer" } });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await writeAuditLog({ userId: user.id, action: "LOGIN_FAILURE", metadata: { portal: "customer" } });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isStaff = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    if (isStaff) {
      await writeAuditLog({
        userId: user.id,
        action: "LOGIN_FAILURE",
        metadata: { portal: "customer", reason: "staff_on_customer_portal" },
      });
      return NextResponse.json(
        { error: "Staff accounts must sign in at the staff portal, not here." },
        { status: 403 }
      );
    }

    const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await writeAuditLog({ userId: user.id, action: "LOGIN_SUCCESS", metadata: { portal: "customer" } });

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
