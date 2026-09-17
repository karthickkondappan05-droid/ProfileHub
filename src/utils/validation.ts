import { z } from "zod";

export const RESERVED_USERNAMES = [
  "admin",
  "login",
  "register",
  "signup",
  "dashboard",
  "settings",
  "profile",
  "search",
  "explore",
  "api",
  "support",
  "privacy",
  "terms",
  "help",
  "account",
  "auth",
  "root",
  "sitemap",
  "robots",
  "user",
  "users",
  "moderator",
  "null",
  "undefined",
];

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(/^[a-z0-9-]+$/, "Username must be lowercase letters, numbers, and hyphens only")
  .refine((val) => !val.startsWith("-") && !val.endsWith("-"), "Username cannot start or end with a hyphen")
  .refine((val) => !RESERVED_USERNAMES.includes(val.toLowerCase()), "This username is reserved and cannot be used");

export const basicInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  displayName: z.string().min(2, "Display name is required").max(50),
  username: usernameSchema,
  headline: z.string().max(200, "Headline cannot exceed 200 characters").optional(),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional(),
});

export const aboutSchema = z.object({
  profession: z.string().min(2, "Profession is required").max(100),
  industry: z.string().max(100).optional(),
  location: z.string().max(120).optional(),
  country: z.string().max(80).optional(),
});

export const reportSchema = z.object({
  category: z.enum([
    "Fake identity",
    "Impersonation",
    "Spam",
    "Harassment",
    "Inappropriate content",
    "Copyright issue",
    "Privacy violation",
    "Other",
  ]),
  reason: z.string().min(10, "Please provide at least 10 characters explaining the issue").max(2000),
  reporterEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});
