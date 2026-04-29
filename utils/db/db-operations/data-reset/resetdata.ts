import { getDb } from "@/index";
import { resumes, projects,userSkills } from "../../schema/schema";
import { eq } from "drizzle-orm";

export const resetUserData = async (userId: string) => {
  const db = getDb();

  try {
    // 1. Delete all projects associated with the user
    await db
      .delete(projects)
      .where(eq(projects.userId, userId));

 
    await db
      .delete(resumes)
      .where(eq(resumes.userId, userId));
    
    await db .delete(userSkills)
    .where(eq(userSkills.userId, userId));  


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