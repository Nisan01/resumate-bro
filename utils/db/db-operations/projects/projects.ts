import { db } from "@/index";
import { projects } from "../../schema/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export const createProject = async (projectData: {
  userId: string;
  name: string;
  emoji?: string;
  status?: "active" | "progress" | "planning" | "done";
  description?: string;
  techTags?: string[];
  steps?: string[];
  progress?: number;
}) => {
  const [newProject] = await db
    .insert(projects)
    .values({
      id: uuidv4(),
      userId: projectData.userId,
      name: projectData.name,
      emoji: projectData.emoji || "🚀",
      status: projectData.status || "planning",
      description: projectData.description || "",
      techTags: projectData.techTags || [],
      steps: projectData.steps || [],
      progress: projectData.progress ?? 0,
    })
    .returning();

  return newProject;
};

// ✅ Get all projects for a user
export const getProjectsByUser = async (userId: string) => {
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId));

  return userProjects;
};