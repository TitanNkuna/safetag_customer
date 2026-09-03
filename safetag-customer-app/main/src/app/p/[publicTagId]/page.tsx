import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicProfileView } from "@/components/public/PublicProfileView";
import { EmergencyProfileView } from "@/components/public/EmergencyProfileView";
import { TagErrorView } from "@/components/public/TagErrorView";

interface PageProps {
  params: Promise<{ publicTagId: string }>;
}

/**
 * Public NFC scan endpoint.
 * URL: /p/STAG-8F29KD
 * NEVER exposes private data.
 * Server decides what to show based on tag + profile status.
 */
export default async function PublicTagPage({ params }: PageProps) {
  const { publicTagId } = await params;

  // Basic format guard (server-side)
  if (!/^STAG-[A-Z0-9]{6}$/i.test(publicTagId)) {
    return <TagErrorView type="invalid" />;
  }

  const tag = await prisma.nFCTag.findUnique({
    where: { publicTagId: publicTagId.toUpperCase() },
    include: {
      profile: {
        include: {
          photos: {
            where: { type: "EMERGENCY", isPrimary: true },
            take: 1,
          },
          emergencyContacts: {
            orderBy: { priority: "asc" },
            take: 3,
          },
        },
      },
      replacedBy: true,
    },
  });

  if (!tag) {
    return <TagErrorView type="not_found" />;
  }

  if (tag.status === "DEACTIVATED") {
    return <TagErrorView type="deactivated" />;
  }

  if (tag.status === "REPLACED" && tag.replacedBy) {
    // Soft redirect message; client can follow
    return (
      <TagErrorView
        type="replaced"
        newTagId={tag.replacedBy.publicTagId}
      />
    );
  }

  if (!tag.profile || tag.profile.status !== "ACTIVE") {
    return <TagErrorView type="not_found" />;
  }

  // Record scan (non-blocking best-effort)
  try {
    await prisma.scanEvent.create({
      data: {
        tagId: tag.id,
        profileId: tag.profile.id,
        wasEmergencyMode: tag.profile.emergencyMode,
        emergencyPageAccessed: tag.profile.emergencyMode,
      },
    });
  } catch {
    // ignore scan write failures for public path
  }

  // Emergency Mode takes priority
  if (tag.profile.emergencyMode || tag.status === "EMERGENCY") {
    return (
      <EmergencyProfileView
        profile={{
          firstName: tag.profile.firstName,
          surname: tag.profile.surname,
          preferredName: tag.profile.preferredName,
          dateOfBirth: tag.profile.dateOfBirth,
          photoUrl: tag.profile.photos[0]?.url ?? null,
          emergencyContacts: tag.profile.emergencyContacts.map((c) => ({
            id: c.id,
            name: c.name,
            relationship: c.relationship,
            phone: c.phone,
            priority: c.priority,
          })),
        }}
        publicTagId={tag.publicTagId}
        tagId={tag.id}
        profileId={tag.profile.id}
      />
    );
  }

  // Normal limited public view
  return (
    <PublicProfileView
      profile={{
        firstName: tag.profile.firstName,
        surname: tag.profile.surname,
        preferredName: tag.profile.preferredName,
        photoUrl: tag.profile.photos[0]?.url ?? null,
        emergencyContacts: tag.profile.emergencyContacts.slice(0, 1).map((c) => ({
          id: c.id,
          name: c.name,
          relationship: c.relationship,
          phone: c.phone,
        })),
      }}
      publicTagId={tag.publicTagId}
    />
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
