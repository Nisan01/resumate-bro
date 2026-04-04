export type InterviewDifficulty = "beginner" | "intermediate" | "advanced";

export type ResumeJobReadiness =
  | "beginner"
  | "developing"
  | "intermediate"
  | "advanced"
  | "job_ready";

export interface ResumeProfile {
  sourceFileName: string;
  summary: string;
  targetRole: string;
  topSkills: string[];
  focusAreas: string[];
  projectHighlights: string[];
  experienceHighlights: string[];
  resumeScore: number;
  jobReadiness: ResumeJobReadiness;
  lastAnalyzedAt: string;
}

export const LOCAL_RESUME_PROFILE_KEY = "resumate:latestResumeProfile";
