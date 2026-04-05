export const analyzeJobSpecificATSPrompt = (
  extractedData: string,    // JSON from AI resume analysis
  atsRulesJSON: string,     // Your ATS rules JSON
  jobDescription: string    // Text of the target job posting
) => `
You are an expert ATS evaluator. I will provide:

1. Candidate's resume data extracted by AI (contact info, summary, work experience, skills):
${extractedData}

2. ATS rules and best practices:
${atsRulesJSON}

3. Target job description:
${jobDescription}

Your task:

- Evaluate the candidate's resume for **ATS compliance** and **job fit**.
- For each section (Contact Info, Summary, Work Experience, Skills):
   - Check compliance with ATS rules
   - Identify missing keywords or skills specifically requested in the job description
   - Check if achievements are quantified and metrics are included
   - Score each section 0-10
   - Provide **actionable feedback** for improvement

- Provide a "suggestions" array for critical improvements:
   - "key": The specific section or missing keyword
   - "value": The current gap or compliance issue
   - "required": The specific information, keyword, or metric required to align with the job description

- Compute an **overall ATS + Job Fit score (0-10)** combining all sections

Output **JSON only** in this format:

{
  "overallScore": number,
  "sections": [
    {
      "section": "string",
      "score": number,
      "issues": [
        {
          "ruleId": number,
          "rule": "string",
          "status": "good" | "ok" | "missing",
          "score": number,
          "feedback": "string"
        }
      ]
    }
  ],
  "suggestions": [
    {
      "key": "string",
      "value": "string",
      "required": "string"
    }
  ]
}

Only output valid JSON. Do not include any explanations or text outside the JSON.
`;