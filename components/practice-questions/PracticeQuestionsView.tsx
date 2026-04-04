"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardPageShell,
  DashboardPanel,
  MetricCard,
  StatusBadge,
} from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import { Brain, CircleHelp, ListChecks, Sparkles } from "lucide-react";
import {
  LOCAL_RESUME_PROFILE_KEY,
  type InterviewDifficulty,
  type ResumeProfile,
} from "@/lib/resume-profile";

interface PracticeQuestionItem {
  id: string;
  question: string;
  answer: string;
  focusArea: string;
}

interface PracticeApiResponse {
  difficulty: InterviewDifficulty;
  source: "gemini" | "fallback";
  questions: PracticeQuestionItem[];
  nextOffset: number;
  resumeProfile: ResumeProfile;
}

const glassItemCardClass =
  "rounded-2xl border border-white/24 bg-gradient-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-5 sm:p-6 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

const difficultyConfig: Array<{ key: InterviewDifficulty; label: string; helper: string }> = [
  {
    key: "beginner",
    label: "Beginner",
    helper: "Foundational interview confidence",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    helper: "Role-ready practical depth",
  },
  {
    key: "advanced",
    label: "Advanced",
    helper: "Complex scenario and trade-offs",
  },
];

function parseStoredResumeProfile(): ResumeProfile | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(LOCAL_RESUME_PROFILE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ResumeProfile;
    if (typeof parsed?.targetRole !== "string" || parsed.targetRole.trim().length === 0) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function formatDifficultyLabel(level: InterviewDifficulty | null): string {
  if (level === "beginner") return "Beginner";
  if (level === "intermediate") return "Intermediate";
  if (level === "advanced") return "Advanced";
  return "Not selected";
}

export function PracticeQuestionsView() {
  const router = useRouter();
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [started, setStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestionItem[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [source, setSource] = useState<"gemini" | "fallback" | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const localProfile = parseStoredResumeProfile();
    if (localProfile && !cancelled) {
      setResumeProfile(localProfile);
    }

    const loadFromApi = async () => {
      try {
        const response = await fetch("/api/dashboard/practice-questions", {
          credentials: "include",
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          hasResumeProfile?: boolean;
          resumeProfile?: ResumeProfile | null;
        };

        if (cancelled) return;

        if (data?.resumeProfile) {
          setResumeProfile(data.resumeProfile);
          window.localStorage.setItem(LOCAL_RESUME_PROFILE_KEY, JSON.stringify(data.resumeProfile));
        }
      } catch {
        // Keep local profile fallback.
      }
    };

    void loadFromApi();

    return () => {
      cancelled = true;
    };
  }, []);

  const canGenerate = useMemo(() => Boolean(resumeProfile && selectedDifficulty), [resumeProfile, selectedDifficulty]);

  const requestQuestions = async (difficulty: InterviewDifficulty, append: boolean) => {
    const activeProfile = resumeProfile;
    if (!activeProfile) {
      setErrorMessage("Please analyze your resume first in Resume Analyzer.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/dashboard/practice-questions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty,
          count: 5,
          offset: append ? nextOffset : 0,
          resumeProfile: activeProfile,
        }),
      });

      const data = (await response.json()) as Partial<PracticeApiResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate practice questions.");
      }

      const items = Array.isArray(data.questions) ? data.questions : [];
      setQuestions((previous) => (append ? [...previous, ...items] : items));
      setNextOffset(typeof data.nextOffset === "number" ? data.nextOffset : (append ? nextOffset : items.length));
      setSource(data.source ?? "fallback");

      if (data.resumeProfile) {
        setResumeProfile(data.resumeProfile);
        window.localStorage.setItem(LOCAL_RESUME_PROFILE_KEY, JSON.stringify(data.resumeProfile));
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to generate practice questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    setStarted(true);
    setErrorMessage("");
  };

  const handleDifficultySelect = (difficulty: InterviewDifficulty) => {
    setSelectedDifficulty(difficulty);
    void requestQuestions(difficulty, false);
  };

  const handleMoreQuestions = () => {
    if (!selectedDifficulty) return;
    void requestQuestions(selectedDifficulty, true);
  };

  return (
    <DashboardPageShell
      eyebrow="Practice Questions"
      title="AI Mock Interview Engine"
      description="Generate tailored interview questions from your latest resume analysis and keep practicing in focused batches of 5."
    >
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Target Role"
          value={resumeProfile?.targetRole ?? "Not available"}
          change={resumeProfile ? "Resume linked" : "Analyze resume first"}
          helperText="Pulled from latest resume analysis"
          tone="teal"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <MetricCard
          label="Current Level"
          value={formatDifficultyLabel(selectedDifficulty)}
          change={selectedDifficulty ? "Question stream active" : "Choose after start"}
          helperText="Controls depth and complexity"
          tone="amber"
          icon={<Brain className="h-4 w-4" />}
        />
        <MetricCard
          label="Questions Generated"
          value={String(questions.length)}
          change={questions.length > 0 ? `Next batch starts at #${nextOffset + 1}` : "No questions yet"}
          helperText="5 questions per generation"
          tone="sky"
          icon={<ListChecks className="h-4 w-4" />}
        />
        <MetricCard
          label="AI Source"
          value={source === "gemini" ? "Gemini" : source === "fallback" ? "Fallback" : "Waiting"}
          change={source === "gemini" ? "Live AI generated" : "Rule-based backup"}
          helperText="Switches automatically on errors"
          tone="rose"
          icon={<CircleHelp className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <DashboardPanel
          className="xl:col-span-2"
          title="Interview Session"
          description="Start the session, choose your level, and practice tailored questions with model answers."
        >
          {!resumeProfile ? (
            <div className={glassItemCardClass}>
              <p className="text-sm text-slate-200">
                No resume context found. Upload and analyze your resume first, then return here.
              </p>
              <Button
                type="button"
                className="mt-4 bg-white text-slate-900 hover:bg-slate-200"
                onClick={() => router.push("/dashboard/resume-analyzer")}
              >
                Go To Resume Analyzer
              </Button>
            </div>
          ) : (
            <>
              {!started ? (
                <div className={glassItemCardClass}>
                  <p className="text-sm text-slate-200">
                    Ready to begin? Click start and pick your interview level.
                  </p>
                  <Button
                    type="button"
                    className="mt-4 bg-white text-slate-900 hover:bg-slate-200"
                    onClick={handleStartInterview}
                  >
                    Start Question Answer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {difficultyConfig.map((level) => (
                      <button
                        key={level.key}
                        type="button"
                        onClick={() => handleDifficultySelect(level.key)}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          selectedDifficulty === level.key
                            ? "border-cyan-200/65 bg-cyan-300/15"
                            : "border-white/24 bg-slate-900/55 hover:border-cyan-200/45 hover:bg-slate-900/75"
                        }`}
                        disabled={loading}
                      >
                        <p className="text-sm font-semibold text-slate-100">{level.label}</p>
                        <p className="mt-1 text-xs text-slate-300">{level.helper}</p>
                      </button>
                    ))}
                  </div>

                  {errorMessage ? (
                    <p className="text-sm text-rose-200" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}

                  <div className="space-y-3">
                    {questions.map((item, index) => (
                      <article key={`${item.id}-${index}`} className={glassItemCardClass}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-100">Question {index + 1}</p>
                          <StatusBadge tone="info">{item.focusArea}</StatusBadge>
                        </div>
                        <p className="mt-3 text-sm text-slate-100">{item.question}</p>
                        <p className="mt-3 rounded-lg border border-emerald-200/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                          Suggested answer: {item.answer}
                        </p>
                      </article>
                    ))}
                  </div>

                  {canGenerate ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/35 bg-slate-900/72 text-slate-100 hover:bg-slate-800/78 hover:text-white"
                      onClick={handleMoreQuestions}
                      disabled={loading}
                    >
                      {loading ? "Generating..." : "More 5 Questions"}
                    </Button>
                  ) : null}
                </div>
              )}
            </>
          )}
        </DashboardPanel>

        <DashboardPanel title="Resume Context" description="Questions are generated from your latest analyzed resume.">
          <div className="space-y-3">
            <div className={glassItemCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Summary</p>
              <p className="mt-2 text-sm text-slate-100">{resumeProfile?.summary ?? "Not available yet"}</p>
            </div>

            <div className={glassItemCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Top Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(resumeProfile?.topSkills ?? []).slice(0, 8).map((skill) => (
                  <StatusBadge key={skill} tone="success">
                    {skill}
                  </StatusBadge>
                ))}
              </div>
            </div>

            <div className={glassItemCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Interview Focus Areas</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-100">
                {(resumeProfile?.focusAreas ?? []).slice(0, 6).map((focus) => (
                  <li key={focus}>{focus}</li>
                ))}
              </ul>
            </div>
          </div>
        </DashboardPanel>
      </section>
    </DashboardPageShell>
  );
}
