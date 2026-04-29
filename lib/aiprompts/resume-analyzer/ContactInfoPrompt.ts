export const analyzeContactInfoPrompt = (resumeText: string) => `
You are an expert resume analyst. Analyze this resume:

${resumeText}

Return ONLY this exact JSON structure, no other text:

{
  "overall_score": <number 0-10>,
  "suggestions": ["string", "string"],
  "contact_fields": [
    {
      "label": "Full Name",
      "value": "<extracted or empty string>",
      "status": "good" | "ok" | "missing",
      "feedback": "<one sentence>",
      "score": <number 0-10>
    },
    {
      "label": "Phone Number",
      "value": "<extracted or empty string>",
      "status": "good" | "ok" | "missing",
      "feedback": "<one sentence>",
      "score": <number 0-10>
    },
    {
      "label": "Email Address",
      "value": "<extracted or empty string>",
      "status": "good" | "ok" | "missing",
      "feedback": "<one sentence>",
      "score": <number 0-10>
    },
    {
      "label": "LinkedIn Profile",
      "value": "<extracted or empty string>",
      "status": "good" | "ok" | "missing",
      "feedback": "<one sentence>",
      "score": <number 0-10>
    },
    {
      "label": "GitHub / Portfolio",
      "value": "<extracted or empty string>",
      "status": "good" | "ok" | "missing",
      "feedback": "<one sentence>",
      "score": <number 0-10>
    },
    {
      "label": "Location",
      "value": "<extracted or empty string>",
      "status": "good" | "ok" | "missing",
      "feedback": "<one sentence>",
      "score": <number 0-10>
    }
  ]
}

suggestions must be a plain array of strings. Only output JSON.
`;