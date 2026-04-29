import { NextRequest, NextResponse } from "next/server";
import { getUserSkills, addUserSkill } from "@/utils/db/db-operations/skills-operations/skills";
 

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
 
    const sourceParam = req.nextUrl.searchParams.get("source");
    const sourceFilter = sourceParam
      ? (sourceParam.split(",") as ("resume" | "manual" | "suggested")[])
      : undefined;
 
    const skills = await getUserSkills(userId, sourceFilter);
    return NextResponse.json({ skills });
  } catch (err) {
    console.error("[GET /api/skills]", err);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, skillName, source = "manual", proficiency, status, notes, meta } = body;
 
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!skillName?.trim()) return NextResponse.json({ error: "skillName is required" }, { status: 400 });
 
    const skill = await addUserSkill({ userId, skillName, source, proficiency, status, notes, meta });
    return NextResponse.json({ skill }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/skills]", err);
    return NextResponse.json({ error: "Failed to add skill" }, { status: 500 });
  }
}