"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import {
  DashboardPageShell,
  DashboardPanel,
  MetricCard,
  ProgressMeter,
  StatusBadge,
} from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import { FileText, Gauge, Lightbulb, Target, Upload } from "lucide-react";

const roleMatches = [
  {
    role: "Frontend Engineer",
    match: 89,
    note: "Strong fit based on React, Next.js, and UI project experience.",
  },
  {
    role: "UI Developer",
    match: 84,
    note: "Design implementation quality is strong, add accessibility evidence.",
  },
  {
    role: "Product Engineer",
    match: 71,
    note: "Needs more backend integration and metrics-driven outcomes.",
  },
];

const skillGaps = [
  {
    skill: "System Design Storytelling",
    current: 46,
    target: 75,
    priority: "High",
  },
  {
    skill: "Performance Optimization",
    current: 61,
    target: 80,
    priority: "Medium",
  },
  {
    skill: "Testing Strategy",
    current: 54,
    target: 78,
    priority: "High",
  },
];

const improvements = [
  "Rewrite project bullets with measurable impact (load time, users, conversion).",
  "Add one section highlighting deployment, monitoring, and debugging ownership.",
  "Prioritize role keywords in your summary and top skills block.",
  "Include one short case study style project to showcase problem solving depth.",
];

const priorityTone = {
  High: "danger",
  Medium: "warning",
  Low: "success",
} as const;

const glassItemCardClass =
  "rounded-2xl border border-white/24 bg-gradient-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-5 sm:p-6 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

const compactGlassCardClass =
  "rounded-xl border border-white/24 bg-gradient-to-br from-slate-950/74 via-slate-900/58 to-slate-800/42 p-4 backdrop-blur-md shadow-[0_10px_24px_rgba(2,8,24,0.3)]";

const glassActionButtonClass =
  "!border-white/35 !bg-slate-900/72 !text-slate-100 shadow-[0_10px_22px_rgba(2,8,24,0.34)] hover:!bg-slate-800/78 hover:!text-white";

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

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

