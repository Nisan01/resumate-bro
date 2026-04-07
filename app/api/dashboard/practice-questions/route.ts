import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { InterviewDifficulty } from "@/lib/resume-profile";

const GROQ_TIMEOUT_MS = 10000;

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function getAuthEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    return decoded.email;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PracticeQuestionItem {
  id: string;
  question: string;
  answer: string;
  focusArea: string;
}

// ---------------------------------------------------------------------------
// Build prompt from target role + difficulty
// ---------------------------------------------------------------------------

function buildPrompt(
  targetRole: string,
  difficulty: InterviewDifficulty,
  count: number,
  offset: number
): string {
  const descriptions: Record<InterviewDifficulty, string> = {
    beginner: "basic concepts, definitions, and simple scenario questions for entry-level candidates",
    intermediate: "practical application, real-world debugging, and trade-off questions for mid-level candidates",
    advanced: "system design, architecture decisions, performance optimization, and leadership scenarios for senior candidates",
  };

  return `You are a senior technical interviewer conducting a mock interview for a "${targetRole}" position.

Generate EXACTLY ${count} interview questions for difficulty level: ${difficulty.toUpperCase()}
Focus: ${descriptions[difficulty]}

This is batch offset ${offset} — generate questions ${offset + 1} to ${offset + count}. Make them distinct from earlier batches.

RULES:
- Every question must be specifically relevant to the "${targetRole}" role
- Answers must be concise model answers (2-4 sentences) tailored to this role
- Return ONLY valid JSON

JSON format MUST exactly match this structure:
{
  "questions": [
    {
      "id": "q_${offset}_0",
      "question": "<specific question>",
      "answer": "<concise model answer>",
      "focusArea": "<specific skill or topic>"
    }
  ]
}`;
}

// ---------------------------------------------------------------------------
// GET  — auth check
// POST — generate questions from target role using Groq
// ---------------------------------------------------------------------------

export async function GET() {
  const email = await getAuthEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const email = await getAuthEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json() as {
      targetRole?: string;
      difficulty?: InterviewDifficulty;
      count?: number;
      offset?: number;
    };

    const { targetRole, difficulty, count = 5, offset = 0 } = body;

    // Validate inputs
    if (!targetRole || targetRole.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your target role before generating questions." },
        { status: 400 }
      );
    }

    if (!difficulty || !["beginner", "intermediate", "advanced"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Choose beginner, intermediate, or advanced." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 10);
    const parsedOffset = Number(offset);
    const safeOffset = Number.isFinite(parsedOffset)
      ? Math.max(Math.floor(parsedOffset), 0)
      : 0;

    const prompt = buildPrompt(targetRole.trim(), difficulty, safeCount, safeOffset);

    // Call Groq endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Recommended fast model
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json(
          { error: "Question generation timed out. Please try again." },
          { status: 504 }
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("[practice-questions] Groq Error:", response.status, errText);
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Invalid response missing content from Groq.");
    }

    // Parse the generated JSON object
    const parsedData = JSON.parse(content) as { questions: PracticeQuestionItem[] };
    let questions = parsedData.questions || [];

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI returned no questions. Please try again.");
    }

    // Assign fallback IDs and sanitize text
    questions = questions.map((q, i) => ({
      id: q.id || `q_${safeOffset}_${i}`,
      question: (q.question || "").trim() || "Question unavailable",
      answer: (q.answer || "").trim() || "Answer unavailable",
      focusArea: (q.focusArea || "").trim() || targetRole,
    }));

    return NextResponse.json({
      targetRole: targetRole.trim(),
      difficulty,
      questions,
      nextOffset: safeOffset + questions.length,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Question generation timed out. Please try again." },
        { status: 504 }
      );
    }

    console.error("[practice-questions] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate questions." },
      { status: 500 }
    );
  }
}
