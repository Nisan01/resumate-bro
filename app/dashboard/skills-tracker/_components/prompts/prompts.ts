export const analyzeIndustryPrompt = (
  industry: string,
  activeSkills: string
): string => `You are a career advisor and skills analyst. Given a person's current skills and their target industry, suggest skills they should learn.

Target Industry: ${industry}

User's Current Skills:
${activeSkills || "No skills listed yet"}

Return ONLY this JSON structure, no other text or markdown backticks:

{
  "suggested_skills": [
    {
      "name": "Skill Name",
      "reason": "Brief reason why this skill is important for the industry",
      "priority": "high",
      "category": "technical"
    }
  ]
}

Suggest 10-15 skills with a mix of technical skills, soft skills, and tools relevant to ${industry}.
priority must be one of: high, medium, low
category must be one of: technical, soft, tool
Only output raw JSON, nothing else.`;