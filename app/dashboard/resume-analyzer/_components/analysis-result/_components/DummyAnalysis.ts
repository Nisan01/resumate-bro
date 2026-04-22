

export const dummyAnalysis = {
  header: {
    name: "Alex Carter",
    currentRole: "Senior Software Engineer",
    targetRole: "Staff Engineer @ Stripe",
  },

  contactInfo: {
    overall_score: 2,
    suggestions: [
      "Add a professional email address.",
      "Include your LinkedIn profile URL.",
      "Add GitHub or portfolio link.",
      "Specify your current city and state.",
      "Add a phone number for outreach.",
    ],
    contact_fields: [
      { label: "Full Name",        value: "Alex Carter",                status: "good",    feedback: "Clear and professional.",                                                                 score: 10 },
      { label: "Phone Number",     value: "",                           status: "missing", feedback: "Phone number is missing — add a contact number for professional outreach.",              score: 0  },
      { label: "Email Address",    value: "",                           status: "missing", feedback: "Email address is missing — include a professional email for contact.",                   score: 0  },
      { label: "LinkedIn Profile", value: "",                           status: "missing", feedback: "LinkedIn profile URL is missing — add it to enhance professional networking.",           score: 0  },
      { label: "GitHub/Portfolio", value: "",                           status: "missing", feedback: "GitHub or portfolio link is missing — include links to showcase projects.",              score: 0  },
      { label: "Location",         value: "San Francisco, CA",          status: "good",    feedback: "City + State is the ideal ATS format.",                                                  score: 10 },
    ],
  },

  summary: {
    summary: "Results-driven software engineer with 5+ years of experience building scalable web applications. Passionate about clean architecture and developer experience.",
    status: "needs improvement",
    score: 6,
    overall_score: 6,
    feedback: "Refocus the summary to lead with software engineering achievements. Mention 'React', 'TypeScript', 'Python', and 'AI' within the first two sentences.",
    suggestions: [
      "Add specific metrics: 'scaled systems to 10M users', 'reduced latency by 40%'.",
      "Mirror JD keywords: 'distributed systems', 'cross-functional leadership', 'microservices'.",
      "Replace 'passionate about' with a concrete achievement — it is vague filler.",
      "Mention your target scope explicitly: 'Staff-level ownership' or 'tech lead experience'.",
      "Keep it to 3–4 sentences max. Recruiters skim — make every word count.",
    ],
    improved: "Staff-level software engineer with 5+ years designing and scaling distributed web systems serving 10M+ users. Led cross-functional teams at Stripe to reduce API latency by 40% and improve developer onboarding by 3×.",
  },

  workExperience: {
    overall_score: 4.5,
    suggestions: [
      "Quantify all bullet points — aim for 80%+ with numbers.",
      "Add missing keywords from the JD: 'Kubernetes', 'CI/CD', 'system design'.",
      "Move leadership bullets to the top of each role.",
    ],
    work_experience: [
      {
        company: "Stripe",
        title: "Senior Software Engineer",
        period: "Jan 2022 – Present",
        score: 9,
        status: "good",
        bullets: [
          { text: "Reduced payment API p99 latency by 42% through connection pooling and query optimization.", status: "good" },
          { text: "Led a team of 6 engineers to rebuild merchant onboarding flow, reducing drop-off by 31%.",  status: "good" },
          { text: "Architected event-driven microservices handling 2M+ transactions/day.",                     status: "good" },
          { text: "Collaborated with product and design on roadmap prioritization.",                           status: "ok"   },
        ],
        feedback: "Excellent quantified impact. Bullet 4 is weak — add a metric or outcome, or remove it.",
      },
      {
        company: "Vercel",
        title: "Software Engineer",
        period: "Mar 2020 – Dec 2021",
        score: 7,
        status: "ok",
        bullets: [
          { text: "Improved build times for Edge Functions deployment pipeline.",             status: "ok"   },
          { text: "Built internal CLI tool adopted by the platform team.",                   status: "ok"   },
          { text: "Fixed critical SSR hydration bugs affecting 15% of Next.js deployments.", status: "good" },
        ],
        feedback: "'Improved build times' — by how much? Add: 'by 55%, from 4.2s to 1.9s'. Quantify CLI adoption numbers.",
      },
      {
        company: "Freelance",
        title: "Full-Stack Developer",
        period: "Jun 2018 – Feb 2020",
        score: 5,
        status: "ok",
        bullets: [
          { text: "Built web applications for clients across e-commerce and SaaS.", status: "ok" },
          { text: "Worked with React, Node.js, PostgreSQL.",                         status: "ok" },
        ],
        feedback: "Too vague. Name clients if possible, add revenue/scale metrics, and specify the full tech stack per project.",
      },
    ],
  },

  skills: {
    overall_score: 7,
    suggestions: [
      "Add 'Kubernetes' — present in the JD but absent from your resume.",
      "Add 'CI/CD / GitHub Actions' — expected for senior roles.",
      "Add 'System Design' to summary or a notable bullet.",
      "Underrepresent Node.js — show it in context with a specific bullet.",
      "Add a specific query optimization example for PostgreSQL.",
      "Remove skill progress bars — ATS can't parse graphical elements.",
      "List skills as 'Expert', 'Proficient', 'Familiar' instead of bars.",
      "Add 'Mentorship' — key signal for Staff-level promotion cases.",
    ],
    category_assessments: {
      technical: 7.2,
      soft: 4.8,
      missing: 3,
    },
    skills: [
      { name: "React / Next.js",            level: "Expert",   score: 10, status: "good",    note: "Reflected strongly across all roles — excellent."                             },
      { name: "TypeScript",                 level: "Expert",   score: 9,  status: "good",    note: "Present in work bullets and skills section — great."                         },
      { name: "Node.js",                    level: "Advanced", score: 7,  status: "ok",      note: "Listed but underrepresented in bullets. Show it in context."                 },
      { name: "PostgreSQL",                 level: "Advanced", score: 7,  status: "ok",      note: "Mentioned once. Add a specific query optimization example."                  },
      { name: "Kubernetes",                 level: "",         score: 2,  status: "missing", note: "In the JD but absent from your resume. Add if you have experience."          },
      { name: "CI/CD / GitHub Actions",     level: "",         score: 3,  status: "missing", note: "Expected for senior roles — add Docker and GitHub Actions."                  },
      { name: "System Design",              level: "",         score: 2,  status: "missing", note: "Critical for Staff-level. Add to summary or a notable bullet."               },
      { name: "Cross-functional Leadership",level: "Advanced", score: 8,  status: "good",    note: "Demonstrated at Stripe — well evidenced."                                   },
      { name: "Communication",              level: "",         score: 5,  status: "ok",      note: "Implied but not explicit. Add a concrete cross-team collaboration example."  },
      { name: "Mentorship",                 level: "",         score: 2,  status: "missing", note: "Not mentioned. Mention any mentoring done — key signal for Staff-level."     },
    ],
  },

  certifications: {
    overall_score: 3.8,
    suggestions: [
      "Add AWS or GCP certification — Stripe values cloud infrastructure expertise.",
      "Link GitHub repos directly to projects listed.",
      "Add impact metrics to each project (stars, users, revenue).",
      "Move most recent and relevant certifications to the top.",
      "Consider adding a Kubernetes certification — directly matches the JD.",
      "Add dates to all certifications for ATS parsing.",
    ],
    certifications: [],
    projects: [
      { name: "depcheck-pro (Open Source)", type: "project",       date: "Aug 2023", description: "Node.js CLI for auditing outdated dependencies across monorepos.",                                                        impact: "1,200+ GitHub stars · adopted by 3 enterprise engineering teams." },
      { name: "Streamflow",                 type: "project",       date: "Jan 2023", description: "High-throughput stream processing engine built on top of Kafka with exactly-once semantics and sub-10ms p99 latency.",    impact: "Demonstrates scale relevant to Stripe's infrastructure."          },
      { name: "Portfolio Website",          type: "project",       date: "Mar 2022", description: "Personal portfolio showcasing projects and writing.",                                                                       impact: "Low signal for Staff-level — consider replacing with a stronger project." },
      { name: "Raftlock",                   type: "project",       date: "Nov 2021", description: "Open-source distributed lock service implementing Raft consensus. 340 GitHub stars, used in production by 3 companies.", impact: "Directly demonstrates consensus protocol expertise."               },
      { name: "B.S. Computer Science",      type: "education",     date: "May 2018", description: "UC Berkeley. Specialization in Systems & Distributed Computing. GPA 3.8.",                                               impact: "Prestigious school + systems focus is a strong signal."            },
    ],
  },

  atsEvaluation: {
    overallATSScore: 8,
    suggestions: [
      "Remove skill progress bars — ATS systems cannot parse graphical elements.",
      "Rename resume file to 'Alex-Carter-Staff-Engineer.pdf'.",
      "Convert any tables in the skills section to plain text bullets.",
      "Write 'Continuous Integration (CI)' at least once so both forms match.",
      "Quantify at least 80% of bullets — currently at 33%.",
    ],
    categories: [
      {
        label: "Layout & Structure",
        score: 8,
        rules: [
          { id: 1, rule: "Single-Column Layout",        status: "good",    feedback: "Clean single-column structure — ATS-safe."                            },
          { id: 2, rule: "Reverse-Chronological Order", status: "good",    feedback: "Experience ordered correctly."                                         },
          { id: 3, rule: "No Tables / Text Boxes",      status: "ok",      feedback: "One section uses a table. Convert to plain text bullets."             },
          { id: 4, rule: "Standard Section Headings",   status: "good",    feedback: "All headings are recognizable by ATS parsers."                        },
        ],
      },
      {
        label: "Visuals & Fonts",
        score: 7,
        rules: [
          { id: 5, rule: "Web-Safe Fonts",         status: "good",    feedback: "Font renders cleanly across all systems."                                                        },
          { id: 6, rule: "No Images / Graphics",   status: "good",    feedback: "No images detected — ATS-clean."                                                                 },
          { id: 7, rule: "No Skill Progress Bars", status: "missing", feedback: "Skill bars detected. ATS can't read graphics — replace with 'Expert', 'Proficient', etc."       },
        ],
      },
      {
        label: "Content & Keywords",
        score: 6,
        rules: [
          { id: 8,  rule: "Mirror Job Description Keywords", status: "ok",   feedback: "Partial match (~60%). Missing: 'distributed systems', 'microservices', 'Kubernetes'."  },
          { id: 9,  rule: "Acronyms + Long-form",            status: "ok",   feedback: "Write 'Continuous Integration (CI)' at least once so both forms match."               },
          { id: 10, rule: "Quantify Achievements",           status: "ok",   feedback: "2 of 6 bullets have numbers. Aim for 80%+ — currently at 33%."                        },
          { id: 11, rule: "Action Verbs",                    status: "good", feedback: "Strong verbs throughout — Led, Reduced, Architected."                                  },
          { id: 12, rule: "Dedicated Skills Section",        status: "good", feedback: "Skills section is present and well-placed near the top."                               },
        ],
      },
      {
        label: "Technical Specifics",
        score: 7,
        rules: [
          { id: 13, rule: "Consistent Date Formatting", status: "good",    feedback: "MM/YYYY used consistently — perfect."                                                                   },
          { id: 14, rule: "Appropriate File Format",    status: "good",    feedback: "PDF submitted — correct."                                                                                },
          { id: 15, rule: "Professional File Naming",   status: "missing", feedback: "File is 'resume_v3_final.pdf'. Rename to 'Alex-Carter-Staff-Engineer.pdf'."                             },
          { id: 16, rule: "Notepad Test",               status: "ok",      feedback: "Minor scrambling in skills area. Review plain-text output before submitting."                           },
        ],
      },
    ],
  },

  recruiterEye: {
    recruiterVerdict: {
      overallSignal: "Average",
      sixSecondSummary: "Solid mid-level engineer with decent Stripe-adjacent experience, but the resume reads like a task list rather than a story of impact. Missing the leadership and scale signals needed to justify a Staff-level conversation.",
      estimatedSeniority: "Senior",
    },
    highSignalSignals: [
      {
        type: "Impact",
        strength: 8,
        observation: "Reduced payment API p99 latency by 42% through connection pooling and query optimization.",
        whyItMatters: "Recruiters at infra-heavy companies like Stripe pattern-match on latency numbers instantly — it signals you understand systems at depth, not just feature delivery.",
      },
      {
        type: "Prestige",
        strength: 7,
        observation: "Current tenure at Stripe with prior experience at Vercel — both are Tier-1 signals in the infra/platform space.",
        whyItMatters: "Company pedigree acts as a trust proxy. A recruiter scanning in 6 seconds will mentally pre-approve a Stripe → Staff promotion path faster than an unknown employer.",
      },
      {
        type: "Velocity",
        strength: 6,
        observation: "Progressed from Full-Stack Freelance → Vercel SWE → Stripe Senior SWE in under 5 years.",
        whyItMatters: "Upward trajectory in recognizable companies suggests coachability and performance — two things hiring managers care about more than raw years of experience.",
      },
      {
        type: "Leadership",
        strength: 5,
        observation: "Led a team of 6 engineers to rebuild merchant onboarding flow, reducing drop-off by 31%.",
        whyItMatters: "For Staff-level, recruiters look for 'did they lead people, not just code?' — this bullet answers yes, but it's buried. It should be the first bullet in the role.",
      },
    ],
    redFlags: [
      {
        issue: "No mention of mentorship or growing junior engineers",
        severity: "High",
        fix: "Add one bullet per role showing mentorship: 'Mentored 3 junior engineers, 2 of whom were promoted within 12 months.' Staff-level without mentorship evidence is a yellow card.",
      },
      {
        issue: "Freelance section is vague and hurts trajectory narrative",
        severity: "Medium",
        fix: "Either quantify it ('Delivered 4 production SaaS apps for clients across fintech and e-commerce, generating $2M+ in client revenue') or remove it entirely if the timeline allows.",
      },
      {
        issue: "No GitHub, portfolio, or open-source link",
        severity: "High",
        fix: "Engineers applying to Stripe without a visible code footprint are auto-deprioritized. Add GitHub with at least one pinned repo showing systems thinking.",
      },
      {
        issue: "Summary reads as generic filler with no Staff-level ambition",
        severity: "Medium",
        fix: "Rewrite the first sentence to claim Staff scope explicitly: 'I architect and own distributed systems at Stripe serving 200M+ transactions monthly.' Make the reader feel the scale immediately.",
      },
    ],
    visualOptimization: {
      anchorKeywords: ["42% latency reduction", "6-engineer team", "2M+ transactions/day", "merchant onboarding", "microservices"],
      narrativeGap: "The resume shows what Alex built but never explains why decisions were made or what trade-offs were navigated. Stripe's hiring bar for Staff engineers is 'can this person own a system end-to-end with ambiguity?' — that story is completely absent. Add one sentence per role that starts with 'I chose X over Y because...' to signal engineering judgment.",
    },
  },
};