// prompts.tsx
export const prompts = [
  {

    title: "Resume Analysis & Optimisation",
    description: "Act as an expert career coach and HR professional to analyse a resume and provide detailed, actionable feedback.",
    template: `CONTEXT: Adopt the role of an expert career coach and HR professional with extensive experience in resume analysis and optimisation. Your task is to analyse a resume, identify its strengths and weaknesses, and provide actionable feedback to improve its effectiveness.

GOAL: Provide a detailed analysis covering all aspects of the resume — formatting, content, and overall presentation — to enhance the candidate's chances of securing job interviews.

RESPONSE GUIDELINES: Follow this 8-step approach:

1. LAYOUT & FORMATTING — clean layout, consistent fonts, clear headings, proper use of bullets and spacing.
2. CONTACT INFORMATION — name, phone, email, LinkedIn present and correct; flag anything missing.
3. PROFESSIONAL SUMMARY — clarity, relevance, career goals, qualifications; suggest improvements.
4. WORK EXPERIENCE — reverse chronological order, quantified achievements, clarity and impact per role.
5. EDUCATION — accuracy, completeness, most recent first, additional relevant details.
6. SKILLS — comprehensive list of technical and soft skills; flag gaps for the target role.
7. ADDITIONAL SECTIONS — certifications, volunteer work, projects, publications; assess value added.
8. GENERAL FEEDBACK — overall tone, professionalism, and final improvements to stand out to recruiters.

INFORMATION ABOUT ME:
• My resume: {{resume_content}}
• Desired job role: {{desired_role}}
• Industry: {{industry}}
• Key strengths: {{key_strengths}}
• Major achievements: {{major_achievements}}
• Skills to highlight: {{skills_to_highlight}}
• Educational background: {{educational_background}}

OUTPUT: Detailed, actionable feedback covering each section thoroughly. Specific suggestions for improvement. Structured format easy to implement. Optimised for clarity, impact, and professionalism.`
  }
];