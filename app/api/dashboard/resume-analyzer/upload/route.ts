import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { extractText } from "unpdf";
import type { ResumeProfile } from "@/lib/resume-profile";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const { text } = await extractText(new Uint8Array(buffer));
  return Array.isArray(text) ? text.join("\n") : text;
}

async function getAuthEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("[resume-upload] JWT_SECRET not configured.");
    throw new Error("JWT_SECRET not configured");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      email: string;
    };
    return decoded.email;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Gemini call with retry + model fallback (handles 429 rate limits)
// ---------------------------------------------------------------------------

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGeminiWithRetry(
  apiKey: string,
  prompt: string,
  maxOutputTokens = 2048
): Promise<string> {
  const MAX_RETRIES_PER_MODEL = 2;
  const BASE_DELAY_MS = 2000;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[resume-upload] Retrying with ${model} after ${delay}ms (attempt ${attempt})`);
        await sleep(delay);
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens,
            },
          }),
        }
      );

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        console.warn(
          `[resume-upload] 429 rate limit on ${model}.${
            retryAfter ? ` Retry-After: ${retryAfter}s.` : ""
          } attempt=${attempt}`
        );
        if (attempt < MAX_RETRIES_PER_MODEL) continue;
        console.warn(`[resume-upload] All retries for ${model} exhausted, trying next model.`);
        break;
      }

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[resume-upload] Gemini ${model} error:`, res.status, errBody);
        break;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text) {
        console.log(`[resume-upload] Success with model: ${model}`);
        return text;
      }
      break;
    }
  }

  throw new Error(
    "Gemini AI is currently rate-limited. Please wait 30 seconds and try uploading again."
  );
}

// ---------------------------------------------------------------------------
// Build ResumeProfile using Gemini AI (required — no fallback)
// ---------------------------------------------------------------------------

async function buildResumeProfile(
  resumeText: string,
  fileName: string
): Promise<ResumeProfile> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file."
    );
  }

  const prompt = `You are an expert career analyst and resume parser. Your job is to READ and EXTRACT real information from the resume below.

CRITICAL RULES:
1. "targetRole" MUST be derived from the actual job titles, experience, and skills IN THE RESUME. Do NOT default to "Software Engineer" unless the resume is explicitly about software engineering. Common roles: Data Scientist, DevOps Engineer, UI/UX Designer, Product Manager, Data Analyst, Backend Developer, Frontend Developer, Full Stack Developer, ML Engineer, Cybersecurity Analyst, Cloud Architect, etc.
2. "topSkills" MUST be the actual tools, technologies, or skills mentioned in the resume (e.g., Python, Figma, Excel, AWS, React — whatever is actually written).
3. "summary" MUST reflect the candidate's ACTUAL background, not a generic description.
4. Base EVERYTHING on what is WRITTEN in the resume. Never invent or assume.

Return ONLY a valid JSON object with NO markdown, NO code fences, NO explanation:

{
  "sourceFileName": "${fileName}",
  "summary": "<2-3 sentence summary based directly on this person's actual resume content>",
  "targetRole": "<the most accurate job title for this person based on their actual experience and skills — NOT a generic default>",
  "topSkills": ["<actual skill from resume>", "<actual skill>", "<actual skill>", "<actual skill>", "<actual skill>"],
  "focusAreas": ["<actual domain/area from resume>", "<actual domain>", "<actual domain>"],
  "projectHighlights": ["<actual project from resume one-liner>", "<actual project one-liner>"],
  "experienceHighlights": ["<actual achievement or experience>", "<actual achievement>"],
  "resumeScore": <integer 0-100 based on completeness and quality>,
  "jobReadiness": "<exactly one of: beginner, developing, intermediate, advanced, job_ready>",
  "lastAnalyzedAt": "${new Date().toISOString()}"
}

RESUME TEXT TO ANALYZE:
${resumeText.slice(0, 6000)}`;

  const raw = await callGeminiWithRetry(apiKey, prompt, 2048);

  // Strip any markdown code fences
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Find the JSON object
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Gemini returned an unexpected format during resume analysis. Please try again.");
  }

  const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
  parsed.lastAnalyzedAt = new Date().toISOString();
  parsed.sourceFileName = fileName;

  // Validate required fields
  const validReadiness = ["beginner", "developing", "intermediate", "advanced", "job_ready"];
  if (!validReadiness.includes(parsed.jobReadiness)) {
    parsed.jobReadiness = "intermediate";
  }
  if (!Array.isArray(parsed.topSkills)) parsed.topSkills = [];
  if (!Array.isArray(parsed.focusAreas)) parsed.focusAreas = [];
  if (!Array.isArray(parsed.projectHighlights)) parsed.projectHighlights = [];
  if (!Array.isArray(parsed.experienceHighlights)) parsed.experienceHighlights = [];

  const parsedResumeScore = Number(parsed.resumeScore);
  const roundedResumeScore = Number.isFinite(parsedResumeScore)
    ? Math.round(parsedResumeScore)
    : 0;
  parsed.resumeScore = Math.min(Math.max(roundedResumeScore, 0), 100);

  return parsed as ResumeProfile;
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/resume-analyzer/upload
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const email = await getAuthEmail();
    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided." },
        { status: 400 }
      );
    }

    // Validate file type
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    // Validate file size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Resume must be 5 MB or smaller." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const text = await extractPdfText(buffer);

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from the PDF. Please ensure it is not an image-only resume.",
        },
        { status: 422 }
      );
    }

    const resumeProfile = await buildResumeProfile(text, file.name);

    return NextResponse.json({ resumeProfile });
  } catch (error: unknown) {
    console.error("[resume-upload] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process resume upload.",
      },
      { status: 500 }
    );
  }
}
