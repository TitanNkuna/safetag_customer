import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  publicTagId: z.string(),
  tagId: z.string(),
  profileId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
});

/**
 * Optional, explicit location share from a finder.
 * Never called automatically. Requires browser permission.
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);

    // Verify tag + profile still in emergency
    const tag = await prisma.nFCTag.findFirst({
      where: {
        id: data.tagId,
        publicTagId: data.publicTagId.toUpperCase(),
        profileId: data.profileId,
      },
      include: {
        profile: true,
      },
    });

    if (!tag || !tag.profile) {
      return NextResponse.json({ error: "Invalid tag" }, { status: 404 });
    }

    if (!tag.profile.emergencyMode && tag.status !== "EMERGENCY") {
      return NextResponse.json(
        { error: "Not in emergency mode" },
        { status: 400 }
      );
    }

    // Find active emergency event if any
    const activeEvent = await prisma.emergencyEvent.findFirst({
      where: {
        profileId: data.profileId,
        status: "ACTIVE",
      },
      orderBy: { activatedAt: "desc" },
    });

    await prisma.locationShare.create({
      data: {
        profileId: data.profileId,
        tagId: data.tagId,
        emergencyEventId: activeEvent?.id,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
      },
    });

    // Mark related scan if possible (best effort)
    await prisma.scanEvent.updateMany({
      where: {
        tagId: data.tagId,
        profileId: data.profileId,
        scannedAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
      data: {
        locationRequested: true,
        locationShared: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    console.error("[share-location]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
