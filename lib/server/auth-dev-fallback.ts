function normalizeEnvFlag(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function isAuthDevFallbackEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;

  const flag = normalizeEnvFlag(process.env.ENABLE_AUTH_DEV_FALLBACK);
  return flag === "1" || flag === "true" || flag === "yes";
}

export function isDevFallbackUserId(userId: string): boolean {
  return userId.startsWith("dev-");
}
