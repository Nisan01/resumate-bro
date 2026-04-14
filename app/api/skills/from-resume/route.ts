import { NextRequest, NextResponse } from "next/server";
import { saveResumeSkills } from "@/utils/db/db-operations/skills-operations/skills";
 
// Body: { userId, skills: string[] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, skills } = body;
 
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!Array.isArray(skills)) return NextResponse.json({ error: "skills must be an array" }, { status: 400 });
 
    const inserted = await saveResumeSkills(userId, skills);
        console.log("Saved Skills from the resume Status:Completed");

    return NextResponse.json({ count: inserted.length, skills: inserted });
  } catch (err) {
    console.error("[POST /api/skills/from-resume]", err);
    return NextResponse.json({ error: "Failed to save resume skills" }, { status: 500 });
  }
}