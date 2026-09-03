import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { assertCanManageProfile } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({ profileId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { profileId } = parsed.data;
    await assertCanManageProfile(session, profileId, "EMERGENCY");
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        nfcTags: { where: { status: "EMERGENCY" }, take: 1 },
        emergencyEvents: { where: { status: "ACTIVE" }, orderBy: { activatedAt: "desc" }, take: 1 },
      },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    if (!profile.emergencyMode) {
      return NextResponse.json({ error: "Not in emergency mode" }, { status: 400 });
    }
    const tag = profile.nfcTags[0];
    const event = profile.emergencyEvents[0];
    await prisma.$transaction([
      prisma.profile.update({
        where: { id: profileId },
        data: { emergencyMode: false, emergencyActivatedAt: null, emergencyActivatedBy: null },
      }),
      ...(event
        ? [prisma.emergencyEvent.update({ where: { id: event.id }, data: { status: "RESOLVED", deactivatedAt: new Date() } })]
        : []),
      ...(tag
        ? [prisma.nFCTag.update({ where: { id: tag.id }, data: { status: "ACTIVE" } })]
        : []),
    ]);
    await writeAuditLog({
      userId: session.userId,
      action: "EMERGENCY_MODE_DEACTIVATED",
      targetType: "Profile",
      targetId: profileId,
      metadata: { eventId: event?.id, tagId: tag?.publicTagId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("UNAUTHORIZED")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg.includes("FORBIDDEN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[emergency/deactivate]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
