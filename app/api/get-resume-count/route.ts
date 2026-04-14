import { get } from "http";
import { getResumeCount } from "@/utils/db/db-operations/resume-tokens-total/totalcount";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const { userId } = await request.json();

  try {

    const result=await getResumeCount(userId);
return NextResponse.json(result);  } catch (error) {
    
    console.error("Error fetching resume stats:", error);
    return NextResponse.json({ error: "Failed to fetch resume stats" }, { status: 500 });   
    
  }

}