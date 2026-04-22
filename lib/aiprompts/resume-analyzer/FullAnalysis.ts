

export const analyzeProfilePrompt = (resumeText: string, targetRole: string) => `
You are an expert resume analyzer.

Resume:
${resumeText}

Target role: ${targetRole}

Return ONLY valid JSON — no markdown, no explanation:

{
  "header": {
    "name": "<full name>",
    "currentRole": "<current job title or empty string>",
    "targetRole": "<target role>"
  },
  "contactInfo": {
    "overall_score": <0-10>,
    "suggestions": ["string","string","string"],
    "contact_fields": [
      { "label": "Full Name",        "value": "<extracted or empty>", "status": "good"|"ok"|"missing", "feedback": "<one sentence>", "score": <0-10> },
      { "label": "Phone Number",     "value": "<extracted or empty>", "status": "good"|"ok"|"missing", "feedback": "<one sentence>", "score": <0-10> },
      { "label": "Email Address",    "value": "<extracted or empty>", "status": "good"|"ok"|"missing", "feedback": "<one sentence>", "score": <0-10> },
      { "label": "LinkedIn Profile", "value": "<extracted or empty>", "status": "good"|"ok"|"missing", "feedback": "<one sentence>", "score": <0-10> },
      { "label": "GitHub / Portfolio","value": "<extracted or empty>","status": "good"|"ok"|"missing", "feedback": "<one sentence>", "score": <0-10> },
      { "label": "Location",         "value": "<extracted or empty>", "status": "good"|"ok"|"missing", "feedback": "<one sentence>", "score": <0-10> }
    ]
  },
  "summary": {
    "summary": "<extracted summary or empty string>",
    "status": "good"|"ok"|"needs improvement",
    "score": <0-10>,
    "overall_score": <0-10>,
    "feedback": "<one sentence of actionable advice>",
    "improved": "<fully rewritten improved version>",
    "suggestions": [
      "Provide a concise 2–3 sentence overview of experience and impact.",
      "Include at least one measurable achievement with a specific metric.",
      "Highlight the top 2–3 skills most relevant to the target role.",
      "Open with a strong action verb or role-defining statement.",
      "Ensure keywords align with ATS requirements for the target role."
    ]
  },
  "skills": {
    "overall_score": <0-10>,
    "suggestions": ["string","string","string","string"],
    "skills": [
      {
        "name": "<skill name>",
        "level": "Expert"|"Advanced"|"Proficient"|"Familiar"|"",
        "score": <0-10>,
        "status": "good"|"ok"|"missing",
        "note": "<one sentence — specific feedback on this skill's presentation or relevance to target role>"
      }
    ]
  }
}
`;

// pulled from WorkExperiencePrompt.ts + CertificationProjectPrompt.ts
export const analyzeDeepPrompt = (resumeText: string, targetRole: string) => `
You are an expert resume analyst and senior technical recruiter.

Resume:
${resumeText}

Target role: ${targetRole}

Instructions:
- Extract ALL roles from the resume — do not skip any position.
- For each bullet point, evaluate whether it is quantified, uses action verbs, and shows impact.
- For certifications and projects, extract everything listed — courses, bootcamps, side projects, open source.
- Suggestions must be highly specific to this resume — reference actual companies, tools, or role titles found in the text.
- Each suggestion should be a complete, actionable sentence (not a generic tip).

Return ONLY valid JSON — no markdown, no explanation:

{
  "workExperience": {
    "overall_score": <0-10>,
    "suggestions": [
      "<specific suggestion referencing actual content from this resume>",
      "<specific suggestion referencing actual content from this resume>",
      "<specific suggestion referencing actual content from this resume>",
      "<specific suggestion referencing actual content from this resume>",
      "<specific suggestion referencing actual content from this resume>"
    ],
    "work_experience": [
      {
        "company": "<company name>",
        "title": "<job title>",
        "period": "<e.g. Jan 2022 – Present>",
        "score": <0-10>,
        "status": "good"|"ok"|"missing",
        "feedback": "<one sentence of specific, actionable advice for this role>",
        "bullets": [
          {
            "text": "<exact bullet point text from resume>",
            "status": "good"|"ok"|"missing"
          }
        ]
      }
    ]
  },
  "certifications": {
    "overall_score": <0-10>,
    "suggestions": [
      "<specific suggestion referencing actual content from this resume>",
      "<specific suggestion referencing actual content from this resume>",
      "<specific suggestion referencing actual content from this resume>",
      "<specific suggestion referencing actual content from this resume>",
      "<specific suggestion referencing actual content from this resume>"
    ],
    "certifications": [
      {
        "name": "<certification or course name>",
        "description": "<what was learned or covered>",
        "impact": "<outcome, relevance to target role, or skill gained>",
        "date": "<completion date or empty string>"
      }
    ],
    "projects": [
      {
        "name": "<project name>",
        "type": "project"|"education",
        "description": "<what was built or studied>",
        "impact": "<outcome, metrics, or technologies used>",
        "date": "<completion date or empty string>"
      }
    ]
  }
}
`;

