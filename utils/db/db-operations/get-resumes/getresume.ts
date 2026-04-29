import { getDb } from "@/index";
import { resumes, resumeAnalyses } from "../../schema/schema";
import { eq, desc } from "drizzle-orm";



export const getLatestResumes = async (userId: string) => {
  const db = getDb();

  const data = await db
    .select({
      id: resumes.id,
      fileName: resumes.fileName,
      extractedSkills: resumes.extractedSkills,
      createdAt: resumes.createdAt,
      overallScore: resumeAnalyses.overallScore, 
    })
    .from(resumes)
    .leftJoin(resumeAnalyses, eq(resumeAnalyses.resumeId, resumes.id))
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.createdAt))
    .limit(4);

  return data;
};