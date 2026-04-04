import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ResumeProfile } from "@/lib/resume-profile";
import {
  RESUME_PROFILE_COOKIE_KEY,
  decodeResumeProfileCookie,
  encodeResumeProfileCookie,
} from "@/lib/server/resume-profile-cookie";
import { getDashboardSession } from "../_lib/session";
import {
  generatePracticeQuestions,
  getResumeProfileFromDatabase,
  normalizeDifficulty,
  resolveResumeProfile,
} from "./service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getDashboardSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const cookieProfile = decodeResumeProfileCookie(
    cookieStore.get(RESUME_PROFILE_COOKIE_KEY)?.value,
  );

  try {
    const dbProfile = await getResumeProfileFromDatabase(session);
    const profile = dbProfile ?? cookieProfile;

    return NextResponse.json({
      hasResumeProfile: Boolean(profile),
      resumeProfile: profile,
    });
  } catch (error) {
    console.warn("/api/dashboard/practice-questions GET fallback response:", error);
    return NextResponse.json({
      hasResumeProfile: Boolean(cookieProfile),
      resumeProfile: cookieProfile,
    });
  }
}

export async function POST(request: Request) {
  const session = await getDashboardSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cookieStore = await cookies();
    const cookieProfile = decodeResumeProfileCookie(
      cookieStore.get(RESUME_PROFILE_COOKIE_KEY)?.value,
    );

    let body: {
      difficulty?: string;
      offset?: number;
      count?: number;
      resumeProfile?: Partial<ResumeProfile> | null;
    } = {};

    try {
      body = (await request.json()) as {
        difficulty?: string;
        offset?: number;
        count?: number;
        resumeProfile?: Partial<ResumeProfile> | null;
      };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const difficulty = normalizeDifficulty(body?.difficulty);
    const offset = typeof body?.offset === "number" && body.offset >= 0 ? Math.floor(body.offset) : 0;
    const count = typeof body?.count === "number" && body.count > 0 && body.count <= 10
      ? Math.floor(body.count)
      : 5;

    const databaseProfile = await getResumeProfileFromDatabase(session).catch(() => null);
    const profile = resolveResumeProfile({
      bodyProfile: body?.resumeProfile,
      dbProfile: databaseProfile ?? cookieProfile,
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: "Analyze a resume in Resume Analyzer first, then start practice questions.",
        },
        { status: 400 },
      );
    }

    const result = await generatePracticeQuestions({
      profile,
      difficulty,
      offset,
      count,
    });

    const response = NextResponse.json({
      difficulty,
      source: result.source,
      questions: result.questions,
      nextOffset: offset + result.questions.length,
      resumeProfile: profile,
    });

    try {
      response.cookies.set(RESUME_PROFILE_COOKIE_KEY, encodeResumeProfileCookie(profile), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    } catch (cookieError) {
      console.warn("/api/dashboard/practice-questions cookie write skipped:", cookieError);
      response.cookies.delete(RESUME_PROFILE_COOKIE_KEY);
    }

    return response;
  } catch (error) {
    console.error("/api/dashboard/practice-questions POST error:", error);
    return NextResponse.json(
      { error: "Unable to generate practice questions right now. Please try again." },
      { status: 503 },
    );
  }
}
