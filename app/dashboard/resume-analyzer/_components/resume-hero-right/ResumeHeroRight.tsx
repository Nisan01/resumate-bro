"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Zap, UploadCloud, ImageIcon, FileText,
  CheckCircle2, ChevronDown, X, Briefcase, Building2, ArrowRight
} from "lucide-react";
import Lottie from "lottie-react";
import scanAnimation from "@/public/fileScanning.json";
import { Dispatch, SetStateAction } from "react";
import { useUser } from "@/context/UserContext";

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
onDone?: (analysis?: Record<string, any>) => void;}

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


function Chip({ label, selected, onClick, color = "purple" }: {
  label: string; selected: boolean; onClick: () => void; color?: "purple" | "cyan";
}) {
  const active = color === "purple"
    ? "bg-[#c4b0ff]/20 border-[#c4b0ff]/60 text-[#c4b0ff] shadow-[0_0_12px_rgba(196,176,255,0.35)]"
    : "bg-[#7ee8fa]/15 border-[#7ee8fa]/55 text-[#7ee8fa] shadow-[0_0_12px_rgba(126,232,250,0.30)]";
  const idle = "bg-white/4 border-white/10 text-[#dcd7ff]/45";
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-[1.04] active:scale-[0.96] ${selected ? active : idle}`}
    >
      {label}
    </button>
  );
}

export default function ResumeUploaderRight({ onAnalysisUpdate, onDone }: Props) {
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRole, setTargetRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [stepVisible, setStepVisible] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localAnalysisRef = useRef<Record<string, any>>({});
  const {user}=useUser();

  
  useEffect(() => {
    setStepVisible(false);
    const t = setTimeout(() => setStepVisible(true), 150);
    return () => clearTimeout(t);
  }, [stepIndex]);

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

  const handleAnalyzeClick = () => {
    if (!uploaded) return;
    setStage("dialog");
  };

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
    formData.append("targetRole", targetRole || user?.targetRole || "Software Engineer");
    formData.append("industry", industry || user?.targetIndustry || "Tech");

    const res = await fetch("/api/dashboard/resume-analyzer", { method: "POST", body: formData });
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
   setTimeout(() => onDone?.({...localAnalysisRef.current,filename:uploaded.file.name}), 800);
  };

  
  if (stage === "dialog") {
    return (
      <div className="animate-[fadeUp_0.4s_ease_both] w-full lg:max-w-lg rounded-2xl p-6 flex flex-col gap-5 relative bg-[rgba(10,13,28,0.95)] border border-[#c4b0ff]/22 shadow-[0_0_60px_rgba(196,176,255,0.10),0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-[32px]">
        {}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 rounded-full bg-gradient-to-r from-transparent via-[#c4b0ff]/60 to-transparent" />

        {}
        <button onClick={() => setStage("ready")} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-white/30 hover:text-white transition-colors">
          <X size={14} />
        </button>

        {}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#c4b0ff]/10 border border-[#c4b0ff]/20">
            <Briefcase size={16} className="text-[#c4b0ff]" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">One last thing</p>
            <p className="text-xs text-[#dcd7ff]/45">Help us tailor your analysis</p>
          </div>
        </div>

        <div className="h-px bg-white/6" />

        {}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold tracking-widest uppercase text-[#c4b0ff]/60">Target Role</label>
          <div className="relative">
            <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4b0ff]/45 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white/4 border border-[#c4b0ff]/20 text-white/85 caret-[#c4b0ff] focus:border-[#c4b0ff]/55 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ROLE_SUGGESTIONS.map(r => (
              <Chip key={r} label={r} selected={targetRole === r} onClick={() => setTargetRole(r)} color="purple" />
            ))}
          </div>
        </div>

        {}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold tracking-widest uppercase text-[#7ee8fa]/60">Industry</label>
          <div className="relative">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7ee8fa]/45 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Fintech, Healthcare, SaaS..."
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white/4 border border-[#7ee8fa]/20 text-white/85 caret-[#7ee8fa] focus:border-[#7ee8fa]/55 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {INDUSTRY_SUGGESTIONS.map(ind => (
              <Chip key={ind} label={ind} selected={industry === ind} onClick={() => setIndustry(ind)} color="cyan" />
            ))}
          </div>
        </div>

        {}
        <button
          onClick={handleDialogSubmit}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-gradient-to-r from-[#c4b0ff] to-[#7ee8fa] text-[#080b12] shadow-[0_0_24px_rgba(196,176,255,0.30)] hover:brightness-110 hover:-translate-y-px transition-all mt-1"
        >
          <Zap size={14} />
          Start Analysis
          <ArrowRight size={14} />
        </button>

        <button onClick={handleDialogSubmit} className="text-xs text-center underline underline-offset-2 text-white/20 w-full">
          Skip — use defaults
        </button>
      </div>
    );
  }

  
  if (stage === "scanning") {
    return (
      <div className="animate-[fadeUp_0.5s_ease_both] w-full flex flex-col items-center justify-center gap-6 py-10 px-4" style={{ minHeight: 420 }}>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(196,176,255,0.18)_0%,transparent_70%)] blur-[18px]" />
          <Lottie animationData={scanAnimation} style={{ width: 160, position: "relative", zIndex: 1 }} />
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#c4b0ff]/10 border border-[#c4b0ff]/22">
          <FileText size={13} className="text-[#c4b0ff]" />
          <span className="text-xs font-medium truncate max-w-[180px] text-[#c4b0ff]">{uploaded?.file.name}</span>
        </div>

        {targetRole && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#7ee8fa]/8 border border-[#7ee8fa]/20">
            <Briefcase size={11} className="text-[#7ee8fa]" />
            <span className="text-xs text-[#7ee8fa]">{targetRole}</span>
            {industry && <>
              <span className="text-white/20">·</span>
              <span className="text-xs text-[#7ee8fa]/70">{industry}</span>
            </>}
          </div>
        )}

        {}
        <p className={`text-sm font-medium text-center text-[#dcd7ff]/75 transition-all duration-300 ${stepVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          {SCAN_STEPS[stepIndex]}
        </p>

        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs mb-1.5 text-white/30">
            <span>Analyzing</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c4b0ff] to-[#7ee8fa] transition-all duration-[400ms] ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full max-w-sm">
          {SCAN_STEPS.slice(0, stepIndex + 1).map((step, i) => (
            <div key={i} className="animate-[fadeUp_0.3s_ease_both] flex items-center gap-2">
              <CheckCircle2 size={11} className={i < stepIndex ? "text-green-500" : "text-[#c4b0ff]"} style={{ flexShrink: 0 }} />
              <span className={`text-xs ${i < stepIndex ? "text-green-500/70" : "text-[#dcd7ff]/55"}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  
  if (stage === "done") {
    return (
      <div className="animate-[fadeUp_0.55s_ease_both] w-full flex flex-col items-center justify-center gap-5 py-10 px-4 text-center" style={{ minHeight: 420 }}>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-[120px] h-[120px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.20)_0%,transparent_70%)] animate-pulse" />
          <div className="animate-[fadeUp_0.4s_ease_both] relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-green-500/12 border border-green-500/35">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
        </div>

        <div>
          <p className="animate-[fadeUp_0.5s_ease_both] text-xl font-bold text-[#f0eeff]" style={{ animationDelay: "0.1s" }}>
            Analysis Complete!
          </p>
          <p className="animate-[fadeUp_0.5s_ease_both] text-xs mt-1 text-[#dcd7ff]/45" style={{ animationDelay: "0.2s" }}>
            Analyzed for <span className="text-[#c4b0ff]">{targetRole || "Software Engineer"}</span>
            {industry && <> · <span className="text-[#7ee8fa]">{industry}</span></>}
          </p>
        </div>

        <button
          onClick={() => onDone?.()}
          className="animate-[fadeUp_0.5s_ease_both] flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#c4b0ff]/15 to-[#7ee8fa]/10 border border-[#c4b0ff]/30 text-[#c4b0ff] hover:brightness-110 transition-all"
          style={{ animationDelay: "0.3s" }}
        >
          View Results <ChevronDown size={15} />
        </button>

        <button onClick={removeFile} className="text-xs underline underline-offset-2 text-white/25">
          Analyze another resume
        </button>
      </div>
    );
  }

  
  return (
    <div className="animate-[fadeUp_0.5s_ease_both] w-full lg:max-w-lg rounded-2xl border border-white/10 backdrop-blur-3xl bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-6 flex flex-col gap-4">
      <div>
        <p className="font-extrabold text-white">Resume Analyzer</p>
        <p className="text-xs text-white/50">Upload your resume</p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`flex flex-col items-center justify-center rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragging ? "bg-[#a78bfa]/5" : "bg-transparent"}`}
        style={{
          minHeight: "240px",
          border: `1.5px dashed ${isDragging ? "#a78bfa" : "rgba(255,255,255,0.25)"}`,
        }}
      >
        {stage === "idle" && (
          <div className="animate-[fadeUp_0.4s_ease_both] flex flex-col items-center gap-2">
            <UploadCloud size={32} className="text-purple-300" />
            <p className="text-white font-semibold">Drop your resume</p>
            <p className="text-xs text-white/40">Only PDF - click to browse</p>
          </div>
        )}
        {stage === "ready" && uploaded && (
          <div className="animate-[fadeUp_0.4s_ease_both] flex flex-col items-center gap-3">
            {uploaded.isImage
              ? <ImageIcon size={42} className="text-purple-400" />
              : <FileText size={42} className="text-purple-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            }
            <p className="text-white text-sm font-medium truncate max-w-[200px]">{uploaded.file.name}</p>
            <p className="text-xs text-white/40">{uploaded.sizeLabel}</p>
            <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-xs underline underline-offset-2 text-red-400/60">
              Remove
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleInputChange} />
      </div>

      <button
        onClick={handleAnalyzeClick}
        disabled={!uploaded}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
        style={{
          background: uploaded ? "#FFD000" : "rgba(0,0,0,0.25)",
          color: uploaded ? "#1a0e00" : "rgba(255,255,255,0.3)",
          cursor: uploaded ? "pointer" : "not-allowed",
        }}
      >
        <Zap size={14} />
        Analyze Resume
      </button>
    </div>
  );
}