// pulled from ATSEvaluation.ts + RecruitersEye.ts
export const analyzeRecruiterPrompt = (
  resumeText: string,
  targetRole: string,
  atsRulesJSON: string
) => `
You are a senior technical recruiter and ATS compliance expert at a Tier-1 tech company.

Resume:
${resumeText}

Target role: ${targetRole}

ATS Rules:
${atsRulesJSON}

Instructions:
- Apply every ATS rule from the provided rules JSON. Reference specific rules by name in your feedback.
- For recruiter signals, reference specific details from the resume (company names, titles, metrics).
- Red flags must be concrete issues found in this resume — not generic warnings.
- anchorKeywords should be the most impactful keywords missing or underused in this resume for the target role.
- narrativeGap should describe the specific story this resume fails to tell.
- Suggestions must be highly specific and actionable — not generic advice.

Return ONLY valid JSON — no markdown, no explanation:

{
  "atsEvaluation": {
    "overallATSScore": <0-10>,
    "suggestions": [
      "<specific ATS improvement referencing actual resume content>",
      "<specific ATS improvement referencing actual resume content>",
      "<specific ATS improvement referencing actual resume content>",
      "<specific ATS improvement referencing actual resume content>",
      "<specific ATS improvement referencing actual resume content>"
    ],
    "categories": [
      {
        "label": "Layout & Structure",
        "score": <0-10>,
        "rules": [
          { "rule": "<rule name from ATS rules>", "status": "good"|"ok"|"missing", "feedback": "<one sentence specific to this resume>" }
        ]
      },
      {
        "label": "Visuals & Fonts",
        "score": <0-10>,
        "rules": [
          { "rule": "<rule name from ATS rules>", "status": "good"|"ok"|"missing", "feedback": "<one sentence specific to this resume>" }
        ]
      },
      {
        "label": "Content & Keywords",
        "score": <0-10>,
        "rules": [
          { "rule": "<rule name from ATS rules>", "status": "good"|"ok"|"missing", "feedback": "<one sentence specific to this resume>" }
        ]
      },
      {
        "label": "Technical Specifics",
        "score": <0-10>,
        "rules": [
          { "rule": "<rule name from ATS rules>", "status": "good"|"ok"|"missing", "feedback": "<one sentence specific to this resume>" }
        ]
      }
    ]
  },
  "recruiterEye": {
    "recruiterVerdict": {
      "overallSignal": "Strong"|"Average"|"Weak",
      "sixSecondSummary": "<2 sentences describing this specific candidate as a recruiter would in a screening call>",
      "estimatedSeniority": "Junior"|"Mid"|"Senior"|"Staff/Lead"
    },
    "highSignalSignals": [
      {
        "type": "Prestige"|"Impact"|"Velocity"|"Leadership",
        "strength": <0-10>,
        "observation": "<specific detail pulled directly from this resume>",
        "whyItMatters": "<why a recruiter hiring for this target role would care>"
      }
    ],
    "redFlags": [
      {
        "issue": "<concrete issue found in this resume>",
        "severity": "Low"|"Medium"|"High",
        "fix": "<specific, actionable fix for this resume>"
      }
    ],
    "visualOptimization": {
      "anchorKeywords": ["<keyword missing or underused in this resume>", "<keyword>", "<keyword>"],
      "narrativeGap": "<the specific story or arc this resume fails to communicate>"
    }
  }
}
`;