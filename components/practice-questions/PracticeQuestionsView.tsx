"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardPageShell,
  StatusBadge,
} from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import {
  Brain,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  Play,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from "lucide-react";
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
  "rounded-2xl border border-white/24 bg-linear-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-5 sm:p-6 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

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

const settingsPanelClass =
  "rounded-2xl border border-white/10 bg-linear-to-br from-slate-950/72 via-slate-900/56 to-slate-800/45 p-6 sm:p-7 shadow-[0_20px_42px_rgba(2,8,24,0.38)] backdrop-blur-xl";

type SectionKey = "resume" | "session" | "questions";

const sectionItems: Array<{
  key: SectionKey;
  label: string;
  helper: string;
  icon: ReactNode;
}> = [
  {
    key: "resume",
    label: "Resume Context",
    helper: "Upload and linked profile",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    key: "session",
    label: "Interview Session",
    helper: "Start and difficulty",
    icon: <SlidersHorizontal className="h-4 w-4" />,
  },
  {
    key: "questions",
    label: "Questions",
    helper: "Generated Q&A stream",
    icon: <ListChecks className="h-4 w-4" />,
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

function formatAnalyzedAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function PracticeQuestionsView() {
  const router = useRouter();
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);
  const resumeSectionRef = useRef<HTMLElement | null>(null);
  const sessionSectionRef = useRef<HTMLElement | null>(null);
  const questionsSectionRef = useRef<HTMLElement | null>(null);
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("resume");
  const [started, setStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);
  const [questions, setQuestions] = useState<PracticeQuestionItem[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState("");
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState("");

  useEffect(() => {
    const sectionMap: Record<SectionKey, HTMLElement | null> = {
      resume: resumeSectionRef.current,
      session: sessionSectionRef.current,
      questions: questionsSectionRef.current,
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        if (!top) return;

        const key = top.target.getAttribute("data-section") as SectionKey | null;
        if (key && sectionMap[key]) {
          setActiveSection(key);
        }
      },
      {
        threshold: [0.2, 0.4, 0.65],
        rootMargin: "-18% 0px -52% 0px",
      },
    );

    const sections = Object.values(sectionMap).filter((value): value is HTMLElement => Boolean(value));
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

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
  const selectedDifficultyLabel = formatDifficultyLabel(selectedDifficulty);

  const scrollToSection = (section: SectionKey) => {
    setActiveSection(section);

    const sectionMap: Record<SectionKey, React.RefObject<HTMLElement | null>> = {
      resume: resumeSectionRef,
      session: sessionSectionRef,
      questions: questionsSectionRef,
    };

    sectionMap[section].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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
    setActiveSection("session");
  };

  const handleDifficultySelect = (difficulty: InterviewDifficulty) => {
    setSelectedDifficulty(difficulty);
    void requestQuestions(difficulty, false);
    setActiveSection("questions");
  };

  const handleMoreQuestions = () => {
    if (!selectedDifficulty) return;
    void requestQuestions(selectedDifficulty, true);
  };

  const handleSessionReset = () => {
    resetInterviewState();
    setShowAnswers(true);
  };

  return (
    <DashboardPageShell
      eyebrow="Practice Questions"
      title="AI Mock Interview Engine"
      description="Settings-style workflow for resume-linked interview practice with controlled session flow and generated answer review."
    >
      <input
        ref={resumeFileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleResumeFileChange}
      />

      <section className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          className="rounded-2xl border border-white/10 bg-linear-to-br from-slate-950/78 via-slate-900/62 to-slate-800/42 p-2.5 shadow-[0_16px_34px_rgba(2,8,24,0.35)] backdrop-blur-xl xl:sticky xl:top-20 xl:h-fit"
          aria-label="Practice question navigation"
        >
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Session Navigation
          </p>
          {sectionItems.map((item) => {
            const active = activeSection === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={`mb-1.5 flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                  active
                    ? "border-violet-200/35 bg-violet-300/14 text-violet-100"
                    : "border-transparent bg-transparent text-slate-300 hover:border-violet-200/18 hover:bg-white/5 hover:text-slate-100"
                }`}
                onClick={() => scrollToSection(item.key)}
              >
                <span className="opacity-80">{item.icon}</span>
                <span>
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-slate-400">{item.helper}</span>
                </span>
              </button>
            );
          })}
          <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Match Profile</p>
            <p className="mt-1 text-xs text-slate-200">{resumeProfile?.targetRole ?? "Not linked"}</p>
          </div>
        </aside>

        <div className="space-y-5">
          <section ref={resumeSectionRef} data-section="resume" className={`${settingsPanelClass} scroll-mt-24`}>
            <div className="mb-5 flex items-center gap-3 border-b border-white/8 pb-4">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200/35 bg-violet-300/10 text-violet-100">
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-100">Resume Context</p>
                <p className="text-xs text-slate-400">Upload once and keep questions aligned to your profile.</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className={glassItemCardClass}>
                <p className="text-xs uppercase tracking-[0.14em] text-violet-200/80">Linked Profile</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {uploadingResume ? "Analyzing..." : resumeProfile ? "Resume Linked" : "Upload PDF"}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {resumeProfile
                    ? `Using ${resumeProfile.sourceFileName} for role-specific interview generation.`
                    : "No resume linked yet. Upload a PDF to unlock personalized interview questions."}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/12 bg-slate-950/65 p-3">
                    <p className="text-xs text-slate-400">Target Role</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">
                      {resumeProfile?.targetRole ?? "Not available"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/12 bg-slate-950/65 p-3">
                    <p className="text-xs text-slate-400">Top Skills</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">
                      {resumeProfile?.topSkills.slice(0, 3).join(" • ") || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/12 bg-slate-950/62 p-4 shadow-[0_14px_26px_rgba(2,8,24,0.32)] backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Actions</p>
                <Button
                  type="button"
                  className="mt-3 w-full bg-white text-slate-900 hover:bg-slate-200"
                  onClick={handleResumeUploadClick}
                  disabled={uploadingResume}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingResume ? "Analyzing Resume..." : resumeProfile ? "Replace Resume" : "Upload Resume PDF"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full border-white/25 bg-slate-900/72 text-slate-100 hover:bg-slate-800/78 hover:text-white"
                  onClick={() => router.push("/dashboard/resume-analyzer")}
                >
                  Open Full Analyzer
                </Button>
                {resumeProfile ? (
                  <p className="mt-3 text-xs text-slate-400">
                    Last analyzed: {formatAnalyzedAt(resumeProfile.lastAnalyzedAt)}
                  </p>
                ) : null}
              </div>
            </div>

            {resumeUploadError ? (
              <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200" role="alert">
                {resumeUploadError}
              </p>
            ) : null}

            {resumeUploadSuccess ? (
              <p className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                {resumeUploadSuccess}
              </p>
            ) : null}
          </section>

          <section ref={sessionSectionRef} data-section="session" className={`${settingsPanelClass} scroll-mt-24`}>
            <div className="mb-5 flex items-center gap-3 border-b border-white/8 pb-4">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200/35 bg-violet-300/10 text-violet-100">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-100">Interview Session</p>
                <p className="text-xs text-slate-400">Start the flow and choose level before generating questions.</p>
              </div>
            </div>

            {!resumeProfile ? (
              <div className={glassItemCardClass}>
                <p className="text-sm text-slate-200">
                  Resume context is required before starting interview mode. Upload a resume first.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className={glassItemCardClass}>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Session State</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge tone={started ? "success" : "warning"}>{started ? "Started" : "Waiting"}</StatusBadge>
                      <StatusBadge tone={selectedDifficulty ? "info" : "neutral"}>{selectedDifficultyLabel}</StatusBadge>
                      <StatusBadge tone={questions.length > 0 ? "success" : "neutral"}>{questions.length} questions</StatusBadge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="bg-white text-slate-900 hover:bg-slate-200"
                        onClick={handleStartInterview}
                        disabled={loading || started}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {started ? "Session Running" : "Start Question Answer"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/25 bg-slate-900/72 text-slate-100 hover:bg-slate-800/78 hover:text-white"
                        onClick={handleSessionReset}
                        disabled={loading && questions.length > 0}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className={glassItemCardClass}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">Show model answers</p>
                        <p className="mt-1 text-xs text-slate-400">Toggle answer visibility in generated cards.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAnswers((current) => !current)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-all ${
                          showAnswers
                            ? "border-violet-200/45 bg-linear-to-r from-violet-300/70 to-cyan-300/60"
                            : "border-white/18 bg-white/15"
                        }`}
                        aria-label="Toggle model answer visibility"
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition-all ${
                            showAnswers ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {difficultyConfig.map((level) => (
                    <button
                      key={level.key}
                      type="button"
                      onClick={() => handleDifficultySelect(level.key)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        selectedDifficulty === level.key
                          ? "border-violet-200/65 bg-violet-300/15"
                          : "border-white/24 bg-slate-900/55 hover:border-cyan-200/45 hover:bg-slate-900/75"
                      } ${!started ? "cursor-not-allowed opacity-60" : ""}`}
                      disabled={loading || !started}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-100">{level.label}</p>
                        {selectedDifficulty === level.key ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-300/20 text-violet-100">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-slate-300">{level.helper}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          <section ref={questionsSectionRef} data-section="questions" className={`${settingsPanelClass} scroll-mt-24`}>
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200/35 bg-violet-300/10 text-violet-100">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-100">Generated Questions</p>
                  <p className="text-xs text-slate-400">Practice questions with focus areas and optional answer hints.</p>
                </div>
              </div>

              <StatusBadge tone="info">Next offset: {nextOffset}</StatusBadge>
            </div>

            {errorMessage ? (
              <p className="mb-3 rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200" role="alert">
                {errorMessage}
              </p>
            ) : null}

            {questions.length === 0 ? (
              <div className={glassItemCardClass}>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">No questions generated yet</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Start the interview session, choose a difficulty level, and your first batch of 5 questions will appear here.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((item, index) => (
                  <article key={`${item.id}-${index}`} className={glassItemCardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-100">Question {index + 1}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge tone="info">{item.focusArea}</StatusBadge>
                        <StatusBadge tone="success">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Ready
                        </StatusBadge>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-100">{item.question}</p>

                    {showAnswers ? (
                      <p className="mt-3 rounded-lg border border-emerald-200/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                        Suggested answer: {item.answer}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}

            {canGenerate ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4 border-white/35 bg-slate-900/72 text-slate-100 hover:bg-slate-800/78 hover:text-white"
                onClick={handleMoreQuestions}
                disabled={loading}
              >
                {loading ? "Generating..." : "More 5 Questions"}
              </Button>
            ) : null}
          </section>
        </div>
      </section>
    </DashboardPageShell>
  );
}
