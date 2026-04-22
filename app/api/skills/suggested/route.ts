import { NextRequest, NextResponse } from "next/server";
import { getSuggestedSkills } from "@/utils/db/db-operations/skills-operations/skills";
 

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
 
    const skills = await getSuggestedSkills(userId);
    const industry = skills[0]?.meta ? (skills[0].meta as any).industry ?? null : null;
 
    return NextResponse.json({ skills, industry });
  } catch (err) {
    console.error("[GET /api/skills/suggested]", err);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}