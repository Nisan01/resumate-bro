import { desc, eq } from "drizzle-orm";
import { db } from "@/index";
import {
  careerRoadmaps,
  resumes,
  skillGapAnalysis,
  userRoadmapEnrollments,
} from "@/utils/db/schema/schema";
import type { ResumeProfile } from "@/lib/resume-profile";
import type { DashboardSession } from "../_lib/session";

export type StudentTrack = "btech" | "bca";
type ProgressTone = "emerald" | "cyan" | "amber" | "rose";
type RoadmapTheme = "amber" | "violet" | "lime";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  align: "top" | "bottom";
  theme: RoadmapTheme;
}

interface TrackRoadmap {
  persona: string;
  targetRole: string;
  score: number;
  ats: number;
  skillMatch: number;
  readiness: number;
  strengths: string[];
  focusAreas: string[];
  progress: Array<{
    label: string;
    value: number;
    note: string;
    tone: ProgressTone;
  }>;
  steps: RoadmapStep[];
}

export const roadmapFallbackRoadmaps: Record<StudentTrack, TrackRoadmap> = {
  btech: {
    persona: "BTech Student",
    targetRole: "Software Engineer / SDE Intern",
    score: 78,
    ats: 81,
    skillMatch: 66,
    readiness: 58,
    strengths: [
      "Solid programming fundamentals and problem solving",
      "Good exposure to mini projects and Git workflows",
      "Strong technical curiosity and learning velocity",
    ],
    focusAreas: [
      "Deepen DBMS, OS, and CN revision for interviews",
      "Improve coding round speed under timed conditions",
      "Rewrite project impact bullets with measurable outcomes",
    ],
    progress: [
      {
        label: "Core CS Coverage",
        value: 52,
        note: "Target 80% mastery before placement season",
        tone: "cyan",
      },
      {
        label: "Project Quality",
        value: 61,
        note: "Need one more production-like project",
        tone: "emerald",
      },
      {
        label: "Interview Readiness",
        value: 47,
        note: "Mock rounds and communication practice pending",
        tone: "amber",
      },
    ],
    steps: [
      {
        id: "01",
        title: "Resume & Skill Baseline Audit",
        description: "Map your current strengths across DSA, OOP, DBMS, and real project contribution.",
        align: "top",
        theme: "amber",
      },
      {
        id: "02",
        title: "Core CS Gap Closing Sprint",
        description: "Follow a focused plan for DBMS, OS, CN and top interview coding patterns.",
        align: "bottom",
        theme: "amber",
      },
      {
        id: "03",
        title: "Role-Focused Project Upgrade",
        description: "Build two proof projects with clean architecture, deployment, and impact-oriented README.",
        align: "top",
        theme: "violet",
      },
      {
        id: "04",
        title: "Assessment & Mock Round Cycle",
        description: "Practice OA, aptitude, and debugging rounds weekly with strict time-boxing.",
        align: "bottom",
        theme: "violet",
      },
      {
        id: "05",
        title: "Technical + HR Interview Prep",
        description: "Prepare concise stories, core concept answers, and role-aligned technical walkthroughs.",
        align: "top",
        theme: "lime",
      },
      {
        id: "06",
        title: "Placement Application Momentum",
        description: "Apply in weekly batches, use referrals, and track callbacks to optimize outcomes.",
        align: "bottom",
        theme: "lime",
      },
    ],
  },
  bca: {
    persona: "BCA Student",
    targetRole: "Full-Stack / Software Support Intern",
    score: 72,
    ats: 76,
    skillMatch: 61,
    readiness: 54,
    strengths: [
      "Strong practical mindset with web development interest",
      "Comfortable with frontend basics and SQL fundamentals",
      "Consistent project execution and documentation effort",
    ],
    focusAreas: [
      "Strengthen backend APIs, authentication, and deployment",
      "Improve resume achievement language with metrics",
      "Practice communication for HR and support interviews",
    ],
    progress: [
      {
        label: "Web Stack Depth",
        value: 58,
        note: "Backend API and auth depth needed",
        tone: "cyan",
      },
      {
        label: "Portfolio Strength",
        value: 63,
        note: "Add one end-to-end deployed project",
        tone: "emerald",
      },
      {
        label: "Interview Confidence",
        value: 49,
        note: "Need mock interviews with feedback loop",
        tone: "amber",
      },
    ],
    steps: [
      {
        id: "01",
        title: "Resume & Foundation Review",
        description: "Evaluate coding basics, communication, and resume clarity for internship readiness.",
        align: "top",
        theme: "amber",
      },
      {
        id: "02",
        title: "Web + SQL Skill Build",
        description: "Strengthen HTML/CSS/JS, React basics, SQL querying, and API consumption workflow.",
        align: "bottom",
        theme: "amber",
      },
      {
        id: "03",
        title: "Practical Portfolio Sprint",
        description: "Create role-relevant projects with authentication, CRUD, and responsive UI quality.",
        align: "top",
        theme: "violet",
      },
      {
        id: "04",
        title: "Mock Tests & Debug Practice",
        description: "Run aptitude drills, SQL tests, and debugging exercises on real mini case studies.",
        align: "bottom",
        theme: "violet",
      },
      {
        id: "05",
        title: "Interview Communication Prep",
        description: "Practice project explanation, teamwork stories, and role-based problem solving responses.",
        align: "top",
        theme: "lime",
      },
      {
        id: "06",
        title: "Internship & Job Launch Plan",
        description: "Apply strategically, improve profile weekly, and follow up consistently on opportunities.",
        align: "bottom",
        theme: "lime",
      },
    ],
  },
};

function clampPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreToPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value <= 1) return clampPercent(value * 100);
  return clampPercent(value);
}

export function inferRoadmapTrack(value: string | null): StudentTrack {
  if (value === "bca") return "bca";
  return "btech";
}

function normalizeRoadmapSteps(raw: unknown): RoadmapStep[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((step, index) => {
      if (!step || typeof step !== "object") return null;

      const record = step as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title : null;
      const description = typeof record.description === "string" ? record.description : null;

      if (!title || !description) return null;

      const themes: RoadmapTheme[] = ["amber", "violet", "lime"];

      return {
        id: String(index + 1).padStart(2, "0"),
        title,
        description,
        align: index % 2 === 0 ? "top" : "bottom",
        theme: themes[index % themes.length],
      };
    })
    .filter((step): step is RoadmapStep => Boolean(step));
}

export async function getRoadmapPayload(
  session: DashboardSession,
  track: StudentTrack,
  resumeProfile?: ResumeProfile | null,
) {
  const fallbackRoadmap = roadmapFallbackRoadmaps[track];

  const [resumeRows, enrollmentRows, gapRows] = await Promise.all([
    db
      .select({
        resumeScore: resumes.resumeScore,
        atsScore: resumes.atsScore,
        jobReadiness: resumes.jobReadiness,
      })
      .from(resumes)
      .where(eq(resumes.userId, session.userId))
      .orderBy(desc(resumes.createdAt))
      .limit(1),
    db
      .select({
        targetRole: careerRoadmaps.targetRole,
        steps: careerRoadmaps.steps,
        progressPercent: userRoadmapEnrollments.progressPercent,
        currentStep: userRoadmapEnrollments.currentStep,
      })
      .from(userRoadmapEnrollments)
      .innerJoin(careerRoadmaps, eq(userRoadmapEnrollments.roadmapId, careerRoadmaps.id))
      .where(eq(userRoadmapEnrollments.userId, session.userId))
      .orderBy(desc(userRoadmapEnrollments.enrolledAt))
      .limit(1),
    db
      .select({
        missingSkills: skillGapAnalysis.missingSkills,
        overallGapScore: skillGapAnalysis.overallGapScore,
        aiSummary: skillGapAnalysis.aiSummary,
      })
      .from(skillGapAnalysis)
      .where(eq(skillGapAnalysis.userId, session.userId))
      .orderBy(desc(skillGapAnalysis.createdAt))
      .limit(1),
  ]);

  const dbResume = resumeRows[0];
  const dbEnrollment = enrollmentRows[0];
  const dbGap = gapRows[0];

  const stepsFromDb = normalizeRoadmapSteps(dbEnrollment?.steps);

  const score = clampPercent(resumeProfile?.resumeScore ?? scoreToPercent(dbResume?.resumeScore ?? fallbackRoadmap.score));
  const ats = clampPercent((resumeProfile?.resumeScore ? resumeProfile.resumeScore - 3 : scoreToPercent(dbResume?.atsScore ?? fallbackRoadmap.ats)));
  const readiness = resumeProfile?.jobReadiness === "job_ready"
    ? 90
    : resumeProfile?.jobReadiness === "advanced"
      ? 80
      : dbResume?.jobReadiness === "job_ready"
    ? 90
    : dbResume?.jobReadiness === "advanced"
      ? 80
      : clampPercent(score - 15);

  const inferredSkillMatch = dbGap?.overallGapScore
    ? clampPercent(100 - dbGap.overallGapScore * 100)
    : fallbackRoadmap.skillMatch;

  const focusAreasFromSummary = dbGap?.aiSummary
    ? dbGap.aiSummary
        .split(".")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  const enrichedRoadmap: TrackRoadmap = {
    ...fallbackRoadmap,
    targetRole: resumeProfile?.targetRole ?? dbEnrollment?.targetRole ?? fallbackRoadmap.targetRole,
    score,
    ats,
    readiness,
    skillMatch: inferredSkillMatch,
    focusAreas:
      resumeProfile && resumeProfile.focusAreas.length > 0
        ? resumeProfile.focusAreas.slice(0, 3)
        : focusAreasFromSummary.length > 0
          ? focusAreasFromSummary
          : fallbackRoadmap.focusAreas,
    progress: [
      {
        ...fallbackRoadmap.progress[0],
        value: clampPercent((score + ats) / 2),
      },
      {
        ...fallbackRoadmap.progress[1],
        value: clampPercent(inferredSkillMatch),
        note: dbEnrollment
          ? `Current roadmap step: ${dbEnrollment.currentStep ?? 1}`
          : fallbackRoadmap.progress[1].note,
      },
      {
        ...fallbackRoadmap.progress[2],
        value: dbEnrollment?.progressPercent
          ? clampPercent(dbEnrollment.progressPercent)
          : resumeProfile
            ? clampPercent(score - 12)
            : fallbackRoadmap.progress[2].value,
        note: dbEnrollment?.progressPercent
          ? `Roadmap completion: ${clampPercent(dbEnrollment.progressPercent)}%`
          : fallbackRoadmap.progress[2].note,
      },
    ],
    steps: stepsFromDb.length > 0 ? stepsFromDb : fallbackRoadmap.steps,
  };

  return {
    track,
    roadmap: enrichedRoadmap,
    source: "database" as const,
  };
}
