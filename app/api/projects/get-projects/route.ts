import { NextResponse } from "next/server";
import { createProject, getProjectsByUser } from "@/utils/db/db-operations/projects/projects";

// ── GET /api/projects/save-projects?userId=xxx ──
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param is required" },
        { status: 400 }
      );
    }

    const projects = await getProjectsByUser(userId);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
