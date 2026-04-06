import { NextResponse } from "next/server";
import { saveAiAnalysisResult } from "@/utils/db/db-operations/analysis/analysis";

export async function POST(request: Request) {

try {

const { analysis, userId, totalTokensUsed } = await request.json();



if (!analysis || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }


const result = await saveAiAnalysisResult(userId, analysis, totalTokensUsed);

if (!result) {
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });

} catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
}


}