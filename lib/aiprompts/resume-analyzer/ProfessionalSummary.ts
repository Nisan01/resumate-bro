export const analyzeSummaryPrompt = (resumeText: string, targetRole: string) => `
You are an expert resume analyst. Analyze this resume:

${resumeText}

Target role: ${targetRole}

Return ONLY this exact JSON structure, no other text:

{
  "summary": "<extracted summary text or empty string>",
  "status": "good" | "ok" | "needs improvement",
  "score": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<one sentence of actionable advice>",
  "improved": "<a fully rewritten improved version of the summary>",
  "suggestions": ["string", "string", "string"]
}

suggestions must be a plain array of strings. Only output JSON.
`;