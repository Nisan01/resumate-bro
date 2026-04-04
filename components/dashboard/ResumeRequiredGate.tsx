"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LOCAL_RESUME_PROFILE_KEY, type ResumeProfile } from "@/lib/resume-profile";

interface ResumeContextResponse {
  hasResumeProfile?: boolean;
  resumeProfile?: ResumeProfile | null;
}

type GateState = "checking" | "allowed" | "required";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isResumeProfileShape(value: unknown): value is ResumeProfile {
  if (!isRecord(value)) return false;

  return (
    typeof value.sourceFileName === "string" &&
    typeof value.summary === "string" &&
    typeof value.targetRole === "string" &&
    Array.isArray(value.topSkills) &&
    Array.isArray(value.focusAreas) &&
    Array.isArray(value.projectHighlights) &&
    Array.isArray(value.experienceHighlights) &&
    typeof value.resumeScore === "number" &&
    typeof value.jobReadiness === "string" &&
    typeof value.lastAnalyzedAt === "string"
  );
}

function persistLocalResumeProfile(profile: ResumeProfile): void {
  try {
    window.localStorage.setItem(LOCAL_RESUME_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage write failures.
  }
}

function clearLocalResumeProfile(): void {
  try {
    window.localStorage.removeItem(LOCAL_RESUME_PROFILE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function parseLocalResumeProfile(): ResumeProfile | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(LOCAL_RESUME_PROFILE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ResumeProfile;
    if (typeof parsed?.targetRole !== "string" || parsed.targetRole.trim().length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function ResumeRequiredGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [gateState, setGateState] = useState<GateState>("checking");

  const isResumeAnalyzerPage = useMemo(
    () => pathname === "/dashboard/resume-analyzer",
    [pathname],
  );

  useEffect(() => {
    let cancelled = false;

    if (isResumeAnalyzerPage) {
      return () => {
        cancelled = true;
      };
    }

    const localProfile = parseLocalResumeProfile();

    const checkProfile = async () => {
      try {
        const response = await fetch("/api/dashboard/practice-questions", {
          credentials: "include",
        });

        if (!response.ok) {
          if (!cancelled) {
            setGateState(localProfile ? "allowed" : "required");
          }
          return;
        }

        const data = (await response.json()) as ResumeContextResponse;
        if (cancelled) return;

        if (data.hasResumeProfile && isResumeProfileShape(data.resumeProfile)) {
          persistLocalResumeProfile(data.resumeProfile);
          setGateState("allowed");
          return;
        }

        clearLocalResumeProfile();
        setGateState(localProfile ? "allowed" : "required");
      } catch {
        if (!cancelled) {
          setGateState(localProfile ? "allowed" : "required");
        }
      }
    };

    void checkProfile();

    return () => {
      cancelled = true;
    };
  }, [isResumeAnalyzerPage]);

  if (isResumeAnalyzerPage) {
    return <>{children}</>;
  }

  if (gateState === "required") {
    return (
      <div className="relative min-h-full">
        <div aria-hidden="true" inert className="pointer-events-none blur-[1px] opacity-25">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-2xl border border-white/28 bg-slate-950/80 p-6 shadow-[0_24px_50px_rgba(2,8,24,0.45)] backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/85">Resume Required</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Upload your resume to continue</h2>
            <p className="mt-3 text-sm text-slate-200">
              We personalize all 6 dashboard pages from your latest resume. Upload once in Resume Analyzer,
              and every page will use that latest profile automatically.
            </p>
            <Button
              type="button"
              className="mt-5 bg-white text-slate-900 hover:bg-slate-200"
              onClick={() => router.push("/dashboard/resume-analyzer")}
            >
              Upload Resume Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gateState === "checking") {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="rounded-xl border border-white/24 bg-slate-950/70 px-5 py-3 text-sm text-slate-100 backdrop-blur-md">
          Checking resume context...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
