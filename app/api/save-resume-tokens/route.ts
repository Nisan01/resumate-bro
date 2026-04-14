 import { NextRequest, NextResponse } from "next/server";
  import { db } from "@/index";
  import { users } from "@/utils/db/schema/schema";
  import { eq } from "drizzle-orm";
import { saveResumeTokens } from "@/utils/db/db-operations/user-tokens/SaveTokens";

  export async function POST(request: Request) {
    try {
      const { userId,tokensUsed } = await request.json();

      if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
      }

      const result=await saveResumeTokens(userId,tokensUsed);
      console.log("Resume Tokens saved to Users Table ", result);
    

        

      return NextResponse.json({ message: "Resume tokens saved successfully" }, { status: 200 });
       
      
    } catch (error) {
      console.error("Error fetching user tokens:", error);
      return NextResponse.json({ error: "Failed to fetch user tokens" }, { status: 500 });
    }
  }