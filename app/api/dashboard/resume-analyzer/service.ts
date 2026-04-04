import { desc, eq } from "drizzle-orm";
import { db } from "@/index";
import {
  jobRoleSuggestions,
  resumes,
  resumeSuggestions,
  skillGapAnalysis,
} from "@/utils/db/schema/schema";
import type { ResumeProfile } from "@/lib/resume-profile";
import type { DashboardSession } from "../_lib/session";

type Priority = "High" | "Medium" | "Low";

export const resumeAnalyzerFallbackPayload = {
  metrics: {
    resumeScore: {
      value: "82 / 100",
      change: "+6 vs last scan",
      helperText: "Structure and readability improved",
    },
    jobReadyIndex: {
      value: "74%",
      change: "Role aligned",
      helperText: "Frontend roles are strongest",
    },
    improvementPriority: {
      value: "4 items",
      change: "2 critical",
      helperText: "Action plan generated",
    },
  },
  roleMatches: [
    {
      role: "Frontend Engineer",
      match: 89,
      note: "Strong fit based on React, Next.js, and UI project experience.",
    },
    {
      role: "UI Developer",
      match: 84,
      note: "Design implementation quality is strong, add accessibility evidence.",
    },
    {
      role: "Product Engineer",
      match: 71,
      note: "Needs more backend integration and metrics-driven outcomes.",
    },
  ],
  skillGaps: [
    {
      skill: "System Design Storytelling",
      current: 46,
      target: 75,
      priority: "High" as Priority,
    },
    {
      skill: "Performance Optimization",
      current: 61,
      target: 80,
      priority: "Medium" as Priority,
    },
    {
      skill: "Testing Strategy",
      current: 54,
      target: 78,
      priority: "High" as Priority,
    },
  ],
  improvements: [
    "Rewrite project bullets with measurable impact (load time, users, conversion).",
    "Add one section highlighting deployment, monitoring, and debugging ownership.",
    "Prioritize role keywords in your summary and top skills block.",
    "Include one short case study style project to showcase problem solving depth.",
  ],
};

function clampPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreToPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value <= 1) return clampPercent(value * 100);
  if (value <= 5) return clampPercent(value * 20);
  return clampPercent(value);
}

function toPriority(priority: string | null): Priority {
  const normalized = (priority ?? "").toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  return "Low";
}

function formatSignedChange(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return "0";
}

function mapJobReadyIndex(jobReadiness: string | null, resumeScore: number): number {
  if (!jobReadiness) return clampPercent(resumeScore - 8);

  const map: Record<string, number> = {
    beginner: 35,
    developing: 50,
    intermediate: 66,
    advanced: 80,
    job_ready: 92,
  };

  return map[jobReadiness] ?? clampPercent(resumeScore - 8);
}

function extractStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").slice(0, 5);
  }

  if (value && typeof value === "object") {
    const objectValues = Object.values(value as Record<string, unknown>)
      .filter((item): item is string => typeof item === "string")
      .slice(0, 5);

    if (objectValues.length > 0) return objectValues;

    return Object.keys(value as Record<string, unknown>).slice(0, 5);
  }

  return [];
}

