export const analyzeWorkExperiencePrompt = (resumeText: string, targetRole: string) => `
You are an expert resume analyst. Analyze this resume:

${resumeText}

Target role: ${targetRole}

Return ONLY this exact JSON structure, no other text:

{
  "overall_score": <number 0-10>,
  "suggestions": ["string", "string"],
  "work_experience": [
    {
      "company": "<company name>",
      "title": "<job title>",
      "period": "<e.g. Jan 2022 – Present>",
      "score": <number 0-10>,
      "status": "good" | "ok" | "missing",
      "feedback": "<one sentence actionable advice>",
      "bullets": [
        {
          "text": "<bullet point text>",
          "status": "good" | "ok" | "missing"
        }
      ]
    }
  ]
}

suggestions must be a plain array of strings. Extract ALL roles. Only output JSON.
`;