import type { ResumeProfile } from "@/lib/resume-profile";

export const RESUME_PROFILE_COOKIE_KEY = "resume_profile";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isResumeProfile(value: unknown): value is ResumeProfile {
  if (!value || typeof value !== "object") return false;

  const profile = value as Partial<ResumeProfile>;

  return (
    isNonEmptyString(profile.sourceFileName) &&
    isNonEmptyString(profile.summary) &&
    isNonEmptyString(profile.targetRole) &&
    Array.isArray(profile.topSkills) &&
    Array.isArray(profile.focusAreas) &&
    Array.isArray(profile.projectHighlights) &&
    Array.isArray(profile.experienceHighlights) &&
    typeof profile.resumeScore === "number" &&
    isNonEmptyString(profile.jobReadiness) &&
    isNonEmptyString(profile.lastAnalyzedAt)
  );
}

export function encodeResumeProfileCookie(profile: ResumeProfile): string {
  return Buffer.from(JSON.stringify(profile), "utf8").toString("base64url");
}

export function decodeResumeProfileCookie(raw: string | undefined): ResumeProfile | null {
  if (!raw) return null;

  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded);

    if (!isResumeProfile(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}
