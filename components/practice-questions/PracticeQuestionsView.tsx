"use client";

import { type KeyboardEvent, useState } from "react";
import { DashboardPageShell, StatusBadge } from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play, RefreshCw, Target, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import type { InterviewDifficulty } from "@/lib/resume-profile";

interface PracticeQuestionItem {
  id: string;
  question: string;
  answer: string;
  focusArea: string;
}

const difficultyConfig: Array<{ key: InterviewDifficulty; label: string; helper: string; accent: string; glow: string; activeBg: string; activeBorder: string }> = [
  {
    key: "beginner",
    label: "Beginner",
    helper: "Foundational interview confidence",
    accent: "text-emerald-400",
    glow: "shadow-emerald-900/40",
    activeBg: "bg-emerald-500/10",
    activeBorder: "border-emerald-500/50",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    helper: "Role-ready practical depth",
    accent: "text-sky-400",
    glow: "shadow-sky-900/40",
    activeBg: "bg-sky-500/10",
    activeBorder: "border-sky-500/50",
  },
  {
    key: "advanced",
    label: "Advanced",
    helper: "Complex scenarios & trade-offs",
    accent: "text-violet-400",
    glow: "shadow-violet-900/40",
    activeBg: "bg-violet-500/10",
    activeBorder: "border-violet-500/50",
  },
];

