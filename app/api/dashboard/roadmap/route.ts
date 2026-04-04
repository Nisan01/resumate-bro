import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { RESUME_PROFILE_COOKIE_KEY, decodeResumeProfileCookie } from "@/lib/server/resume-profile-cookie";
import { getDashboardSession } from "../_lib/session";
import { getRoadmapPayload, inferRoadmapTrack, roadmapFallbackRoadmaps } from "./service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getDashboardSession();
  const cookieStore = await cookies();
  const resumeProfile = decodeResumeProfileCookie(cookieStore.get(RESUME_PROFILE_COOKIE_KEY)?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const track = inferRoadmapTrack(request.nextUrl.searchParams.get("track"));

  try {
    return NextResponse.json(await getRoadmapPayload(session, track, resumeProfile));
  } catch (error) {
    console.warn("/api/dashboard/roadmap fallback response:", error);
    return NextResponse.json({
      track,
      roadmap: roadmapFallbackRoadmaps[track],
      source: "fallback" as const,
    });
  }
}
