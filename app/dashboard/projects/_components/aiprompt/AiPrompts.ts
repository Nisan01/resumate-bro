interface Project {
  id: number;
  emoji: string;
  color: string;
  status: "active" | "progress" | "planning" | "done";
  statusLabel: string;
  pct: number;
  grad: string;
  name: string;
  desc: string;
  tags: string[];
  steps: string[];
}

export const analyzeProjectPrompt = (project: Project, projectContext?: string) => `
You are a Senior Technical Auditor. Analyze the following project in detail.

PROJECT DATA:
{
  "name": "${project.name}",
  "emoji": "${project.emoji}",
  "status": "${project.statusLabel}",
  "progress": ${project.pct},
  "description": "${project.desc}",
  "tags": [${project.tags.map(t => `"${t}"`).join(", ")}],
  "steps": [${project.steps.map(s => `"${s}"`).join(", ")}]
}

PROJECT CONTEXT: ${projectContext || "No context provided. Analyze based on common industry standards and best practices."}

Return ONLY this exact JSON structure, no other text:

{
  "project_name": "${project.name}",
  "summary": "A concise summary paragraph of the project's current state, strengths, weaknesses, and potential risks.",
  "analysis": {
    "good": ["point 1", "point 2", "... min 4, max 15"]
  },
  "follow_up": ["point 1", "point 2", "... min 2, max 15"],
  "overall_feedback": "Line one of feedback.\\nLine two of feedback."
}

Constraints:
1. **Summary:** Minimum 3 lines, maximum 10 lines.
2. **Good Points:** Provide 4–15 points.
3. **Follow-up Actions:** Provide 2–15 points.
4. **Overall Feedback:** 2–3 lines.
5. **Output:** Valid JSON only. Do not include any other text outside the JSON.
`;