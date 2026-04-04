import { desc, eq } from "drizzle-orm";
import { db } from "@/index";
import { generateGeminiJson } from "@/lib/ai/gemini";
import type { InterviewDifficulty, ResumeJobReadiness, ResumeProfile } from "@/lib/resume-profile";
import {
  jobRoleSuggestions,
  resumes,
  skillGapAnalysis,
} from "@/utils/db/schema/schema";
import type { DashboardSession } from "../_lib/session";

interface PracticeQuestion {
  id: string;
  question: string;
  answer: string;
  focusArea: string;
}

interface GeminiQuestionsResponse {
  questions?: Array<{
    question?: string;
    answer?: string;
    focusArea?: string;
  }>;
}

const VALID_READINESS: ResumeJobReadiness[] = [
  "beginner",
  "developing",
  "intermediate",
  "advanced",
  "job_ready",
];

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeReadiness(value: string | undefined): ResumeJobReadiness {
  if (!value) return "developing";

  const normalized = value.toLowerCase().trim();
  if (VALID_READINESS.includes(normalized as ResumeJobReadiness)) {
    return normalized as ResumeJobReadiness;
  }

  return "developing";
}

function sanitizeResumeProfile(input: Partial<ResumeProfile> | null | undefined): ResumeProfile | null {
  if (!input) return null;

  const targetRole = typeof input.targetRole === "string" ? input.targetRole.trim() : "";
  if (!targetRole) return null;

  const summary = typeof input.summary === "string" && input.summary.trim().length > 0
    ? input.summary.trim().slice(0, 400)
    : "Candidate profile loaded from resume analyzer.";

  return {
    sourceFileName:
      typeof input.sourceFileName === "string" && input.sourceFileName.trim().length > 0
        ? input.sourceFileName.trim()
        : "resume.pdf",
    summary,
    targetRole,
    topSkills: normalizeStringArray(input.topSkills),
    focusAreas: normalizeStringArray(input.focusAreas),
    projectHighlights: normalizeStringArray(input.projectHighlights),
    experienceHighlights: normalizeStringArray(input.experienceHighlights),
    resumeScore:
      typeof input.resumeScore === "number" && Number.isFinite(input.resumeScore)
        ? Math.max(0, Math.min(100, Math.round(input.resumeScore)))
        : 70,
    jobReadiness: normalizeReadiness(input.jobReadiness),
    lastAnalyzedAt:
      typeof input.lastAnalyzedAt === "string" && input.lastAnalyzedAt.trim().length > 0
        ? input.lastAnalyzedAt
        : new Date().toISOString(),
  };
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").slice(0, 8);
  }

  if (value && typeof value === "object") {
    const objectValues = Object.values(value as Record<string, unknown>)
      .filter((item): item is string => typeof item === "string")
      .slice(0, 8);

    if (objectValues.length > 0) return objectValues;
  }

  return [];
}

export async function getResumeProfileFromDatabase(session: DashboardSession): Promise<ResumeProfile | null> {
  const [resumeRows, roleRows, gapRows] = await Promise.all([
    db
      .select({
        fileName: resumes.fileName,
        resumeScore: resumes.resumeScore,
        jobReadiness: resumes.jobReadiness,
        extractedSkills: resumes.extractedSkills,
        extractedExperience: resumes.extractedExperience,
        extractedProjects: resumes.extractedProjects,
        extractedEducation: resumes.extractedEducation,
        createdAt: resumes.createdAt,
      })
      .from(resumes)
      .where(eq(resumes.userId, session.userId))
      .orderBy(desc(resumes.createdAt))
      .limit(1),
    db
      .select({
        roleTitle: jobRoleSuggestions.roleTitle,
      })
      .from(jobRoleSuggestions)
      .where(eq(jobRoleSuggestions.userId, session.userId))
      .orderBy(desc(jobRoleSuggestions.createdAt))
      .limit(1),
    db
      .select({
        missingSkills: skillGapAnalysis.missingSkills,
      })
      .from(skillGapAnalysis)
      .where(eq(skillGapAnalysis.userId, session.userId))
      .orderBy(desc(skillGapAnalysis.createdAt))
      .limit(1),
  ]);

  const latestResume = resumeRows[0];
  if (!latestResume) return null;

  const extractedExperience = latestResume.extractedExperience && typeof latestResume.extractedExperience === "object"
    ? (latestResume.extractedExperience as Record<string, unknown>)
    : null;

  const extractedEducation = latestResume.extractedEducation && typeof latestResume.extractedEducation === "object"
    ? (latestResume.extractedEducation as Record<string, unknown>)
    : null;

  const summary = typeof extractedExperience?.summary === "string"
    ? extractedExperience.summary
    : "Interview profile generated from latest resume.";

  const targetRole =
    roleRows[0]?.roleTitle ??
    (typeof extractedEducation?.targetRole === "string" ? extractedEducation.targetRole : "Software Engineer");

  const profile = sanitizeResumeProfile({
    sourceFileName: latestResume.fileName,
    summary,
    targetRole,
    topSkills: toStringArray(latestResume.extractedSkills),
    focusAreas: [
      ...toStringArray(extractedEducation?.focusAreas),
      ...toStringArray(gapRows[0]?.missingSkills),
    ].slice(0, 8),
    projectHighlights: toStringArray(latestResume.extractedProjects),
    experienceHighlights: toStringArray(extractedExperience?.highlights),
    resumeScore: latestResume.resumeScore ?? 70,
    jobReadiness: latestResume.jobReadiness ?? "developing",
    lastAnalyzedAt: latestResume.createdAt.toISOString(),
  });

  return profile;
}

