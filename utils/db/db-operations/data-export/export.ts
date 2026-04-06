import { db } from "@/index";
import { users, resumes, resumeAnalyses, projects } from "../../schema/schema";
import { eq } from "drizzle-orm";

export const exportUserData = async (userId: string) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return { success: false, message: "User not found" };

  // 2️⃣ Fetch projects
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId));

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId));

  const resumesWithAnalyses = await Promise.all(
    userResumes.map(async (res) => {
      const analyses = await db
        .select()
        .from(resumeAnalyses)
        .where(eq(resumeAnalyses.resumeId, res.id));

      return { ...res, analyses };
    })
  );

  return {
    success: true,
    message: "User data exported successfully",
    data: {
      ...user,
      projects: userProjects,
      resumes: resumesWithAnalyses,
    },
  };
};