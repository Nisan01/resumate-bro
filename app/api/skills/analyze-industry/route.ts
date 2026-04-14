import { NextRequest, NextResponse } from "next/server";
import { getUserSkills, saveSuggestedSkills } from "@/utils/db/db-operations/skills-operations/skills";
import { analyzeIndustryPrompt } from "@/app/dashboard/skills-tracker/_components/prompts/prompts";

  import { db } from "@/index";
  import { users } from "@/utils/db/schema/schema";
  import { eq } from "drizzle-orm";
import { saveSkillsTokens } from "@/utils/db/db-operations/user-tokens/SaveTokens";

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { userId, industry } = body;

      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
      if (!industry) return NextResponse.json({ error: "industry is required" }, { status: 400 });

      const allSkills = await getUserSkills(userId);
      const activeSkills = allSkills
        .filter((s) => s.status !== "ignored" && s.source !== "suggested")
        .map((s) => `- ${s.skillName} (${s.proficiency ?? "none"})`)
        .join("\n");

      let tokensUsed = 0;
      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_PROJECTS_API_KEY}`,
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-nano-30b-a3b:free",
          messages: [{ role: "user", content: analyzeIndustryPrompt(industry, activeSkills) }],
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) throw new Error(`OpenRouter error: ${aiResponse.status}`);

      const aiData = await aiResponse.json();
      const rawText = aiData.choices?.[0]?.message?.content ?? "";
      tokensUsed = aiData.usage?.total_tokens ?? 0;

      // Parse JSON safely
      const cleanedJson = JSON.parse(rawText.replace(/```json|```/g, "").trim());

      // Save suggested skills to DB (clears old suggestions first)
      const saved = await saveSuggestedSkills(userId, cleanedJson.suggested_skills ?? [], industry);
      console.log("Saving tokens....");

  const tokenresponse =await saveSkillsTokens(userId, tokensUsed);
  console.log("Tokens successfully saved !")
  

      return NextResponse.json({
        count: saved.length,
        industry,
        skills: saved,
        tokensUsed
      });
    } catch (err) {
      console.error("[POST /api/skills/analyze-industry]", err);
      return NextResponse.json({ error: "Failed to analyze industry skills" }, { status: 500 });
    }
  }