import { db } from "@/index";
import { resumes, resumeAnalyses } from "../../schema/schema";
import { eq, sql } from "drizzle-orm";
import { sum, count, countDistinct } from "drizzle-orm";

export const getResumeStatsForUser = async (userId: string) => {
  const [row] = await db
    .select({
      // Use countDistinct to avoid duplicates from the join
      resumeCount: countDistinct(resumes.id), 
      // Cast the sum to a number, or handle the string return
      totalTokens: sum(resumeAnalyses.totalTokensUsed),
    })
    .from(resumes)
    .leftJoin(resumeAnalyses, eq(resumeAnalyses.resumeId, resumes.id))
    .where(eq(resumes.userId, userId));

  return {
    // sum() returns a string in many drivers, so we convert to Number
    resumeCount: Number(row?.resumeCount ?? 0),
    totalTokens: Number(row?.totalTokens ?? 0),
  };
};