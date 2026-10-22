import { validateProductionEmailConfiguration } from "@/lib/email-config";

export function register(): void {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  validateProductionEmailConfiguration();
}
