import { db } from "@/index";
import { resumes, resumeAnalyses } from "../../schema/schema";
import { eq, sql } from "drizzle-orm";
import {  countDistinct } from "drizzle-orm";

export const getResumeCount = async (userId: string) => {
  const [row] = await db
    .select({
      resumeCount: countDistinct(resumes.id), 
     
     
    })
    .from(resumes)
    .leftJoin(resumeAnalyses, eq(resumeAnalyses.resumeId, resumes.id))
    .where(eq(resumes.userId, userId));

  return {
    resumeCount: Number(row?.resumeCount ?? 0),
  };
};