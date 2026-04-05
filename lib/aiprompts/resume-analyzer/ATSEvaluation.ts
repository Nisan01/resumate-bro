export const analyzeATSPrompt = (extractedData: string, atsRulesJSON: string) => `
You are an expert ATS evaluator.

Resume data: ${extractedData}
ATS rules: ${atsRulesJSON}

Return ONLY this exact JSON structure, no other text:

{
  "overallATSScore": <number 0-10>,
  "suggestions": ["string", "string"],
  "categories": [
    {
      "label": "Layout & Structure",
      "score": <number 0-10>,
      "rules": [
        {
          "rule": "<rule name>",
          "status": "good" | "ok" | "missing",
          "feedback": "<one sentence>"
        }
      ]
    },
    {
      "label": "Visuals & Fonts",
      "score": <number 0-10>,
      "rules": [
        {
          "rule": "<rule name>",
          "status": "good" | "ok" | "missing",
          "feedback": "<one sentence>"
        }
      ]
    },
    {
      "label": "Content & Keywords",
      "score": <number 0-10>,
      "rules": [
        {
          "rule": "<rule name>",
          "status": "good" | "ok" | "missing",
          "feedback": "<one sentence>"
        }
      ]
    },
    {
      "label": "Technical Specifics",
      "score": <number 0-10>,
      "rules": [
        {
          "rule": "<rule name>",
          "status": "good" | "ok" | "missing",
          "feedback": "<one sentence>"
        }
      ]
    }
  ]
}

suggestions must be a plain array of strings. Only output JSON.
`;