import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { assertCanManageProfile } from "@/lib/permissions";
import { generateEmergencyEventNumber } from "@/lib/ids";
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
        nfcTags: { where: { status: { in: ["ACTIVE", "EMERGENCY"] } }, take: 1 },
      },
    });
    if (!profile || profile.status !== "ACTIVE") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.emergencyMode) {
      return NextResponse.json({ error: "Already in emergency mode" }, { status: 400 });
    }
    const eventCount = await prisma.emergencyEvent.count();
    const eventNumber = generateEmergencyEventNumber(eventCount + 1);
    const tag = profile.nfcTags[0];
    const [event] = await prisma.$transaction([
      prisma.emergencyEvent.create({
        data: {
          eventNumber,
          profileId,
          tagId: tag?.id,
          activatedBy: session.userId,
          status: "ACTIVE",
        },
      }),
      prisma.profile.update({
        where: { id: profileId },
        data: {
          emergencyMode: true,
          emergencyActivatedAt: new Date(),
          emergencyActivatedBy: session.userId,
        },
      }),
      ...(tag
        ? [prisma.nFCTag.update({ where: { id: tag.id }, data: { status: "EMERGENCY" } })]
        : []),
    ]);
    await writeAuditLog({
      userId: session.userId,
      action: "EMERGENCY_MODE_ACTIVATED",
      targetType: "Profile",
      targetId: profileId,
      metadata: { eventNumber, tagId: tag?.publicTagId },
    });
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("UNAUTHORIZED")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg.includes("FORBIDDEN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[emergency/activate]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
