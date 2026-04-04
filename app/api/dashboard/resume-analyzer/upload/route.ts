import { NextResponse } from "next/server";
import {
  RESUME_PROFILE_COOKIE_KEY,
  encodeResumeProfileCookie,
} from "@/lib/server/resume-profile-cookie";
import { getDashboardSession } from "../../_lib/session";
import { analyzeResumeProfileFromPdf, saveResumeProfile } from "./service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function isValidPdf(file: File): boolean {
  const normalizedName = file.name.toLowerCase();
  return file.type === "application/pdf" || normalizedName.endsWith(".pdf");
}

export async function POST(request: Request) {
  const session = await getDashboardSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
    }

    if (!isValidPdf(file)) {
      return NextResponse.json({ error: "Only PDF resumes are supported" }, { status: 400 });
    }

    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Resume size must be 5MB or less" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeProfile = await analyzeResumeProfileFromPdf(
      file.name,
      buffer.toString("base64"),
      file.type || "application/pdf",
    );

    const storeResult = await saveResumeProfile(session.userId, file, resumeProfile);

    const response = NextResponse.json({
      success: true,
      resumeProfile,
      storedInDatabase: storeResult.storedInDatabase,
    });

    response.cookies.set(RESUME_PROFILE_COOKIE_KEY, encodeResumeProfileCookie(resumeProfile), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("/api/dashboard/resume-analyzer/upload error:", error);
    return NextResponse.json(
      { error: "Unable to analyze resume right now. Please try again." },
      { status: 503 },
    );
  }
}
