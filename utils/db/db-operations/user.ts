import { getDb } from "../../../index"; 
import { resumes, users,projects,resumeAnalyses } from "../schema/schema";
import { eq } from "drizzle-orm";


export const createUser = async (userData: {
  email: string;
  name: string;
  password: string;
  avatarUrl?: string | null;

}) => {
  const db = getDb();

  const [newUser] = await db.insert(users).values(userData).returning();
  return newUser; 
};


export async function createUserFromGoogle(data: {
  email: string;
  name: string;
  avatarUrl?: string;
}) {
  const db = getDb();


  const [user] = await db.insert(users).values({
    email: data.email,
    name: data.name,
    password: null, 
    avatarUrl: data.avatarUrl ?? null,
  }).returning();
  return user;
}



export const getUserByEmail = async (email: string) => {
  const db = getDb();

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
};



export const updateTargetsProfile = async (
  userId: string,
  updateData: {
    targetRole?: string;
    targetIndustry?: string;
  }
) => {
  try {
    const db = getDb();

    const updateFields: Partial<{
      targetRole: string;
      targetIndustry: string;
    }> = {};

    if (updateData.targetRole) {
      const role = updateData.targetRole.trim();

      if (role.length < 2 || role.length > 150) {
        return {
          success: false,
          message: "Invalid target role",
          status: 400,
        };
      }

      updateFields.targetRole = role;
    }

    if (updateData.targetIndustry) {
      const industry = updateData.targetIndustry.trim();

      if (industry.length < 2 || industry.length > 150) {
        return {
          success: false,
          message: "Invalid target industry",
          status: 400,
        };
      }

      updateFields.targetIndustry = industry;
    }

    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        message: "No fields to update",
        status: 400,
      };
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateFields,
        updatedAt: new Date(), 
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return {
        success: false,
        message: "User not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "User profile updated successfully",
      status: 200,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating target profile:", error);
    return {
      success: false,
      message: "Error updating user profile",
      status: 500,
    };
  }
};


export const deleteAccount = async (userId: string) => {
  const db = getDb();
  try {
    await db.delete(projects).where(eq(projects.userId, userId));

    const userResumes = await db.select().from(resumes).where(eq(resumes.userId, userId));
    for (const res of userResumes) {
      await db.delete(resumeAnalyses).where(eq(resumeAnalyses.resumeId, res.id));
    }
    await db.delete(resumes).where(eq(resumes.userId, userId));

    await db.delete(users).where(eq(users.id, userId));

    return { success: true, message: "Account and all associated data deleted successfully." };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, message: "An error occurred while deleting the account." };
  }
};