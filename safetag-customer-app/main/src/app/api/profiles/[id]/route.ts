import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { assertCanManageProfile } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { profileBasicSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await assertCanManageProfile(session, id, "VIEW");

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        nfcTags: { where: { status: { in: ["ACTIVE", "EMERGENCY"] } }, orderBy: { createdAt: "desc" } },
        emergencyContacts: { orderBy: { priority: "asc" } },
      },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    return NextResponse.json({ profile });
  } catch (err) {
    return errorResponse(err, "[profiles/:id GET]");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await assertCanManageProfile(session, id, "EDIT");

    const body = await req.json();
    const parsed = profileBasicSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile details", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.update({ where: { id }, data: parsed.data });
    await writeAuditLog({
      userId: session.userId,
      action: "PROFILE_UPDATED",
      targetType: "Profile",
      targetId: id,
      metadata: { fields: Object.keys(parsed.data) },
    });
    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    return errorResponse(err, "[profiles/:id PATCH]");
  }
}

function errorResponse(err: unknown, tag: string) {
  const msg = String(err);
  if (msg.includes("UNAUTHORIZED")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (msg.includes("FORBIDDEN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  console.error(tag, err);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}
