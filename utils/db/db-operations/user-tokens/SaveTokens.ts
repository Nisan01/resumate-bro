import { getDb } from "@/index"; 
import { resumes, users,projects,resumeAnalyses } from "@/utils/db/schema/schema";
import { eq,sql } from "drizzle-orm";

export async function saveSkillsTokens(userId: string, tokensUsed: number) {
   const db = getDb();


 try {
     await db
      .update(users)
      .set({ totalSkillTokens: sql`${users.totalSkillTokens} + ${tokensUsed}` })
      .where(eq(users.id, userId));
    
 } catch (error) {
    console.error("Error updating token count:", error);
    
 }
 
}       
export async function saveResumeTokens(userId: string, tokensUsed: number) {

 try {
      const db = getDb();

     await db
      .update(users)
      .set({ totalResumeTokens: sql`${users.totalResumeTokens} + ${tokensUsed}` })
      .where(eq(users.id, userId));
    
 } catch (error) {
    console.error("Error updating token count:", error);
    
 }
 
}       

