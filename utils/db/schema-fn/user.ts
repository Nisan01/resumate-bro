import { db } from "../../../index"; 
import { users } from "../schema/schema";
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