export async function getResumeAnalyzerPayload(session: DashboardSession, resumeProfile?: ResumeProfile | null) {
  const resumeRows = await db
    .select({
      id: resumes.id,
      resumeScore: resumes.resumeScore,
      jobReadiness: resumes.jobReadiness,
    })
    .from(resumes)
    .where(eq(resumes.userId, session.userId))
    .orderBy(desc(resumes.createdAt))
    .limit(2);

  const [suggestionRows, roleRows, gapRows] = await Promise.all([
    db
      .select({
        suggestion: resumeSuggestions.suggestion,
        priority: resumeSuggestions.priority,
      })
      .from(resumeSuggestions)
      .innerJoin(resumes, eq(resumeSuggestions.resumeId, resumes.id))
      .where(eq(resumes.userId, session.userId))
      .orderBy(desc(resumeSuggestions.createdAt))
      .limit(8),
    db
      .select({
        roleTitle: jobRoleSuggestions.roleTitle,
        matchScore: jobRoleSuggestions.matchScore,
        reasonForMatch: jobRoleSuggestions.reasonForMatch,
      })
      .from(jobRoleSuggestions)
      .where(eq(jobRoleSuggestions.userId, session.userId))
      .orderBy(desc(jobRoleSuggestions.createdAt))
      .limit(3),
    db
      .select({
        missingSkills: skillGapAnalysis.missingSkills,
        overallGapScore: skillGapAnalysis.overallGapScore,
      })
      .from(skillGapAnalysis)
      .where(eq(skillGapAnalysis.userId, session.userId))
      .orderBy(desc(skillGapAnalysis.createdAt))
      .limit(1),
  ]);

  const resumeScore = clampPercent(resumeProfile?.resumeScore ?? scoreToPercent(resumeRows[0]?.resumeScore ?? 82));
  const previousScore = scoreToPercent(resumeRows[1]?.resumeScore ?? resumeScore);
  const scoreDelta = resumeProfile ? 0 : resumeScore - previousScore;

  const improvements = Array.from(new Set(suggestionRows.map((row) => row.suggestion))).slice(0, 6);
  const resumeDrivenImprovements = resumeProfile
    ? resumeProfile.focusAreas.slice(0, 4).map((area) => `Strengthen ${area} with role-specific examples for ${resumeProfile.targetRole}.`)
    : [];
  const criticalItems = suggestionRows.filter((row) => toPriority(row.priority) === "High").length;
  const improvementCount = Math.max(improvements.length, resumeDrivenImprovements.length);
  const criticalCount = Math.max(criticalItems, resumeDrivenImprovements.length > 0 ? 1 : 0);

  const roleMatches = roleRows.length > 0
    ? roleRows.map((row) => ({
        role: row.roleTitle,
        match: scoreToPercent(row.matchScore ?? 0),
        note: row.reasonForMatch ?? "Role fit inferred from latest resume analysis.",
      }))
    : resumeProfile
      ? [
          {
            role: resumeProfile.targetRole,
            match: clampPercent(resumeProfile.resumeScore),
            note: "Latest uploaded resume context",
          },
          {
            role: "Adjacent Role Fit",
            match: clampPercent(resumeProfile.resumeScore - 8),
            note: `Improve ${resumeProfile.focusAreas[0] ?? "interview fundamentals"} to increase this fit.`,
          },
          {
            role: "Stretch Role Fit",
            match: clampPercent(resumeProfile.resumeScore - 15),
            note: "Requires deeper project storytelling and measurable outcomes.",
          },
        ]
    : resumeAnalyzerFallbackPayload.roleMatches;

  const missingSkills = extractStringArray(gapRows[0]?.missingSkills);
  const gapBase = clampPercent((gapRows[0]?.overallGapScore ?? 0) * 100);

  const skillGaps = missingSkills.length > 0
    ? missingSkills.slice(0, 3).map((skill, index) => {
        const current = clampPercent(40 + index * 10 + Math.max(0, Math.floor((100 - gapBase) / 10)));
        const target = clampPercent(current + 28 - index * 4);
        const priority: Priority = index === 0 ? "High" : index === 1 ? "Medium" : "Low";

        return {
          skill,
          current,
          target,
          priority,
        };
      })
    : resumeProfile && resumeProfile.focusAreas.length > 0
      ? resumeProfile.focusAreas.slice(0, 3).map((skill, index) => {
          const current = clampPercent(resumeProfile.resumeScore - (28 - index * 6));
          const target = clampPercent(current + 24);
          const priority: Priority = index === 0 ? "High" : index === 1 ? "Medium" : "Low";

          return {
            skill,
            current,
            target,
            priority,
          };
        })
    : resumeAnalyzerFallbackPayload.skillGaps;

  return {
    metrics: {
      resumeScore: {
        value: `${resumeScore} / 100`,
        change: `${formatSignedChange(scoreDelta)} vs last scan`,
        helperText: resumeProfile ? "Latest uploaded resume analysis" : "Latest stored resume analysis",
      },
      jobReadyIndex: {
        value: `${mapJobReadyIndex(resumeProfile?.jobReadiness ?? resumeRows[0]?.jobReadiness ?? null, resumeScore)}%`,
        change: "Role aligned",
        helperText: "Based on readiness and score signals",
      },
      improvementPriority: {
        value: `${improvementCount} items`,
        change: `${criticalCount} critical`,
        helperText: "High-impact actions generated",
      },
    },
    roleMatches,
    skillGaps,
    improvements:
      improvements.length > 0
        ? improvements
        : resumeDrivenImprovements.length > 0
          ? resumeDrivenImprovements
          : resumeAnalyzerFallbackPayload.improvements,
    source: "database" as const,
  };
}
