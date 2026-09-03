import { randomBytes } from "crypto";

/**
 * Generate a human-readable SafeTag filing number.
 * Format: ST-YYYY-NNNNNN
 * Example: ST-2026-000184
 */
export function generateSafeTagId(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(6, "0");
  return `ST-${year}-${padded}`;
}

/**
 * Generate a random public tag identifier for NFC URLs.
 * Format: STAG-XXXXXX (alphanumeric, uppercase)
 * Example: STAG-8F29KD
 * Never contains personal data.
 */
export function generatePublicTagId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,0,1 to avoid confusion
  const bytes = randomBytes(6);
  let result = "STAG-";
  for (let i = 0; i < 6; i++) {
    result += alphabet[bytes[i]! % alphabet.length];
  }
  return result;
}

/**
 * Generate internal tag ID.
 */
export function generateInternalTagId(): string {
  return `TAG-${randomBytes(8).toString("hex").toUpperCase()}`;
}

/**
 * Generate order number.
 * Format: ST-ORD-NNNNNN
 */
export function generateOrderNumber(sequence: number): string {
  const padded = String(sequence).padStart(6, "0");
  return `ST-ORD-${padded}`;
}

/**
 * Generate emergency event number.
 * Format: EM-YYYY-NNNN
 */
export function generateEmergencyEventNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");
  return `EM-${year}-${padded}`;
}
