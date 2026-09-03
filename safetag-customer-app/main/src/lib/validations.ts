import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
  phone: z.string().optional(),
});

export const profileBasicSchema = z.object({
  firstName: z.string().min(1).max(100),
  middleNames: z.string().max(100).optional().nullable(),
  surname: z.string().min(1).max(100),
  preferredName: z.string().max(100).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z
    .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
    .optional()
    .nullable(),
  idPassportType: z.string().max(50).optional().nullable(),
  idPassportNumber: z.string().max(50).optional().nullable(),
  nationality: z.string().max(50).optional().nullable(),
  profileType: z.enum(["ADULT", "CHILD"]),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1).max(150),
  relationship: z.string().min(1).max(100),
  phone: z.string().min(5).max(30),
  altPhone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable(),
  priority: z.number().int().min(1).max(20).default(1),
});

export const guardianSchema = z.object({
  relationship: z.string().min(1).max(100),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable(),
  permissionLevel: z
    .enum(["VIEW", "EDIT", "EMERGENCY", "FULL"])
    .default("VIEW"),
  guardianUserId: z.string().optional().nullable(),
  guardianProfileId: z.string().optional().nullable(),
});

export const addressSchema = z.object({
  street: z.string().max(200).optional().nullable(),
  suburb: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(50).default("ZA"),
});

export const publicTagIdSchema = z
  .string()
  .regex(/^STAG-[A-Z0-9]{6}$/, "Invalid public tag ID format");
