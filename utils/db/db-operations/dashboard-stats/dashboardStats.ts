
import { getDb } from "@/index"; 
import { resumeAnalyses, users } from "../../schema/schema";
import { eq } from "drizzle-orm";
import { resumes } from "../../schema/schema";
import { projects } from "../../schema/schema";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm";         


export async function getDashboardStats(userId: string) {
  const db = getDb();

  const [userData, resumeCountResult, projectsResult] = await Promise.all([
    db.select({
      totalSkillTokens: users.totalSkillTokens,
      totalResumeTokens: users.totalResumeTokens,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1),

    db.select({ count: sql<number>`count(*)` })
    .from(resumes)
    .where(eq(resumes.userId, userId)),

    Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.userId, userId)),
db.select({
  id: resumes.id,
  applicantName: resumes.applicantName,
  fileName: resumes.fileName,
  createdAt: resumes.createdAt,
  overallScore: resumeAnalyses.overallScore,
extractedSkills: resumes.extractedSkills,})
.from(resumes)
.leftJoin(
  resumeAnalyses,
  eq(resumeAnalyses.resumeId, resumes.id)
)
.where(eq(resumes.userId, userId))
.orderBy(desc(resumes.createdAt))
.limit(5)   ])
  ]);

  const [userStats] = userData; 

  const [resumeRow] = resumeCountResult;
  const resumeCount = Number(resumeRow?.count ?? 0);

  const [projectCountRows, latestResumes] = projectsResult;
  const [projectRow] = projectCountRows; 
  const projectCount = Number(projectRow?.count ?? 0);

  return {
    userStats: userStats ?? null,
    resumeCount,
    projectCount,
    latestResumes 
  };
}