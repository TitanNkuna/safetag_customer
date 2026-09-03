import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "PROFILE_CREATED"
  | "PROFILE_UPDATED"
  | "PROFILE_VIEWED"
  | "PHOTO_UPLOADED"
  | "GUARDIAN_ADDED"
  | "GUARDIAN_REMOVED"
  | "EMERGENCY_CONTACT_ADDED"
  | "EMERGENCY_CONTACT_REMOVED"
  | "NFC_TAG_ASSIGNED"
  | "NFC_TAG_DEACTIVATED"
  | "NFC_TAG_REPLACED"
  | "EMERGENCY_MODE_ACTIVATED"
  | "EMERGENCY_MODE_DEACTIVATED"
  | "MASTER_FILE_EXPORTED"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "PASSWORD_RESET"
  | "PERMISSION_CHANGED"
  | "ORDER_CREATED"
  | "USER_CREATED";

interface AuditParams {
  userId?: string | null;
  action: AuditAction | string;
  targetType?: string;
  targetId?: string;
  /** Plain objects are cast to Prisma JSON input at write time */
  metadata?: Record<string, string | number | boolean | null> | Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function writeAuditLog(params: AuditParams) {
  try {
    const metadata: Prisma.InputJsonValue | undefined =
      params.metadata === undefined || params.metadata === null
        ? undefined
        : (params.metadata as Prisma.InputJsonValue);

    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? undefined,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata,
        ipAddress: params.ipAddress ?? undefined,
        userAgent: params.userAgent ?? undefined,
      },
    });
  } catch (err) {
    // Never let audit failure break the main flow
    console.error("[AuditLog] Failed to write:", err);
  }
}
