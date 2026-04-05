export const analyzeSkillsPrompt = (resumeText: string, targetRole: string) => `
You are an expert resume analyst. Analyze this resume:

${resumeText}

Target role: ${targetRole}

Return ONLY this exact JSON structure, no other text:

{
  "overall_score": <number 0-10>,
  "suggestions": ["string", "string"],
  "skills": [
    {
      "name": "<skill name>",
      "level": "<Expert | Advanced | Proficient | Familiar | empty string>",
      "score": <number 0-10>,
      "status": "good" | "ok" | "missing",
      "note": "<one sentence feedback>"
    }
  ]
}

suggestions must be a plain array of strings. Include both technical and soft skills. Only output JSON.
`;