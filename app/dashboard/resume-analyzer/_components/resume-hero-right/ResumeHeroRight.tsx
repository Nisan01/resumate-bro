"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, UploadCloud, ImageIcon, FileText,
  CheckCircle2, ChevronDown, X, Briefcase, Building2, ArrowRight
} from "lucide-react";
import Lottie from "lottie-react";
import scanAnimation from "@/public/fileScanning.json";
import { Dispatch, SetStateAction } from "react";

type AcceptedExt = "pdf" | "jpg" | "jpeg" | "png";
type Stage = "idle" | "ready" | "dialog" | "scanning" | "done";

interface UploadedFile {
  file: File;
  ext: AcceptedExt;
  sizeLabel: string;
  isImage: boolean;
}

interface Props {
  onAnalysisUpdate: Dispatch<SetStateAction<Record<string, any>>>;
  onDone?: () => void;
}

const ALLOWED_EXTS: AcceptedExt[] = ["pdf", "jpg", "jpeg", "png"];
const IMAGE_EXTS: AcceptedExt[] = ["jpg", "jpeg", "png"];

const ROLE_SUGGESTIONS = [
  "Software Engineer", "Frontend Developer", "Backend Engineer",
  "Full Stack Developer", "Data Scientist", "Product Manager",
  "UX Designer", "DevOps Engineer", "ML Engineer", "Cloud Architect",
];

const INDUSTRY_SUGGESTIONS = [
  "Tech / SaaS", "Finance / Fintech", "Healthcare", "E-commerce",
  "Gaming", "AI / ML", "Cybersecurity", "Consulting", "Startup", "Enterprise",
];

const SCAN_STEPS = [
  "Extracting resume text...",
  "Analyzing contact info...",
  "Evaluating work experience...",
  "Checking ATS compliance...",
  "Assessing skills...",
  "Running recruiter eye scan...",
  "Generating final report...",
];

function formatFileSize(bytes: number): string {
  if (bytes > 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function getExt(filename: string): AcceptedExt | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ALLOWED_EXTS.includes(ext as AcceptedExt) ? (ext as AcceptedExt) : null;
}

// ── Glowing pill chip ─────────────────────────────────────────────────────────
function Chip({
  label, selected, onClick, color = "purple"
}: {
  label: string; selected: boolean; onClick: () => void; color?: "purple" | "cyan";
}) {
  const colors = {
    purple: {
      active: { background: "rgba(196,176,255,0.20)", border: "1px solid rgba(196,176,255,0.60)", color: "#c4b0ff", boxShadow: "0 0 12px rgba(196,176,255,0.35)" },
      idle:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(220,215,255,0.45)" },
    },
    cyan: {
      active: { background: "rgba(126,232,250,0.15)", border: "1px solid rgba(126,232,250,0.55)", color: "#7ee8fa", boxShadow: "0 0 12px rgba(126,232,250,0.30)" },
      idle:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(220,215,255,0.45)" },
    },
  };
  const s = selected ? colors[color].active : colors[color].idle;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{ ...s, cursor: "pointer" }}
    >
      {label}
    </motion.button>
  );
}