export function ResumeAnalyzerView() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const analyzeTimeoutRef = useRef<number | null>(null);
  const dragEnterCounterRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("No file selected");
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "running" | "completed">("idle");
  const [analysisTimestamp, setAnalysisTimestamp] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current !== null) {
        window.clearTimeout(analyzeTimeoutRef.current);
      }
    };
  }, []);

  const formatAnalysisTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const processSelectedFile = (file: File) => {
    const validationError = validateResumeFile(file);

    if (validationError) {
      setSelectedFile(null);
      setUploadError(validationError);
      setStatusMessage("Waiting for valid PDF");
      return;
    }

    setSelectedFile(file);
    setUploadError("");
    setAnalysisStatus("idle");
    setAnalysisTimestamp(null);
    setStatusMessage(`Ready to analyze: ${file.name}`);
  };

  const handleSelectResumeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }

    event.target.value = "";
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragEnterCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragEnterCounterRef.current = 0;
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }

    dragEnterCounterRef.current = Math.max(0, dragEnterCounterRef.current - 1);
    if (dragEnterCounterRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDropzoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectResumeClick();
    }
  };

  const handleAnalyzeResume = () => {
    if (!selectedFile) {
      setUploadError("Select a resume PDF before running AI analysis.");
      setStatusMessage("Waiting for file");
      return;
    }

    setUploadError("");
    setAnalysisStatus("running");
    setIsAnalyzing(true);
    setStatusMessage("Analyzing with AI...");

    if (analyzeTimeoutRef.current !== null) {
      window.clearTimeout(analyzeTimeoutRef.current);
    }

    analyzeTimeoutRef.current = window.setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStatus("completed");
      setAnalysisTimestamp(Date.now());
      setStatusMessage("Analysis complete");
    }, 1200);
  };

  const handleExportTips = () => {
    const lines = [
      "Resume Improvement Suggestions",
      "",
      ...improvements.map((tip, index) => `${index + 1}. ${tip}`),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "resume-improvement-tips.txt";

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardPageShell
      eyebrow="Resume Analyzer"
      title="AI Resume Analysis Workspace"
      description="Upload your resume, review your score, close job-role gaps, and apply targeted improvements."
    >
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Resume Score"
          value="82 / 100"
          change="+6 vs last scan"
          helperText="Structure and readability improved"
          tone="teal"
          icon={<Gauge className="h-4 w-4" />}
        />
        <MetricCard
          label="Job-Ready Index"
          value="74%"
          change="Role aligned"
          helperText="Frontend roles are strongest"
          tone="sky"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          label="Improvement Priority"
          value="4 items"
          change="2 critical"
          helperText="Action plan generated"
          tone="amber"
          icon={<Lightbulb className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <DashboardPanel
          className="xl:col-span-2"
          title="Upload and Analyze"
          description="Use PDF format for best extraction quality and scoring accuracy."
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div
            role="region"
            aria-label="Resume file dropzone. Drop a PDF resume or press Enter to select a file."
            tabIndex={0}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onKeyDown={handleDropzoneKeyDown}
            className={`rounded-2xl border border-dashed p-7 sm:p-8 shadow-[0_18px_34px_rgba(2,8,24,0.36)] focus:outline-hidden focus:ring-2 focus:ring-cyan-300/80 ${
              isDragActive
                ? "border-cyan-300/70 bg-gradient-to-br from-cyan-400/25 via-slate-900/60 to-slate-800/45"
                : "border-white/35 bg-gradient-to-br from-slate-950/72 via-slate-900/56 to-slate-800/42"
            }`}
          >
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-slate-950/46">
                <Upload className="h-6 w-6 text-cyan-100" />
              </div>
              <p className="text-base font-medium text-slate-100">Drop your resume file here</p>
              <p className="mt-1 text-sm text-slate-300">
                Supported format: PDF. Max size: 5MB. Keep it single-column for best parsing.
              </p>
              <p className="mt-2 text-xs text-slate-300" aria-live="polite">
                {selectedFile ? `Selected: ${selectedFile.name}` : "No file selected yet"}
              </p>

              {uploadError ? (
                <p className="mt-2 text-sm text-rose-200" role="alert">
                  {uploadError}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  className="bg-white text-slate-900 hover:bg-slate-200"
                  onClick={handleSelectResumeClick}
                >
                  Select Resume PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={glassActionButtonClass}
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className={compactGlassCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Latest Scan</p>
              <p className="mt-1 text-sm font-medium text-slate-100">
                {analysisTimestamp
                  ? formatAnalysisTime(analysisTimestamp)
                  : analysisStatus === "running"
                    ? "Scanning..."
                    : "No scan yet"}
              </p>
            </div>
            <div className={compactGlassCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Version</p>
              <p className="mt-1 text-sm font-medium text-slate-100">{selectedFile?.name ?? "Not uploaded"}</p>
            </div>
            <div className={compactGlassCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Scan Status</p>
              <p className="mt-1 text-sm font-medium text-emerald-100">{statusMessage}</p>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Role Suggestions" description="Suggested job roles based on resume strengths.">
          <div className="space-y-4">
            {roleMatches.map((item) => (
              <div key={item.role} className={compactGlassCardClass}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-100">{item.role}</p>
                  <StatusBadge tone="info">{item.match}% match</StatusBadge>
                </div>
                <ProgressMeter label="Role fit" value={item.match} tone="cyan" />
                <p className="mt-2 text-xs text-slate-300">{item.note}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel
          title="Job-Ready Gap Analysis"
          description="Current skill coverage versus the target level for your roles."
        >
          <div className="space-y-4">
            {skillGaps.map((gap) => (
              <div key={gap.skill} className={glassItemCardClass}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-100">{gap.skill}</p>
                  <StatusBadge tone={priorityTone[gap.priority]}>{gap.priority}</StatusBadge>
                </div>
                <ProgressMeter
                  label="Current level"
                  value={gap.current}
                  tone={gap.priority === "High" ? "rose" : "amber"}
                  note={`Target level: ${gap.target}%`}
                />
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Improvement Suggestions"
          description="High-impact changes generated from your latest analysis."
          action={
            <Button
              type="button"
              variant="ghost"
              className="text-slate-100 hover:bg-white/10 hover:text-white"
              onClick={handleExportTips}
            >
              Export tips
            </Button>
          }
        >
          <ul className="space-y-3">
            {improvements.map((item) => (
              <li key={item} className={glassItemCardClass}>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </section>
    </DashboardPageShell>
  );
}
