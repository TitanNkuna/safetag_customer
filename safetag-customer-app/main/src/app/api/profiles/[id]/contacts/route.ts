import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { assertCanManageProfile } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { emergencyContactSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: profileId } = await params;
    await assertCanManageProfile(session, profileId, "EDIT");

    const body = await req.json();
    const parsed = emergencyContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contact details", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const contact = await prisma.emergencyContact.create({
      data: { ...parsed.data, profileId },
    });

    await writeAuditLog({
      userId: session.userId,
      action: "EMERGENCY_CONTACT_ADDED",
      targetType: "Profile",
      targetId: profileId,
      metadata: { contactId: contact.id, name: contact.name },
    });

    return NextResponse.json({ ok: true, contact });
  } catch (err) {
    return errorResponse(err, "[profiles/:id/contacts POST]");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: profileId } = await params;
    await assertCanManageProfile(session, profileId, "EDIT");

    const { contactId } = z.object({ contactId: z.string() }).parse(await req.json());
    const contact = await prisma.emergencyContact.findUnique({ where: { id: contactId } });
    if (!contact || contact.profileId !== profileId) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    await prisma.emergencyContact.delete({ where: { id: contactId } });

    await writeAuditLog({
      userId: session.userId,
      action: "EMERGENCY_CONTACT_REMOVED",
      targetType: "Profile",
      targetId: profileId,
      metadata: { contactId, name: contact.name },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err, "[profiles/:id/contacts DELETE]");
  }
}

function errorResponse(err: unknown, tag: string) {
  const msg = String(err);
  if (msg.includes("UNAUTHORIZED")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (msg.includes("FORBIDDEN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  console.error(tag, err);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}
