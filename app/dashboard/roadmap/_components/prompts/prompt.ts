export const generateRoadmapPrompt = (goal: string) => `
You are a senior industry expert designing a modern learning roadmap.

Target (career or industry): ${goal}

Return ONLY JSON:

{
  "phases": [
    {
      "label": "Phase 1",
      "name": "Foundation",
      "dur": "2 months",
      "nodes": [
        {
          "title": "Example Skill",
          "priority": "critical" | "high" | "medium" | "optional",
          "desc": "Clear, practical, outcome-focused description."
        }
      ]
    }
  ]
}

Guidelines:
- The target may be a job role (e.g. "Frontend Developer") OR an industry (e.g. "Artificial Intelligence")
- Adapt intelligently:
  - If role → focus on job-ready skills
  - If industry → include domains + entry paths
- Always return exactly 4 phases:
  1. Foundation
  2. Core Skills
  3. Intermediate
  4. Advanced
- Each phase must have 3-4 nodes
- Duration should feel realistic
- Skills must reflect modern (2025) standards
- Prefer tools, frameworks, and real-world skills
- Avoid vague items like "learn basics"
- Do NOT repeat similar skills across phases
- Progress logically from beginner → advanced
- Keep descriptions under 15 words

Only output JSON.
`;