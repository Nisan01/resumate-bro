 import { NextRequest, NextResponse } from "next/server";
  import { db } from "@/index";
  import { users } from "@/utils/db/schema/schema";
  import { eq } from "drizzle-orm";

  export async function POST(request: Request) {
    try {
      const { userId } = await request.json();

      if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
      }

      const [stats] = await db
        .select({
          totalSkillTokens: users.totalSkillTokens,
          totalResumeTokens: users.totalResumeTokens,
        })
        .from(users)
        .where(eq(users.id, userId));

        

      return NextResponse.json({
        totalSkillTokens: stats?.totalSkillTokens ?? 0,
        totalResumeTokens: stats?.totalResumeTokens ?? 0,
        totalAllTokens: (stats?.totalSkillTokens ?? 0) + (stats?.totalResumeTokens ?? 0),
      });
    } catch (error) {
      console.error("Error fetching user tokens:", error);
      return NextResponse.json({ error: "Failed to fetch user tokens" }, { status: 500 });
    }
  }