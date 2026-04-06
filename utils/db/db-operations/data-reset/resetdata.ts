import { db } from "@/index";
import { resumes, projects } from "../../schema/schema";
import { eq } from "drizzle-orm";

/**
 * Deletes all user-generated content (resumes and projects) 
 * while keeping the user account intact.
 */
export const resetUserData = async (userId: string) => {
  try {
    // 1. Delete all projects associated with the user
    await db
      .delete(projects)
      .where(eq(projects.userId, userId));

    // 2. Delete all resumes associated with the user
    // Note: Because of 'onDelete: "cascade"' in the schema, 
    // this will automatically delete records in 'resume_analyses'
    await db
      .delete(resumes)
      .where(eq(resumes.userId, userId));

    return { 
      success: true, 
      message: "All user data has been cleared successfully." 
    };
  } catch (error) {
    console.error("Error resetting user data:", error);
    return { 
      success: false, 
      message: "Failed to reset data. Please try again." 
    };
  }
};