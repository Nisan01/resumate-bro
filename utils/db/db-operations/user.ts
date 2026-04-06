import { db } from "../../../index"; 
import { resumes, users,projects,resumeAnalyses } from "../schema/schema";
import { eq } from "drizzle-orm";

export const createUser = async (userData: {
  email: string;
  name: string;
  password: string;
  avatarUrl?: string | null;
}) => {
  const [newUser] = await db.insert(users).values(userData).returning();
  return newUser; 
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
};


export const deleteAccount = async (userId: string) => {
  try {
    // 1️⃣ Delete project data
    await db.delete(projects).where(eq(projects.userId, userId));

    // 2️⃣ Delete resumes and their analyses
    const userResumes = await db.select().from(resumes).where(eq(resumes.userId, userId));
    for (const res of userResumes) {
      await db.delete(resumeAnalyses).where(eq(resumeAnalyses.resumeId, res.id));
    }
    await db.delete(resumes).where(eq(resumes.userId, userId));

    // 3️⃣ Delete user
    await db.delete(users).where(eq(users.id, userId));

    return { success: true, message: "Account and all associated data deleted successfully." };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, message: "An error occurred while deleting the account." };
  }
};