export default function ResumeUploaderRight({ onAnalysisUpdate, onDone }: Props) {
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  // Dialog state
  const [targetRole, setTargetRole] = useState("");
  const [industry, setIndustry] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localAnalysisRef = useRef<Record<string, any>>({});

  const processFile = useCallback((f: File) => {
    const ext = getExt(f.name);
    if (!ext) return alert("PDF, JPG or PNG only");
    setUploaded({ file: f, ext, sizeLabel: formatFileSize(f.size), isImage: IMAGE_EXTS.includes(ext) });
    setStage("ready");
    setProgress(0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    if (stage === "scanning") return;
    setUploaded(null);
    setStage("idle");
    setProgress(0);
    setStepIndex(0);
    setTargetRole("");
    setIndustry("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // clicking Analyze opens dialog
  const handleAnalyzeClick = () => {
    if (!uploaded) return;
    setStage("dialog");
  };

  // dialog submit triggers actual analysis
  const handleDialogSubmit = async () => {
    if (!uploaded) return;

    setStage("scanning");
    setProgress(0);
    setStepIndex(0);
    onAnalysisUpdate({});
    localAnalysisRef.current = {};

    let pct = 0;
    progressRef.current = setInterval(() => {
      pct = Math.min(pct + Math.random() * 4 + 1, 92);
      setProgress(Math.round(pct));
    }, 220);

    let si = 0;
    stepRef.current = setInterval(() => {
      si = Math.min(si + 1, SCAN_STEPS.length - 1);
      setStepIndex(si);
    }, 2800);

    const formData = new FormData();
    formData.append("file", uploaded.file);
    formData.append("targetRole", targetRole || "Software Engineer");
    formData.append("industry", industry || "Tech");

    const res = await fetch("/api/parse/parse-resume", { method: "POST", body: formData });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop()!;
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const { section, data } = JSON.parse(line);
          localAnalysisRef.current = { ...localAnalysisRef.current, [section]: data };
          onAnalysisUpdate(prev => ({ ...prev, [section]: data }));
        } catch {
          console.error("Failed to parse line:", line);
        }
      }
    }

    if (progressRef.current) clearInterval(progressRef.current);
    if (stepRef.current) clearInterval(stepRef.current);
    setProgress(100);
    setStepIndex(SCAN_STEPS.length - 1);

    await new Promise(r => setTimeout(r, 600));
    setStage("done");
    setTimeout(() => onDone?.(), 800);
  };

  // ── DIALOG ────────────────────────────────────────────────────────────────
  if (stage === "dialog") {
    return (
      <AnimatePresence>
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full lg:max-w-lg rounded-2xl p-6 flex flex-col gap-5 relative"
          style={{
            background: "rgba(10,13,28,0.95)",
            border: "1px solid rgba(196,176,255,0.22)",
            boxShadow: "0 0 60px rgba(196,176,255,0.10), 0 24px 64px rgba(0,0,0,0.5)",
            backdropFilter: "blur(32px)",
          }}
        >
          {/* Glow top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(196,176,255,0.6), transparent)" }} />

          {/* Close */}
          <button
            onClick={() => setStage("ready")}
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer" }}
          >
            <X size={14} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(196,176,255,0.10)", border: "1px solid rgba(196,176,255,0.20)" }}>
              <Briefcase size={16} style={{ color: "#c4b0ff" }} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">One last thing</p>
              <p className="text-xs" style={{ color: "rgba(220,215,255,0.45)" }}>
                Help us tailor your analysis
              </p>
            </div>
          </div>

          <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Target Role */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "rgba(196,176,255,0.60)" }}>
              Target Role
            </label>
            <div className="relative">
              <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(196,176,255,0.45)", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(196,176,255,0.20)",
                  color: "rgba(255,255,255,0.85)",
                  caretColor: "#c4b0ff",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(196,176,255,0.55)"}
                onBlur={e => e.target.style.borderColor = "rgba(196,176,255,0.20)"}
              />
            </div>
            {/* Role chips */}
            <div className="flex flex-wrap gap-1.5">
              {ROLE_SUGGESTIONS.map(r => (
                <Chip key={r} label={r} selected={targetRole === r}
                  onClick={() => setTargetRole(r)} color="purple" />
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "rgba(126,232,250,0.60)" }}>
              Industry
            </label>
            <div className="relative">
              <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(126,232,250,0.45)", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="e.g. Fintech, Healthcare, SaaS..."
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(126,232,250,0.20)",
                  color: "rgba(255,255,255,0.85)",
                  caretColor: "#7ee8fa",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(126,232,250,0.55)"}
                onBlur={e => e.target.style.borderColor = "rgba(126,232,250,0.20)"}
              />
            </div>
            {/* Industry chips */}
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRY_SUGGESTIONS.map(ind => (
                <Chip key={ind} label={ind} selected={industry === ind}
                  onClick={() => setIndustry(ind)} color="cyan" />
              ))}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleDialogSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold mt-1"
            style={{
              background: "linear-gradient(135deg, #c4b0ff, #7ee8fa)",
              color: "#080b12",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 24px rgba(196,176,255,0.30)",
            }}
          >
            <Zap size={14} />
            Start Analysis
            <ArrowRight size={14} />
          </motion.button>

          {/* Skip */}
          <button
            onClick={handleDialogSubmit}
            className="text-xs text-center underline underline-offset-2 w-full"
            style={{ color: "rgba(255,255,255,0.20)", background: "none", border: "none", cursor: "pointer" }}
          >
            Skip — use defaults
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── SCANNING ──────────────────────────────────────────────────────────────
  if (stage === "scanning") {
    return (
      <motion.div
        key="scanning-full"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full flex flex-col items-center justify-center gap-6 py-10 px-4"
        style={{ minHeight: 420 }}
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(196,176,255,0.18) 0%, transparent 70%)", filter: "blur(18px)" }} />
          <Lottie animationData={scanAnimation} style={{ width: 160, position: "relative", zIndex: 1 }} />
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "rgba(196,176,255,0.10)", border: "1px solid rgba(196,176,255,0.22)" }}>
          <FileText size={13} style={{ color: "#c4b0ff" }} />
          <span className="text-xs font-medium truncate max-w-[180px]" style={{ color: "#c4b0ff" }}>
            {uploaded?.file.name}
          </span>
        </div>

        {targetRole && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: "rgba(126,232,250,0.08)", border: "1px solid rgba(126,232,250,0.20)" }}>
            <Briefcase size={11} style={{ color: "#7ee8fa" }} />
            <span className="text-xs" style={{ color: "#7ee8fa" }}>{targetRole}</span>
            {industry && <>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span className="text-xs" style={{ color: "rgba(126,232,250,0.7)" }}>{industry}</span>
            </>}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-sm font-medium text-center"
            style={{ color: "rgba(220,215,255,0.75)" }}
          >
            {SCAN_STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>

        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>Analyzing</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #c4b0ff, #7ee8fa)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full max-w-sm">
          {SCAN_STEPS.slice(0, stepIndex + 1).map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }} className="flex items-center gap-2">
              <CheckCircle2 size={11}
                style={{ color: i < stepIndex ? "#22c55e" : "#c4b0ff", flexShrink: 0 }} />
              <span className="text-xs"
                style={{ color: i < stepIndex ? "rgba(34,197,94,0.7)" : "rgba(220,215,255,0.55)" }}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <motion.div
        key="done-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full flex flex-col items-center justify-center gap-5 py-10 px-4 text-center"
        style={{ minHeight: 420 }}
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute rounded-full"
            style={{ width: 120, height: 120, background: "radial-gradient(circle, rgba(34,197,94,0.20) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full"
            style={{ background: "rgba(34,197,94,0.12)", border: "1.5px solid rgba(34,197,94,0.35)" }}
          >
            <CheckCircle2 size={40} style={{ color: "#22c55e" }} />
          </motion.div>
        </div>

        <div>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl font-bold" style={{ color: "#f0eeff" }}>
            Analysis Complete!
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-xs mt-1" style={{ color: "rgba(220,215,255,0.45)" }}>
            Analyzed for <span style={{ color: "#c4b0ff" }}>{targetRole || "Software Engineer"}</span>
            {industry && <> · <span style={{ color: "#7ee8fa" }}>{industry}</span></>}
          </motion.p>
        </div>

        <motion.button
          onClick={() => onDone?.()}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, rgba(196,176,255,0.15), rgba(126,232,250,0.10))",
            border: "1px solid rgba(196,176,255,0.30)",
            color: "#c4b0ff",
            cursor: "pointer",
          }}
        >
          View Results <ChevronDown size={15} />
        </motion.button>

        <button onClick={removeFile} className="text-xs underline underline-offset-2"
          style={{ color: "rgba(255,255,255,0.25)", cursor: "pointer", background: "none", border: "none" }}>
          Analyze another resume
        </button>
      </motion.div>
    );
  }

  // ── IDLE / READY ──────────────────────────────────────────────────────────
  return (
    <motion.div
      key="uploader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full lg:max-w-lg rounded-2xl border border-white/10 backdrop-blur-3xl bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-6 flex flex-col gap-4"
    >
      <div>
        <p className="font-extrabold text-white">Resume Analyzer</p>
        <p className="text-xs text-white/50">Upload your resume</p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className="flex flex-col items-center justify-center rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
        style={{
          minHeight: "240px",
          border: `1.5px dashed ${isDragging ? "#a78bfa" : "rgba(255,255,255,0.25)"}`,
          background: isDragging ? "rgba(167,139,250,0.05)" : "transparent",
        }}
      >
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2">
              <UploadCloud size={32} className="text-purple-300" />
              <p className="text-white font-semibold">Drop your resume</p>
              <p className="text-xs text-white/40">PDF, JPG or PNG · or click to browse</p>
            </motion.div>
          )}
          {stage === "ready" && uploaded && (
            <motion.div key="ready" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3">
              {uploaded.isImage
                ? <ImageIcon size={42} className="text-purple-400" />
                : <FileText size={42} className="text-purple-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              }
              <p className="text-white text-sm font-medium truncate max-w-[200px]">{uploaded.file.name}</p>
              <p className="text-xs text-white/40">{uploaded.sizeLabel}</p>
              <button onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="text-xs underline underline-offset-2"
                style={{ color: "rgba(255,100,100,0.6)", background: "none", border: "none", cursor: "pointer" }}>
                Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <input ref={fileInputRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleInputChange} />
      </div>

      <motion.button
        onClick={handleAnalyzeClick}
        disabled={!uploaded}
        whileHover={uploaded ? { opacity: 0.9 } : {}}
        whileTap={uploaded ? { scale: 0.98 } : {}}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold"
        style={{
          background: uploaded ? "#FFD000" : "rgba(0,0,0,0.25)",
          color: uploaded ? "#1a0e00" : "rgba(255,255,255,0.3)",
          cursor: uploaded ? "pointer" : "not-allowed",
          border: "none",
          transition: "background 0.2s",
        }}
      >
        <Zap size={14} />
        Analyze Resume
      </motion.button>
    </motion.div>
  );
}