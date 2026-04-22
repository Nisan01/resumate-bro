import { generateRoadmapPrompt } from "@/app/dashboard/roadmap/_components/prompts/prompt";
import { NextRequest, NextResponse } from "next/server";

const GROQ_TIMEOUT_MS = 10000;



export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json();

    if (!goal || goal.trim().length < 2) {
      return NextResponse.json(
        { error: "Enter a valid career or industry." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY" },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: generateRoadmapPrompt(goal) }],
          response_format: { type: "json_object" },
        }),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error("Failed to generate roadmap");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

 
    const roadmap = JSON.parse(content);

    return NextResponse.json(roadmap);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
