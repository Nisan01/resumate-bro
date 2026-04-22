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

  // Fetch projects
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

      // Normalize each row so the PDF renderer always finds analysis data
      // under `analysisResult`. The actual JSON blob lives in `rawJsonFeedback`;
      // `totalTokensUsed` is a separate integer column on the same row.
      const normalizedAnalyses = analyses.map((a) => ({
        ...a,
        analysisResult: {
          // Spread the full JSON feedback blob
          ...(typeof a.rawJsonFeedback === "object" && a.rawJsonFeedback !== null
            ? (a.rawJsonFeedback as Record<string, unknown>)
            : {}),
          // Inject the token count so the PDF can read it from one place
          totalTokensUsed: { count: a.totalTokensUsed ?? 0 },
        },
      }));

      return { ...res, analyses: normalizedAnalyses };
    })
  );

  // Use the parsed resume header name when available so the PDF cover
  // shows the full name instead of the short account display name.
  const firstAnalysisResult =
    (resumesWithAnalyses[0]?.analyses?.[0]?.analysisResult as any) ?? {};
  const resumeName: string =
    firstAnalysisResult?.header?.name ?? user.name ?? "";

  return {
    success: true,
    message: "User data exported successfully",
    data: {
      ...user,
      name: resumeName,
      projects: userProjects,
      resumes: resumesWithAnalyses,
    },
  };
};