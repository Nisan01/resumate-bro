import { NextResponse } from "next/server";
import { createProject, getProjectsByUser } from "@/utils/db/db-operations/projects/projects";


export async function POST(req: Request) {
  try {
    const {
      userId,
      name,
      emoji,
      status,
      description,
      techTags,
      steps,
      progress,
    } = await req.json();

    if (!userId || !name) {
      return NextResponse.json(
        { error: "userId and name are required" },
        { status: 400 }
      );
    }

    const newProject = await createProject({
      userId,
      name,
      emoji,
      status,
      description,
      techTags,
      steps,
      progress,
    });

    return NextResponse.json({ project: newProject });
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}