export function PracticeQuestionsView() {
  const [targetRole, setTargetRole] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionActive, setSessionActive] = useState(false);

  const onFlipKeyDown = (event: KeyboardEvent<HTMLDivElement>, nextFlipped: boolean) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsFlipped(nextFlipped);
    }
  };

  const resetState = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionActive(false);
    setErrorMessage("");
  };

  const startSession = async () => {
    if (targetRole.trim().length < 2) { setErrorMessage("Please enter a valid target role."); return; }
    if (!selectedDifficulty) { setErrorMessage("Please select a difficulty."); return; }

    setLoading(true);
    setErrorMessage("");
    setQuestions([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const res = await fetch("/api/dashboard/practice-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: targetRole.trim(), difficulty: selectedDifficulty, count: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions.");
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setSessionActive(true);
      } else {
        throw new Error("No questions generated.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const nextQuestion = () => { if (currentIndex < questions.length - 1) { setCurrentIndex((c) => c + 1); setIsFlipped(false); } };
  const prevQuestion = () => { if (currentIndex > 0) { setCurrentIndex((c) => c - 1); setIsFlipped(false); } };

  const selectedConfig = difficultyConfig.find(d => d.key === selectedDifficulty);
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <DashboardPageShell
      eyebrow="Practice Questions"
      title="AI Mock Interview Flashcards"
      description="Select your role and difficulty to launch a fast, interactive mock interview session."
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Setup Section ── */}
        {!sessionActive && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-2xl">
            {/* ambient orbs */}
            <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full bg-violet-600/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-sky-600/10 blur-[80px]" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-sky-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Target className="h-4 w-4 text-violet-300" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Session Setup</h2>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-sm text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Role input */}
              <div className="mb-6">
                <label htmlFor="targetRole" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/30">
                  Target Role
                </label>
                <input
                  id="targetRole"
                  type="text"
                  placeholder="e.g. Frontend Developer, ML Engineer…"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.08] focus:shadow-lg focus:shadow-violet-900/20"
                />
              </div>

              {/* Difficulty */}
              <div className="mb-8">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-white/30">
                  Difficulty Level
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {difficultyConfig.map((level) => {
                    const isActive = selectedDifficulty === level.key;
                    return (
                      <button
                        key={level.key}
                        onClick={() => setSelectedDifficulty(level.key)}
                        className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
                          isActive
                            ? `${level.activeBg} ${level.activeBorder} shadow-lg ${level.glow}`
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-bold ${isActive ? level.accent : "text-white/70"}`}>
                            {level.label}
                          </span>
                          {isActive && <CheckCircle2 className={`h-4 w-4 ${level.accent}`} />}
                        </div>
                        <span className="block text-[11px] text-white/30 leading-relaxed">{level.helper}</span>
                        {/* shimmer on active */}
                        {isActive && (
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={startSession}
                disabled={loading || !targetRole.trim() || !selectedDifficulty}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 text-sm font-bold text-white transition-all duration-300 disabled:opacity-30 hover:shadow-xl hover:shadow-violet-900/40 hover:scale-[1.01] flex items-center justify-center gap-2.5"
              >
                <Play className="h-4 w-4" />
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white inline-block" />
                    Generating Session…
                  </span>
                ) : "Start Flashcards"}
                {/* shimmer sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
              </button>
            </div>
          </div>
        )}

        {/* ── Active Session ── */}
        {sessionActive && currentQuestion && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Progress bar + controls row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/30 font-medium">
                    Question <span className="text-white/60 font-bold">{currentIndex + 1}</span> / {questions.length}
                  </span>
                  <span className="text-xs text-white/30">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={resetState}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300 px-3 py-2 text-xs text-white/40 transition-all duration-200"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                End Session
              </button>
            </div>

            {/* Flashcard */}
            <div className="perspective-1000 relative mx-auto h-[420px] sm:h-[380px]">
              <div className={`transform-style-3d relative w-full h-full transition-transform duration-700 ${isFlipped ? "rotate-y-180" : ""}`}>

                {/* Front — Question */}
                <div
                  className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl cursor-pointer group overflow-hidden"
                  role="button"
                  tabIndex={isFlipped ? -1 : 0}
                  aria-label={`Show answer for: ${currentQuestion.question}`}
                  onClick={() => setIsFlipped(true)}
                  onKeyDown={(e) => onFlipKeyDown(e, true)}
                >
                  {/* ambient */}
                  <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-violet-600/15 blur-[60px]" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-[60px]" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                  <div className="relative flex flex-col items-center gap-5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-300">
                      <Zap className="w-2.5 h-2.5" /> Question
                    </span>
                    <h3 className="text-center text-xl sm:text-2xl font-semibold text-white leading-relaxed max-w-xl">
                      {currentQuestion.question}
                    </h3>
                  </div>
                  <p className="absolute bottom-6 text-[11px] text-white/20 animate-pulse tracking-wider">
                    Click to reveal answer →
                  </p>
                </div>

                {/* Back — Answer */}
                <div
                  className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl cursor-pointer overflow-hidden"
                  role="button"
                  tabIndex={isFlipped ? 0 : -1}
                  aria-label="Show question"
                  onClick={() => setIsFlipped(false)}
                  onKeyDown={(e) => onFlipKeyDown(e, false)}
                >
                  <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-600/15 blur-[60px]" />
                  <div className="pointer-events-none absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-teal-600/10 blur-[60px]" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

                  <div className="relative flex flex-col items-center gap-5 max-w-xl w-full">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Model Answer
                    </span>
                    <p className="text-center text-base sm:text-lg text-white/80 leading-relaxed max-h-[220px] overflow-auto scrollbar-thin">
                      {currentQuestion.answer}
                    </p>
                    <div className="mt-2">
                      <StatusBadge tone="success">Focus: {currentQuestion.focusArea}</StatusBadge>
                    </div>
                  </div>
                  <p className="absolute bottom-6 text-[11px] text-white/20 tracking-wider">
                    ← Click to go back
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white disabled:opacity-25 transition-all duration-200 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setIsFlipped(false); }}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? "w-5 h-2 bg-violet-400"
                        : i < currentIndex
                        ? "w-2 h-2 bg-emerald-500/60"
                        : "w-2 h-2 bg-white/15"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-25 transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-900/30"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Finish */}
            {currentIndex === questions.length - 1 && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={resetState}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-8 py-3 text-sm font-bold text-white transition-all duration-200 hover:shadow-xl hover:shadow-emerald-900/40 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Finish & Start New
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </DashboardPageShell>
  );
}