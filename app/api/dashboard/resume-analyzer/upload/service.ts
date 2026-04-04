import { eq } from "drizzle-orm";
import { PDFParse } from "pdf-parse";
import { db } from "@/index";
import { generateGeminiJson } from "@/lib/ai/gemini";
import type { ResumeJobReadiness, ResumeProfile } from "@/lib/resume-profile";
import { resumes } from "@/utils/db/schema/schema";

interface GeminiResumeProfile {
  summary?: string;
  targetRole?: string;
  topSkills?: unknown;
  focusAreas?: unknown;
  projectHighlights?: unknown;
  experienceHighlights?: unknown;
  resumeScore?: number;
  jobReadiness?: string;
}

const VALID_READINESS: ResumeJobReadiness[] = [
  "beginner",
  "developing",
  "intermediate",
  "advanced",
  "job_ready",
];

function clampScore(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;

  const cleaned = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  return cleaned.length > 0 ? cleaned : fallback;
}

function toJobReadiness(value: string | undefined): ResumeJobReadiness {
  if (!value) return "developing";

  const normalized = value.trim().toLowerCase();
  if (VALID_READINESS.includes(normalized as ResumeJobReadiness)) {
    return normalized as ResumeJobReadiness;
  }

  return "developing";
}

function jobReadinessFromScore(score: number): ResumeJobReadiness {
  if (score >= 88) return "job_ready";
  if (score >= 76) return "advanced";
  if (score >= 64) return "intermediate";
  if (score >= 48) return "developing";
  return "beginner";
}

function cleanText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function extractLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter((line) => line.length >= 20)
    .slice(0, 120);
}

function extractSkillsFromText(text: string): string[] {
  const skillRegexMap: Array<{ skill: string; regex: RegExp }> = [
    { skill: "JavaScript", regex: /\bjavascript\b/i },
    { skill: "TypeScript", regex: /\btypescript\b/i },
    { skill: "React", regex: /\breact(?:\.js)?\b/i },
    { skill: "Next.js", regex: /\bnext(?:\.js)?\b/i },
    { skill: "Node.js", regex: /\bnode(?:\.js)?\b/i },
    { skill: "Express", regex: /\bexpress\b/i },
    { skill: "Python", regex: /\bpython\b/i },
    { skill: "Java", regex: /\bjava\b/i },
    { skill: "SQL", regex: /\bsql\b|postgres|mysql/i },
    { skill: "MongoDB", regex: /\bmongodb\b/i },
    { skill: "REST APIs", regex: /\brest\b|api/i },
    { skill: "Docker", regex: /\bdocker\b/i },
    { skill: "AWS", regex: /\baws\b|amazon web services/i },
    { skill: "Git", regex: /\bgit\b|github/i },
    { skill: "Data Structures", regex: /\bdata structures?\b|\bdsa\b/i },
    { skill: "Algorithms", regex: /\balgorithms?\b/i },
    { skill: "Testing", regex: /\btesting\b|jest|cypress|vitest/i },
  ];

  return skillRegexMap
    .filter((entry) => entry.regex.test(text))
    .map((entry) => entry.skill)
    .slice(0, 8);
}

function inferTargetRole(text: string): string {
  if (/\bfull\s*stack\b/i.test(text)) return "Full Stack Developer";
  if (/\bfront\s*end\b|\bfrontend\b/i.test(text)) return "Frontend Engineer";
  if (/\bback\s*end\b|\bbackend\b/i.test(text)) return "Backend Engineer";
  if (/\bdata\s*science\b|\bdata\s*analyst\b/i.test(text)) return "Data Analyst";
  if (/\bdevops\b|\bsite reliability\b/i.test(text)) return "DevOps Engineer";
  return "Software Engineer";
}

function pickHighlights(lines: string[], regex: RegExp, fallback: string[]): string[] {
  const selected = lines
    .filter((line) => regex.test(line))
    .slice(0, 4);

  if (selected.length > 0) return selected;

  return fallback;
}

function inferFocusAreas(skills: string[]): string[] {
  const lowerSkills = skills.map((skill) => skill.toLowerCase());
  const focusAreas: string[] = [];

  if (!lowerSkills.some((skill) => skill.includes("data structures") || skill.includes("algorithm"))) {
    focusAreas.push("Data structures and algorithms problem solving");
  }

  if (!lowerSkills.some((skill) => skill.includes("testing"))) {
    focusAreas.push("Testing strategy and quality assurance");
  }

  if (!lowerSkills.some((skill) => skill.includes("rest") || skill.includes("api"))) {
    focusAreas.push("API design and backend integration");
  }

  if (!lowerSkills.some((skill) => skill.includes("communication"))) {
    focusAreas.push("Behavioral interview communication");
  }

  if (focusAreas.length === 0) {
    focusAreas.push("System design trade-off storytelling", "Interview answer clarity and structure");
  }

  return focusAreas.slice(0, 4);
}

function scoreFromProfileSignals(skills: string[], projects: string[], experience: string[], text: string): number {
  let score = 50;
  score += Math.min(20, skills.length * 3);
  score += Math.min(12, projects.length * 4);
  score += Math.min(10, experience.length * 3);

  if (/\b(\d+%|\d+\+|improved|increased|reduced|optimized|achieved)\b/i.test(text)) {
    score += 8;
  }

  return clampScore(score);
}

