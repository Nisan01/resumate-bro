import { getLatestResumes } from "@/utils/db/db-operations/get-resumes/getresume";
import { getProjectsCountByUser } from "@/utils/db/db-operations/projects/projects";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const projectCounts = await getProjectsCountByUser(userId);
    const latestResumes = await getLatestResumes(userId);


    return NextResponse.json({
      projectCounts: Number(projectCounts ?? 0),
      resumes: latestResumes, 
    });

  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);

    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}