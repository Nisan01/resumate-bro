"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardPageShell,
  DashboardPanel,
  MetricCard,
  StatusBadge,
} from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ListChecks, Sparkles, Upload } from "lucide-react";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parsePracticeQuestionItems(value: unknown): PracticeQuestionItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      if (
        typeof item.id !== "string" ||
        typeof item.question !== "string" ||
        typeof item.answer !== "string" ||
        typeof item.focusArea !== "string"
      ) {
        return null;
      }

      return {
        id: item.id,
        question: item.question,
        answer: item.answer,
        focusArea: item.focusArea,
      };
    })
    .filter((item): item is PracticeQuestionItem => Boolean(item));
}

function isResumeProfileShape(value: unknown): value is ResumeProfile {
  if (!isRecord(value)) return false;

  return (
    typeof value.sourceFileName === "string" &&
    typeof value.summary === "string" &&
    typeof value.targetRole === "string" &&
    Array.isArray(value.topSkills) &&
    Array.isArray(value.focusAreas) &&
    Array.isArray(value.projectHighlights) &&
    Array.isArray(value.experienceHighlights) &&
    typeof value.resumeScore === "number" &&
    typeof value.jobReadiness === "string" &&
    typeof value.lastAnalyzedAt === "string"
  );
}

const glassItemCardClass =
  "rounded-2xl border border-white/24 bg-gradient-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-5 sm:p-6 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

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

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(LOCAL_RESUME_PROFILE_KEY);
  } catch {
    return null;
  }

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