function fallbackQuestions(
  profile: ResumeProfile,
  difficulty: InterviewDifficulty,
  offset: number,
  count: number,
): PracticeQuestion[] {
  const focus = profile.focusAreas.length > 0 ? profile.focusAreas : ["Core interview preparation"];
  const baseSkills = profile.topSkills.length > 0 ? profile.topSkills : ["Problem solving", "Communication"];
  const tierLabel = difficulty[0].toUpperCase() + difficulty.slice(1);

  return Array.from({ length: count }, (_, index) => {
    const number = offset + index + 1;
    const skill = baseSkills[index % baseSkills.length];
    const area = focus[index % focus.length];

    return {
      id: `${difficulty}-${number}`,
      question: `${tierLabel} Q${number}: How would you demonstrate ${skill} while solving a ${profile.targetRole} problem in ${area}?`,
      answer: `Start with a structured approach, explain trade-offs, then connect your final solution back to ${area}. Include one concrete example from your project work.`,
      focusArea: area,
    };
  });
}

export async function generatePracticeQuestions(options: {
  profile: ResumeProfile;
  difficulty: InterviewDifficulty;
  offset: number;
  count: number;
}): Promise<{ questions: PracticeQuestion[]; source: "gemini" | "fallback" }> {
  const { profile, difficulty, offset, count } = options;

  const prompt = [
    "You are an interview coach.",
    `Generate exactly ${count} interview questions with strong sample answers.`,
    `Difficulty: ${difficulty}`,
    `Start numbering from ${offset + 1}.`,
    "Use the candidate resume context below.",
    `Target Role: ${profile.targetRole}`,
    `Summary: ${profile.summary}`,
    `Top Skills: ${profile.topSkills.join(", ") || "N/A"}`,
    `Focus Areas: ${profile.focusAreas.join(", ") || "N/A"}`,
    `Project Highlights: ${profile.projectHighlights.join(" | ") || "N/A"}`,
    "Return strict JSON only with this schema:",
    "{",
    '  "questions": [',
    "    {",
    '      "question": "string",',
    '      "answer": "string",',
    '      "focusArea": "string"',
    "    }",
    "  ]",
    "}",
  ].join("\n");

  try {
    const aiResponse = await generateGeminiJson<GeminiQuestionsResponse>({ prompt });

    const normalized = (Array.isArray(aiResponse.questions) ? aiResponse.questions : [])
      .map((item, index) => {
        const question = typeof item.question === "string" ? item.question.trim() : "";
        const answer = typeof item.answer === "string" ? item.answer.trim() : "";
        const focusArea = typeof item.focusArea === "string" ? item.focusArea.trim() : "Interview fundamentals";

        if (!question || !answer) return null;

        return {
          id: `${difficulty}-${offset + index + 1}`,
          question,
          answer,
          focusArea,
        };
      })
      .filter((item): item is PracticeQuestion => Boolean(item))
      .slice(0, count);

    if (normalized.length === count) {
      return { questions: normalized, source: "gemini" };
    }

    return {
      questions: fallbackQuestions(profile, difficulty, offset, count),
      source: "fallback",
    };
  } catch {
    return {
      questions: fallbackQuestions(profile, difficulty, offset, count),
      source: "fallback",
    };
  }
}

export function resolveResumeProfile(options: {
  bodyProfile?: Partial<ResumeProfile> | null;
  dbProfile?: ResumeProfile | null;
}): ResumeProfile | null {
  const fromBody = sanitizeResumeProfile(options.bodyProfile);
  if (fromBody) return fromBody;

  return options.dbProfile ?? null;
}

export function normalizeDifficulty(value: unknown): InterviewDifficulty {
  if (value === "beginner" || value === "intermediate" || value === "advanced") {
    return value;
  }

  return "beginner";
}