async function analyzeResumeProfileFromPdfText(
  fileName: string,
  base64Pdf: string,
): Promise<ResumeProfile | null> {
  let parser: PDFParse | null = null;

  try {
    const pdfBuffer = Buffer.from(base64Pdf, "base64");
    parser = new PDFParse({ data: pdfBuffer });
    const parsed = await parser.getText();
    const rawText = typeof parsed.text === "string" ? parsed.text : "";
    const normalizedText = cleanText(rawText);

    if (!normalizedText || normalizedText.length < 80) {
      return null;
    }

    const lines = extractLines(rawText);
    const topSkills = extractSkillsFromText(normalizedText);
    const projectHighlights = pickHighlights(
      lines,
      /\b(project|built|developed|implemented|deployed|designed)\b/i,
      ["Explain one project with architecture, impact, and trade-offs."],
    );
    const experienceHighlights = pickHighlights(
      lines,
      /\b(experience|intern|worked|responsible|owner(ship)?|contributed)\b/i,
      ["Prepare concise experience stories with challenge, action, and outcome."],
    );

    const resumeScore = scoreFromProfileSignals(topSkills, projectHighlights, experienceHighlights, normalizedText);

    return {
      sourceFileName: fileName,
      summary: normalizedText.slice(0, 320),
      targetRole: inferTargetRole(normalizedText),
      topSkills: topSkills.length > 0 ? topSkills : ["Problem Solving", "Communication"],
      focusAreas: inferFocusAreas(topSkills),
      projectHighlights,
      experienceHighlights,
      resumeScore,
      jobReadiness: jobReadinessFromScore(resumeScore),
      lastAnalyzedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  } finally {
    if (parser) {
      await parser.destroy().catch(() => undefined);
    }
  }
}

function fallbackResumeProfile(fileName: string): ResumeProfile {
  return {
    sourceFileName: fileName,
    summary: "Resume uploaded successfully. Interview practice profile is ready with a starter baseline.",
    targetRole: "Software Engineer",
    topSkills: ["JavaScript", "React", "Problem Solving"],
    focusAreas: ["Data structures", "Behavioral answers", "Project storytelling"],
    projectHighlights: ["Build one role-focused portfolio project with measurable impact"],
    experienceHighlights: ["Prepare concise stories for teamwork, ownership, and debugging"],
    resumeScore: 70,
    jobReadiness: "developing",
    lastAnalyzedAt: new Date().toISOString(),
  };
}

export async function analyzeResumeProfileFromPdf(
  fileName: string,
  base64Pdf: string,
  mimeType: string,
): Promise<ResumeProfile> {
  const textDerivedProfile = await analyzeResumeProfileFromPdfText(fileName, base64Pdf);

  const prompt = [
    "You are an interview coach and resume analyst.",
    "Analyze the provided PDF resume and return strict JSON only.",
    "Do not include markdown, code fences, or extra keys.",
    "JSON schema:",
    "{",
    '  "summary": "string under 320 chars",',
    '  "targetRole": "string",',
    '  "topSkills": ["string", "..."],',
    '  "focusAreas": ["string", "..."],',
    '  "projectHighlights": ["string", "..."],',
    '  "experienceHighlights": ["string", "..."],',
    '  "resumeScore": 0-100 number,',
    '  "jobReadiness": "beginner|developing|intermediate|advanced|job_ready"',
    "}",
    "Prefer concise but actionable interview-focused output.",
  ].join("\n");

  try {
    const aiResponse = await generateGeminiJson<GeminiResumeProfile>({
      prompt,
      inlineData: {
        mimeType,
        base64Data: base64Pdf,
      },
    });

    const fallback = textDerivedProfile ?? fallbackResumeProfile(fileName);

    return {
      sourceFileName: fileName,
      summary:
        typeof aiResponse.summary === "string" && aiResponse.summary.trim().length > 0
          ? aiResponse.summary.trim().slice(0, 320)
          : fallback.summary,
      targetRole:
        typeof aiResponse.targetRole === "string" && aiResponse.targetRole.trim().length > 0
          ? aiResponse.targetRole.trim().slice(0, 120)
          : fallback.targetRole,
      topSkills: normalizeStringArray(aiResponse.topSkills, fallback.topSkills),
      focusAreas: normalizeStringArray(aiResponse.focusAreas, fallback.focusAreas),
      projectHighlights: normalizeStringArray(aiResponse.projectHighlights, fallback.projectHighlights),
      experienceHighlights: normalizeStringArray(aiResponse.experienceHighlights, fallback.experienceHighlights),
      resumeScore: clampScore(aiResponse.resumeScore ?? fallback.resumeScore),
      jobReadiness: toJobReadiness(aiResponse.jobReadiness),
      lastAnalyzedAt: new Date().toISOString(),
    };
  } catch {
    return textDerivedProfile ?? fallbackResumeProfile(fileName);
  }
}

function normalizeFileUrl(fileName: string): string {
  const slug = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `local://resume/${Date.now()}-${slug || "resume"}`;
}

export async function saveResumeProfile(
  userId: string,
  file: File,
  profile: ResumeProfile,
): Promise<{ storedInDatabase: boolean }> {
  try {
    await db
      .update(resumes)
      .set({ isActive: false })
      .where(eq(resumes.userId, userId));

    await db.insert(resumes).values({
      userId,
      fileName: file.name,
      fileUrl: normalizeFileUrl(file.name),
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
      isActive: true,
      resumeScore: profile.resumeScore,
      atsScore: clampScore(profile.resumeScore - 4),
      jobReadiness: profile.jobReadiness,
      extractedSkills: profile.topSkills,
      extractedExperience: {
        summary: profile.summary,
        highlights: profile.experienceHighlights,
      },
      extractedProjects: profile.projectHighlights,
      extractedEducation: {
        focusAreas: profile.focusAreas,
        targetRole: profile.targetRole,
      },
      analysisStatus: "completed",
      analysisCompletedAt: new Date(),
    });

    return { storedInDatabase: true };
  } catch {
    return { storedInDatabase: false };
  }
}
