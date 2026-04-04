import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { RESUME_PROFILE_COOKIE_KEY, decodeResumeProfileCookie } from "@/lib/server/resume-profile-cookie";
import { getDashboardSession } from "../_lib/session";
import { getReportsPayload, reportsFallbackPayload } from "./service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getDashboardSession();
  const cookieStore = await cookies();
  const resumeProfile = decodeResumeProfileCookie(cookieStore.get(RESUME_PROFILE_COOKIE_KEY)?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getReportsPayload(session, resumeProfile));
  } catch (error) {
    console.warn("/api/dashboard/reports fallback response:", error);
    return NextResponse.json({ ...reportsFallbackPayload, source: "fallback" as const });
  }
}
