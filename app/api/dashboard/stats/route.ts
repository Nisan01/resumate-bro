import { getDashboardStats } from "@/utils/db/db-operations/dashboard-stats/dashboardStats";
import { count } from "console";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const results = await getDashboardStats(userId);



    return NextResponse.json({
      tokens: {
        totalSkillTokens: results.userStats?.totalSkillTokens ?? 0,
        totalResumeTokens: results.userStats?.totalResumeTokens ?? 0,
        totalAllTokens: (results.userStats?.totalSkillTokens ?? 0) + (results.userStats?.totalResumeTokens ?? 0),
      },
      resumeCount: results.resumeCount ?? 0,
      projectCounts: results.projectCount ?? 0,
      resumes: results.latestResumes ?? [],
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}