"use client";

import { type KeyboardEvent, useState } from "react";
import { DashboardPageShell, StatusBadge } from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play, RefreshCw, Target } from "lucide-react";
import type { InterviewDifficulty } from "@/lib/resume-profile";

interface PracticeQuestionItem {
  id: string;
  question: string;
  answer: string;
  focusArea: string;
}

const difficultyConfig: Array<{ key: InterviewDifficulty; label: string; helper: string }> = [
  { key: "beginner", label: "Beginner", helper: "Foundational interview confidence" },
  { key: "intermediate", label: "Intermediate", helper: "Role-ready practical depth" },
  { key: "advanced", label: "Advanced", helper: "Complex scenarios & trade-offs" },
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
    if (targetRole.trim().length < 2) {
      setErrorMessage("Please enter a valid target role.");
      return;
    }
    if (!selectedDifficulty) {
      setErrorMessage("Please select a difficulty.");
      return;
    }

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

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((c) => c + 1);
      setIsFlipped(false);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setIsFlipped(false);
    }
  };

  return (
    <DashboardPageShell
      eyebrow="Practice Questions"
      title="AI Mock Interview Flashcards"
      description="Select your role and difficulty to launch a fast, interactive mock interview session."
    >
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Setup Section */}
        {!sessionActive && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md">
            <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              Session Setup
            </h2>

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-200 border border-red-500/20">
                {errorMessage}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="targetRole" className="mb-2 block text-sm font-medium text-slate-300">Target Role</label>
              <input
                id="targetRole"
                type="text"
                placeholder="e.g. Frontend Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white placeholder-slate-500 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50"
              />
            </div>

            <div className="mb-8">
              <label className="mb-3 block text-sm font-medium text-slate-300">Difficulty</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {difficultyConfig.map((level) => (
                  <button
                    key={level.key}
                    onClick={() => setSelectedDifficulty(level.key)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      selectedDifficulty === level.key
                        ? "border-indigo-400 bg-indigo-500/20 shadow-md"
                        : "border-white/10 bg-black/20 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{level.label}</span>
                      {selectedDifficulty === level.key && (
                        <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                      )}
                    </div>
                    <span className="mt-1 block text-xs text-slate-400">{level.helper}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={startSession}
              disabled={loading || !targetRole.trim() || !selectedDifficulty}
              className="w-full bg-indigo-500 text-white hover:bg-indigo-600 py-6 text-lg font-bold"
            >
              <Play className="mr-2 h-5 w-5" />
              {loading ? "Generating Session..." : "Start Flashcards"}
            </Button>
          </div>
        )}

        {/* Active Session Section */}
        {sessionActive && currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge tone="info">
                Question {currentIndex + 1} of {questions.length}
              </StatusBadge>
              <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={resetState}>
                <RefreshCw className="mr-2 h-4 w-4" /> End Session
              </Button>
            </div>

            {/* Flashcard */}
            <div className="perspective-1000 relative mx-auto max-w-3xl h-[400px]">
              <div
                className={`transform-style-3d relative w-full h-full transition-transform duration-700 ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front (Question) */}
                <div
                  className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950 p-8 shadow-2xl hover:cursor-pointer"
                  role="button"
                  tabIndex={isFlipped ? -1 : 0}
                  aria-label={`Show answer for ${currentQuestion.question}`}
                  onClick={() => setIsFlipped(true)}
                  onKeyDown={(event) => onFlipKeyDown(event, true)}
                >
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
                    Question
                  </p>
                  <h3 className="text-center text-2xl md:text-3xl font-medium text-white leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                  <p className="mt-auto text-sm text-slate-500 animate-pulse">Click card to reveal answer</p>
                </div>

                {/* Back (Answer) */}
                <div
                  className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950 p-8 shadow-2xl hover:cursor-pointer overflow-y-auto"
                  role="button"
                  tabIndex={isFlipped ? 0 : -1}
                  aria-label={`Show question for ${currentQuestion.question}`}
                  onClick={() => setIsFlipped(false)}
                  onKeyDown={(event) => onFlipKeyDown(event, false)}
                >
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-400">
                    Model Answer
                  </p>
                  <p className="text-center text-lg md:text-xl text-emerald-50 leading-relaxed max-h-full overflow-auto">
                    {currentQuestion.answer}
                  </p>
                  <div className="mt-auto pt-4 flex gap-2">
                    <StatusBadge tone="success">Focus: {currentQuestion.focusArea}</StatusBadge>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                className="w-32 bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                className="w-32 bg-indigo-500 text-white hover:bg-indigo-600 font-bold"
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
              >
                Next
              </Button>
            </div>
            
            {currentIndex === questions.length - 1 && (
              <div className="flex justify-center mt-6">
                 <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-6 text-lg"
                  onClick={resetState}
                >
                  Finish & Start New
                </Button>
              </div>
            )}
            
          </div>
        )}
      </div>
      
      {/* Required styles for the 3D flip effect */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </DashboardPageShell>
  );
}
