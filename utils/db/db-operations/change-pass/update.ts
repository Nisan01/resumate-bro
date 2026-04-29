import { getDb } from "@/index"; 
import { users } from "../../schema/schema";
import { eq } from "drizzle-orm";

export const updateUserPassword = async (userData: {
  currentPassword: string;
  newPassword: string;
  userId: string;
}): Promise<{ success: boolean; message: string }> => {
  const db = getDb();

  const { userId, currentPassword, newPassword } = userData;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (currentPassword !== user.password) {
    return { success: false, message: "Incorrect password" };
  }

  const updatedUser = await db
    .update(users)
    .set({ password: newPassword })
    .where(eq(users.id, userId))
    .returning();

  if (updatedUser.length > 0) {
    return { success: true, message: "Password updated successfully" };
  } else {
    return { success: false, message: "Failed to update password" };
  }
};


export const updateAvatar=async (userId:string, avatarUrl:string):Promise<{ success: boolean; message: string }>=>{
    const db = getDb();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const updateAvatar = await db
      .update(users)
      .set({ avatarUrl })
      .where(eq(users.id, userId))
      .returning();

    if (updateAvatar.length > 0) {
      return { success: true, message: "Avatar updated successfully" };
    } else {
      return { success: false, message: "Failed to update avatar" };
    }
  };