function persistLocalResumeProfile(profile: ResumeProfile): void {
  try {
    window.localStorage.setItem(LOCAL_RESUME_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage write failures.
  }
}

function formatDifficultyLabel(level: InterviewDifficulty | null): string {
  if (level === "beginner") return "Beginner";
  if (level === "intermediate") return "Intermediate";
  if (level === "advanced") return "Advanced";
  return "Not selected";
}

function validateResumeFile(file: File): string | null {
  const fileName = file.name.toLowerCase();
  const isPdf = file.type === "application/pdf" || fileName.endsWith(".pdf");

  if (!isPdf) {
    return "Please upload a PDF file only.";
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    return "Resume size must be 5MB or less.";
  }

  return null;
}

export function PracticeQuestionsView() {
  const router = useRouter();
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [started, setStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestionItem[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState("");
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState("");

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

        if (isResumeProfileShape(data?.resumeProfile)) {
          setResumeProfile(data.resumeProfile);
          persistLocalResumeProfile(data.resumeProfile);
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

  const resetInterviewState = () => {
    setStarted(false);
    setSelectedDifficulty(null);
    setQuestions([]);
    setNextOffset(0);
    setErrorMessage("");
  };

  const uploadResumeForPractice = async (file: File) => {
    const validationError = validateResumeFile(file);
    if (validationError) {
      setResumeUploadError(validationError);
      setResumeUploadSuccess("");
      return;
    }

    setUploadingResume(true);
    setResumeUploadError("");
    setResumeUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/dashboard/resume-analyzer/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; resumeProfile?: ResumeProfile };

      if (!response.ok) {
        throw new Error(data.error || "Unable to upload resume right now.");
      }

      if (!isResumeProfileShape(data.resumeProfile)) {
        throw new Error("Resume analysis completed but returned an invalid profile.");
      }

      setResumeProfile(data.resumeProfile);
      persistLocalResumeProfile(data.resumeProfile);
      resetInterviewState();
      setResumeUploadSuccess(`Resume "${file.name}" is now linked to practice questions.`);
    } catch (error) {
      setResumeUploadError(error instanceof Error ? error.message : "Unable to upload resume right now.");
      setResumeUploadSuccess("");
    } finally {
      setUploadingResume(false);
      if (resumeFileInputRef.current) {
        resumeFileInputRef.current.value = "";
      }
    }
  };

  const handleResumeFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    void uploadResumeForPractice(file);
  };

  const handleResumeUploadClick = () => {
    setResumeUploadError("");
    setResumeUploadSuccess("");
    resumeFileInputRef.current?.click();
  };

  const requestQuestions = async (difficulty: InterviewDifficulty, append: boolean) => {
    const activeProfile = resumeProfile;
    if (!activeProfile) {
      setErrorMessage("Upload your resume here first, then start the interview.");
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

      const items = parsePracticeQuestionItems(data.questions);
      setQuestions((previous) => (append ? [...previous, ...items] : items));
      setNextOffset(typeof data.nextOffset === "number" ? data.nextOffset : (append ? nextOffset : items.length));

      if (isResumeProfileShape(data.resumeProfile)) {
        setResumeProfile(data.resumeProfile);
        persistLocalResumeProfile(data.resumeProfile);
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
      <input
        ref={resumeFileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleResumeFileChange}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card className="group relative overflow-hidden rounded-2xl border border-cyan-300/30 bg-linear-to-br from-cyan-400/44 via-teal-500/24 to-slate-950/80 text-slate-50 backdrop-blur-xl shadow-[0_16px_34px_rgba(8,15,30,0.38)] ring-1 ring-white/8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(8,15,30,0.52)]">
          <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/26 blur-2xl" />
          <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/65 to-transparent opacity-70" />

          <CardContent className="relative p-6 sm:p-7">
            <div className="mb-4 flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-100">Resume Context</p>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/45 bg-slate-950/40 text-cyan-100">
                <Upload className="h-4 w-4" />
              </div>
            </div>

            <p className="text-3xl font-semibold tracking-tight text-white">
              {uploadingResume ? "Analyzing..." : resumeProfile ? "Resume Linked" : "Upload PDF"}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="inline-flex rounded-full border border-cyan-200/55 bg-slate-950/44 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                PDF up to 5MB
              </span>
              <Button
                type="button"
                variant="outline"
                className="border-white/35 bg-slate-900/72 text-slate-100 hover:bg-slate-800/78 hover:text-white"
                onClick={handleResumeUploadClick}
                disabled={uploadingResume}
              >
                {uploadingResume ? "Uploading..." : resumeProfile ? "Replace" : "Upload"}
              </Button>
            </div>

            <p className="mt-3 text-xs text-slate-200/90">
              {resumeProfile
                ? `Using ${resumeProfile.sourceFileName} for question context.`
                : "No resume linked yet. Upload your PDF to enable personalized questions."}
            </p>

            {resumeProfile ? (
              <p className="mt-1 text-xs text-slate-300">Last analyzed: {resumeProfile.lastAnalyzedAt}</p>
            ) : null}
          </CardContent>
        </Card>

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
      </section>

      <section className="grid gap-5">
        <DashboardPanel
          title="Interview Session"
          description="Start the session, choose your level, and practice tailored questions with model answers."
        >
          {!resumeProfile ? (
            <div className={glassItemCardClass}>
              <p className="text-sm text-slate-200">
                No resume context found. Upload your resume here and we will use it immediately for interview questions.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="bg-white text-slate-900 hover:bg-slate-200"
                  onClick={handleResumeUploadClick}
                  disabled={uploadingResume}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingResume ? "Analyzing Resume..." : "Upload Resume PDF"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="border-white/35 bg-slate-900/72 text-slate-100 hover:bg-slate-800/78 hover:text-white"
                  onClick={() => router.push("/dashboard/resume-analyzer")}
                >
                  Open Full Analyzer
                </Button>
              </div>

              {resumeUploadError ? (
                <p className="mt-3 text-sm text-rose-200" role="alert">
                  {resumeUploadError}
                </p>
              ) : null}

              {resumeUploadSuccess ? (
                <p className="mt-3 text-sm text-emerald-200">{resumeUploadSuccess}</p>
              ) : null}
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

      </section>
    </DashboardPageShell>
  );
}
