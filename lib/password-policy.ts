import { z } from "zod";

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "password1234",
  "password@123",
  "1234567890",
  "123456789",
  "12345678",
  "1111111111",
  "0000000000",
  "qwerty",
  "qwerty123",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "letmein",
  "letmein123",
  "welcome",
  "welcome123",
  "admin",
  "admin123",
  "admin123456",
  "iloveyou",
  "iloveyou123",
  "abc123",
  "abc123456",
  "india123",
  "india@123",
  "student123",
  "changeme",
  "changeme123",
  "passw0rd",
]);

export const newPasswordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128, "Use no more than 128 characters.")
  .refine((password) => !COMMON_PASSWORDS.has(password.toLowerCase()), {
    message: "Choose a less common password.",
  });

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((values, context) => {
    if (values.newPassword === values.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Your new password must be different from your current password.",
      });
    }
    if (values.confirmPassword !== values.newPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "The passwords do not match.",
      });
    }
  });

export const passwordResetSchema = z
  .object({
    token: z.string().min(32).max(128),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.confirmPassword === values.newPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match.",
  });
