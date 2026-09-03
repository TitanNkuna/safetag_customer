import { prisma } from "./prisma";
import type { SessionPayload } from "./auth";
import type { GuardianPermission, UserRole } from "@prisma/client";

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function canManageProfile(
  session: SessionPayload,
  profileId: string,
  minPermission: GuardianPermission = "VIEW"
): Promise<boolean> {
  if (isAdmin(session.role)) return true;
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: {
      ownerId: true,
      guardianAsChild: {
        where: { guardianUserId: session.userId },
        select: { permissionLevel: true },
      },
    },
  });
  if (!profile) return false;
  if (profile.ownerId === session.userId) return true;
  const link = profile.guardianAsChild[0];
  if (!link) return false;
  const order: GuardianPermission[] = ["VIEW", "EDIT", "EMERGENCY", "FULL"];
  return order.indexOf(link.permissionLevel) >= order.indexOf(minPermission);
}

export async function assertCanManageProfile(
  session: SessionPayload,
  profileId: string,
  minPermission: GuardianPermission = "VIEW"
) {
  const ok = await canManageProfile(session, profileId, minPermission);
  if (!ok) throw new Error("FORBIDDEN");
}
