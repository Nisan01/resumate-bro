export const generateCertificationsProjectsPrompt = (resumeText: string) => `
You are an expert resume analyst. Analyze this resume:

${resumeText}

Return ONLY this exact JSON structure, no other text:

{
  "overall_score": <number 0-10>,
  "suggestions": ["string", "string"],
  "certifications": [
    {
      "name": "<certification name>",
      "description": "<what was learned>",
      "impact": "<outcome or relevance>",
      "date": "<completion date or empty string>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "type": "project" | "education",
      "description": "<what was built>",
      "impact": "<outcome, metrics, or technologies>",
      "date": "<completion date or empty string>"
    }
  ]
}

suggestions must be a plain array of strings. If none found, return empty arrays. Only output JSON.
`;