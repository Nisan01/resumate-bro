"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, CheckCircle2, Loader2, Zap, Target, MessageSquare,
  Brain, Star, ArrowRight, ChevronRight, Lightbulb, TrendingUp,
  Shield, Cpu, Globe, Code2, Layers, BarChart3, X
} from "lucide-react";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import { ProjectSkeleton } from "./_components/skeleton/Skeleton";
import { AnalysisSkeleton } from "./_components/skeletonpg/SkeletonParagraph";

// ── Types ──
interface Project {
  id: number;
  emoji: string;
  color: string;
  status: "active" | "progress" | "planning" | "done";
  statusLabel: string;
  pct: number;
  grad: string;
  name: string;
  desc: string;
  tags: string[];
  steps: string[];
}

interface AnalysisResult {
  project_name: string;
  projectEmoji: string;
  summary: string;
  analysis: { good: string[] };
  follow_up: string[];
  overall_feedback: string;
}

// ── DB → UI mapping helpers ──
const COLORS = ["purple", "teal", "blue", "pink", "orange", "green"];
const GRADS  = [
  "from-[#c4b0ff] to-[#ff9de2]",
  "from-[#6effc0] to-[#7ee8fa]",
  "from-[#7ee8fa] to-[#c4b0ff]",
  "from-[#ff9de2] to-[#c4b0ff]",
  "from-[#ffb088] to-[#ffe082]",
  "from-[#6effc0] to-[#c4b0ff]",
];
const STATUS_LABELS: Record<string, string> = {
  active: "Active", progress: "In Progress", planning: "Planning", done: "Done",
};

function pickIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % COLORS.length;
}

function mapDbRow(row: {
  id: string; name: string; emoji?: string | null; status?: string | null;
  description?: string | null; techTags?: string[] | null; steps?: string[] | null; progress?: number | null;
}): Project {
  const idx = pickIndex(row.id);
  const status = (row.status ?? "planning") as Project["status"];
  return {
    id: row.id as unknown as number,
    emoji: row.emoji || "🚀",
    color: COLORS[idx], status,
    statusLabel: STATUS_LABELS[status] ?? "Planning",
    pct: row.progress ?? 0,
    grad: GRADS[idx], name: row.name,
    desc: row.description || "",
    tags: row.techTags ?? [], steps: row.steps ?? [],
  };
}

const cardAccent: Record<string, string> = {
  purple: "before:from-[#c4b0ff] before:to-[#ff9de2]",
  teal:   "before:from-[#6effc0] before:to-[#7ee8fa]",
  blue:   "before:from-[#7ee8fa] before:to-[#c4b0ff]",
  pink:   "before:from-[#ff9de2] before:to-[#c4b0ff]",
  orange: "before:from-[#ffb088] before:to-[#ffe082]",
  green:  "before:from-[#6effc0] before:to-[#c4b0ff]",
};
const statusStyle: Record<string, string> = {
  active:   "bg-[#6effc0]/10 text-[#6effc0] border border-[#6effc0]/25",
  progress: "bg-[#c4b0ff]/14 text-[#d4c6ff] border border-[#c4b0ff]/25",
  planning: "bg-[#ffe082]/10 text-[#ffe082] border border-[#ffe082]/22",
  done:     "bg-[#6effc0]/22 text-[#6effc0] border border-[#6effc0]/40",
};

// ── Scanning Heading (shown while analyzing) ──
function ScanningHeading() {
  return (
    <div className="mt-10 mb-2 w-full flex flex-col items-center gap-4 py-10">
      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute w-20 h-20 rounded-full border border-[#c4b0ff]/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute w-14 h-14 rounded-full border border-[#7ee8fa]/30 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.4s" }} />
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c4b0ff]/30 to-[#7ee8fa]/20 border border-[#c4b0ff]/40 flex items-center justify-center">
          <Brain size={18} className="text-[#c4b0ff] animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-[22px] font-bold tracking-tight bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] bg-clip-text text-transparent">
          AI Analysis Scanning
        </h2>
        <p className="text-[12px] text-[#dcd7ff]/40 mt-1">Processing your project with intelligence...</p>
      </div>
      <AnalysisSkeleton />
    </div>
  );
}

// ── Glowing section icons ──
const sectionIcons = {
  overview:  { icon: Globe,       color: "#7ee8fa", bg: "bg-[#7ee8fa]/10",  border: "border-[#7ee8fa]/20",  glow: "shadow-[0_0_18px_rgba(126,232,250,0.25)]" },
  standouts: { icon: Star,        color: "#ffe082", bg: "bg-[#ffe082]/10",  border: "border-[#ffe082]/20",  glow: "shadow-[0_0_18px_rgba(255,224,130,0.25)]" },
  followup:  { icon: Lightbulb,   color: "#ff9de2", bg: "bg-[#ff9de2]/10",  border: "border-[#ff9de2]/20",  glow: "shadow-[0_0_18px_rgba(255,157,226,0.25)]" },
  feedback:  { icon: TrendingUp,  color: "#6effc0", bg: "bg-[#6effc0]/10",  border: "border-[#6effc0]/20",  glow: "shadow-[0_0_18px_rgba(110,255,192,0.25)]" },
};

// ── Analysis Result Card ──
function AnalysisCard({ result, onClose }: { result: AnalysisResult; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [result]);

  return (
    <div ref={ref} className="mt-10">

      {/* ── Report heading ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c4b0ff]/25 to-[#7ee8fa]/15 border border-[#c4b0ff]/30 flex items-center justify-center shadow-[0_0_20px_rgba(196,176,255,0.3)]">
            <Brain size={16} className="text-[#c4b0ff]" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold tracking-tight bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] bg-clip-text text-transparent">
              AI Analysis Report
            </h2>
            <p className="text-[11px] text-[#dcd7ff]/35 -mt-0.5">Powered by Claude AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6effc0]/10 border border-[#6effc0]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6effc0] animate-pulse" />
            <span className="text-[10px] font-semibold text-[#6effc0]">Analysis Complete</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/8 rounded-lg text-[#dcd7ff]/40 hover:text-white hover:bg-white/10 transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Project identity bar ── */}
      <div className="flex items-center gap-4 mb-6 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#c4b0ff]/6 via-[#7ee8fa]/4 to-[#ff9de2]/6 border border-[#c4b0ff]/14">
        <span className="text-3xl">{result.projectEmoji}</span>
        <div className="flex-1">
          <p className="font-bold text-white text-[16px] leading-tight">{result.project_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Cpu size={10} className="text-[#c4b0ff]" />
            <span className="text-[10px] text-[#dcd7ff]/45">Analyzed with Claude Sonnet</span>
          </div>
        </div>
        <div className="flex gap-2">
          {["overview", "standouts", "followup", "feedback"].map((s) => {
            const cfg = sectionIcons[s as keyof typeof sectionIcons];
            const Icon = cfg.icon;
            return (
              <div key={s} className={`w-7 h-7 rounded-lg ${cfg.bg} border ${cfg.border} ${cfg.glow} flex items-center justify-center`}>
                <Icon size={12} style={{ color: cfg.color }} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Overview ── */}
        <div className="rounded-2xl border border-[#7ee8fa]/14 bg-white/[0.025] overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-5 pb-3">
            <div className={`w-8 h-8 rounded-xl ${sectionIcons.overview.bg} border ${sectionIcons.overview.border} ${sectionIcons.overview.glow} flex items-center justify-center`}>
              <Globe size={14} style={{ color: sectionIcons.overview.color }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#7ee8fa]/70">Project Overview</p>
          </div>
          <div className="px-6 pb-6">
            <p className="text-[13.5px] text-[#dcd7ff]/70 leading-[1.85] font-light">{result.summary}</p>
          </div>
        </div>

        {/* ── Standouts ── */}
        <div className="rounded-2xl border border-[#ffe082]/14 bg-white/[0.025] overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${sectionIcons.standouts.bg} border ${sectionIcons.standouts.border} ${sectionIcons.standouts.glow} flex items-center justify-center`}>
                <Star size={14} style={{ color: sectionIcons.standouts.color }} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#ffe082]/70">Standouts</p>
            </div>
            <span className="text-[10px] font-bold text-[#ffe082]/60 bg-[#ffe082]/8 border border-[#ffe082]/20 px-2.5 py-1 rounded-full">
              {result.analysis.good.length} highlights
            </span>
          </div>
          <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {result.analysis.good.map((point, i) => (
              <div key={i} className="group flex items-start gap-3 p-3.5 rounded-[14px] bg-[#ffe082]/4 border border-[#ffe082]/10 hover:border-[#ffe082]/25 hover:bg-[#ffe082]/8 transition-all duration-200">
                <div className="w-5 h-5 rounded-full bg-[#ffe082]/15 border border-[#ffe082]/25 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#ffe082]/25 transition-all">
                  <CheckCircle2 size={11} className="text-[#ffe082]" />
                </div>
                <span className="text-[12.5px] text-[#dcd7ff]/70 leading-[1.6]">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Follow Up ── */}
        <div className="rounded-2xl border border-[#ff9de2]/14 bg-white/[0.025] overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${sectionIcons.followup.bg} border ${sectionIcons.followup.border} ${sectionIcons.followup.glow} flex items-center justify-center`}>
                <Lightbulb size={14} style={{ color: sectionIcons.followup.color }} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#ff9de2]/70">Follow Up Actions</p>
            </div>
            <span className="text-[10px] font-bold text-[#ff9de2]/60 bg-[#ff9de2]/8 border border-[#ff9de2]/20 px-2.5 py-1 rounded-full">
              {result.follow_up.length} actions
            </span>
          </div>
          <div className="px-6 pb-6 flex flex-col gap-2">
            {result.follow_up.map((point, i) => (
              <div key={i} className="group flex items-start gap-3 p-3.5 rounded-[14px] bg-[#ff9de2]/4 border border-[#ff9de2]/10 hover:border-[#ff9de2]/25 hover:bg-[#ff9de2]/8 transition-all duration-200">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ff9de2]/15 border border-[#ff9de2]/25 flex-shrink-0 mt-0.5 group-hover:bg-[#ff9de2]/25 transition-all">
                  <ArrowRight size={10} className="text-[#ff9de2]" />
                </div>
                <span className="text-[12.5px] text-[#dcd7ff]/70 leading-[1.6]">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Overall Feedback ── */}
        <div className="rounded-2xl border border-[#6effc0]/14 bg-white/[0.025] overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-5 pb-3">
            <div className={`w-8 h-8 rounded-xl ${sectionIcons.feedback.bg} border ${sectionIcons.feedback.border} ${sectionIcons.feedback.glow} flex items-center justify-center`}>
              <TrendingUp size={14} style={{ color: sectionIcons.feedback.color }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#6effc0]/70">Overall Feedback</p>
          </div>
          {/* Accent line */}
          <div className="mx-6 h-px bg-gradient-to-r from-[#6effc0]/30 via-[#7ee8fa]/20 to-transparent mb-4" />
          <div className="px-6 pb-6">
            <p className="text-[13.5px] text-[#dcd7ff]/70 leading-[1.85] font-light">{result.overall_feedback}</p>
          </div>
        </div>

      </div>

      {/* ── Footer badge ── */}
      <div className="flex items-center justify-center gap-2 mt-6 py-3">
        <Sparkles size={10} className="text-[#c4b0ff]/40" />
        <span className="text-[10px] text-[#dcd7ff]/25 tracking-wide">Generated by Claude AI · Resumate Bro</span>
        <Sparkles size={10} className="text-[#c4b0ff]/40" />
      </div>
    </div>
  );
}

// ── Analyze Dialog ──
function AnalyzeDialog({ project, onClose, onSubmit }: {
  project: Project; onClose: () => void; onSubmit: (context: string) => void;
}) {
  const [context, setContext] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080b12]/88 backdrop-blur-[14px]" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="animate-[fadeUp_0.35s_ease_both] relative bg-[#0d1120] border border-[#c4b0ff]/22 rounded-[22px] p-8 w-[500px] max-w-[92vw]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#c4b0ff]/60 to-transparent" />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 border border-white/8 rounded-lg text-[#dcd7ff]/45 hover:text-white hover:bg-[#c4b0ff]/12 transition-all text-sm">✕</button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4b0ff]/20 to-[#7ee8fa]/10 border border-[#c4b0ff]/25 flex items-center justify-center text-xl">{project.emoji}</div>
          <div>
            <p className="font-bold text-white text-sm">{project.name}</p>
            <p className="text-[11px] text-[#dcd7ff]/45">AI Project Analysis</p>
          </div>
        </div>
        <div className="h-px bg-white/6 mb-6" />
        <div className="mb-6">
          <label className="block text-[11px] font-bold uppercase tracking-[.8px] text-[#dcd7ff]/45 mb-2">
            Additional Context <span className="normal-case tracking-normal font-normal text-[10px]">(optional)</span>
          </label>
          <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={4}
            placeholder="e.g. This is for a fintech startup targeting enterprise clients..."
            className="w-full bg-white/4 border border-white/10 rounded-[10px] px-3.5 py-2.5 text-[#f0eeff] text-[13px] placeholder-[#dcd7ff]/30 focus:outline-none focus:border-[#c4b0ff]/45 focus:bg-[#c4b0ff]/4 transition-all resize-none"
          />
          <p className="text-[10px] text-[#dcd7ff]/30 mt-1.5">The AI will use this context to tailor the analysis to your specific situation.</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => onSubmit(context)} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] text-[#0a0714] font-bold text-[13px] py-2.5 rounded-[10px] hover:brightness-110 hover:-translate-y-px transition-all shadow-[0_4px_28px_rgba(196,176,255,0.30)]">
            <Sparkles size={14} /> Analyze Project
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-[10px] bg-white/4 border border-white/8 text-[#dcd7ff]/70 text-[13px] font-medium hover:border-[#c4b0ff]/35 hover:text-white transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Project Modal ──
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [progWidth, setProgWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setProgWidth(project.pct), 60); return () => clearTimeout(t); }, [project]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080b12]/88 backdrop-blur-[14px]" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative bg-[#0d1120] border border-[#c4b0ff]/22 rounded-[22px] p-8 w-[560px] max-w-[92vw] max-h-[95vh] overflow-y-scroll">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 border border-white/8 rounded-lg text-[#dcd7ff]/45 hover:bg-[#c4b0ff]/12 hover:text-white transition-all text-sm">✕</button>
        <span className="text-[42px] block mb-4">{project.emoji}</span>
        <div className="text-[22px] font-bold mb-2 leading-tight">{project.name}</div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyle[project.status]}`}>{project.statusLabel}</span>
        </div>
        <p className="text-[13.5px] text-[#dcd7ff]/70 leading-[1.75] mb-5 font-light">{project.desc}</p>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tags.map((t) => <span key={t} className="text-[11px] font-medium px-3 py-1 rounded-full border border-[#c4b0ff]/20 text-[#d4c6ff] bg-[#c4b0ff]/7">{t}</span>)}
        </div>
        {project.steps.length > 0 && (
          <>
            <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#dcd7ff]/45 mb-3">Build Roadmap</div>
            <div className="flex flex-col gap-2.5 mb-6">
              {project.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="min-w-[24px] h-6 rounded-[7px] bg-[#c4b0ff]/10 border border-[#c4b0ff]/25 flex items-center justify-center text-[10px] font-bold text-[#c4b0ff] flex-shrink-0">{i + 1}</span>
                  <span className="text-[13px] text-[#dcd7ff]/70 leading-[1.55] pt-0.5">{s}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#dcd7ff]/45 mb-3">Progress</div>
        <div className="flex justify-between text-[11px] text-[#dcd7ff]/45 mb-1.5"><span>{project.statusLabel}</span><span>{project.pct}%</span></div>
        <div className="h-2 bg-white/6 rounded-full overflow-hidden mb-6">
          <div className={`h-full rounded-full bg-gradient-to-r ${project.grad} transition-all duration-1000 ease-out`} style={{ width: `${progWidth}%` }} />
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button className="bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] text-[#0a0714] font-bold text-[13px] px-[18px] py-2.5 rounded-[10px] hover:brightness-110 hover:-translate-y-px transition-all shadow-[0_4px_28px_rgba(196,176,255,0.30)]">Open Project →</button>
          <button onClick={onClose} className="text-[13px] font-medium px-4 py-2.5 rounded-[10px] bg-white/4 border border-white/8 text-[#dcd7ff]/70 hover:border-[#c4b0ff]/35 hover:text-white transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Project Modal ──
function AddProjectModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Project) => void }) {
  const [name, setName] = useState(""); const [emoji, setEmoji] = useState("");
  const [status, setStatus] = useState<Project["status"]>("active");
  const [desc, setDesc] = useState(""); const [tags, setTags] = useState("");
  const [steps, setSteps] = useState(""); const [pct, setPct] = useState(0);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const submit = () => {
    const e: Record<string, boolean> = {};
    if (!name.trim()) e.name = true;
    if (!desc.trim()) e.desc = true;
    if (Object.keys(e).length) { setErrors(e); return; }
    const tempId = `temp-${Date.now()}`; const idx = pickIndex(tempId);
    onAdd({ id: tempId as unknown as number, emoji: emoji.trim() || "🚀", color: COLORS[idx], status, statusLabel: STATUS_LABELS[status], pct, grad: GRADS[idx], name: name.trim(), desc: desc.trim(), tags: tags.split(",").map((t) => t.trim()).filter(Boolean), steps: steps.split("\n").map((s) => s.trim()).filter(Boolean) });
    onClose();
  };

  const inputCls = (field: string) =>
    `w-full bg-white/4 border ${errors[field] ? "border-red-400/60" : "border-white/10"} rounded-[10px] px-3.5 py-2.5 text-[#f0eeff] text-[13.5px] placeholder-[#dcd7ff]/35 focus:outline-none focus:border-[#c4b0ff]/45 focus:bg-[#c4b0ff]/4 transition-all`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#080b12]/92 backdrop-blur-[16px]" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative bg-[#0d1120] border border-[#c4b0ff]/28 rounded-[22px] p-9 w-[580px] max-w-[94vw] max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 border border-white/8 rounded-lg text-[#dcd7ff]/45 hover:bg-[#c4b0ff]/12 hover:text-white transition-all text-sm">✕</button>
        <div className="text-[20px] font-bold mb-1">Add New Project</div>
        <div className="text-[12px] text-[#dcd7ff]/45 mb-6">Share a project with the Resumate Bro community</div>
        <div className="h-px bg-white/6 mb-5" />
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-[.8px] text-[#dcd7ff]/45 mb-1.5">Project Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls("name")} placeholder="e.g. AI Resume Parser" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.8px] text-[#dcd7ff]/45 mb-1.5">Emoji Icon</label>
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className={inputCls("")} placeholder="🚀" maxLength={2} />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.8px] text-[#dcd7ff]/45 mb-1.5">Status *</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])} className={`${inputCls("")} cursor-pointer`}>
              <option value="active">Active</option><option value="progress">In Progress</option>
              <option value="planning">Planning</option><option value="done">Done</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-[.8px] text-[#dcd7ff]/45 mb-1.5">Description *</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className={inputCls("desc")} rows={3} placeholder="Describe what this project does..." />
        </div>
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-[.8px] text-[#dcd7ff]/45 mb-1.5">Tech Tags <span className="normal-case tracking-normal font-normal text-[10px]">(comma-separated)</span></label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls("")} placeholder="React, FastAPI, Claude API..." />
        </div>
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-[.8px] text-[#dcd7ff]/45 mb-1.5">Build Steps <span className="normal-case tracking-normal font-normal text-[10px]">(one per line)</span></label>
          <textarea value={steps} onChange={(e) => setSteps(e.target.value)} className={inputCls("")} rows={4} placeholder={"Set up FastAPI service\nBuild React frontend\nDeploy on Vercel"} />
        </div>
        <div className="mb-6">
          <label className="block text-[11px] font-bold uppercase tracking-[.8px] text-[#dcd7ff]/45 mb-1.5">Progress %</label>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="flex-1 accent-[#c4b0ff]" />
            <span className="text-[13px] font-bold text-[#c4b0ff] min-w-[36px] text-right">{pct}%</span>
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button onClick={submit} className="bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] text-[#0a0714] font-bold text-[13px] px-[18px] py-2.5 rounded-[10px] hover:brightness-110 hover:-translate-y-px transition-all shadow-[0_4px_28px_rgba(196,176,255,0.30)]">✦ Add Project</button>
          <button onClick={onClose} className="text-[13px] font-medium px-4 py-2.5 rounded-[10px] bg-white/4 border border-white/8 text-[#dcd7ff]/70 hover:border-[#c4b0ff]/35 hover:text-white transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function ProjectsPage() {
  const [projects, setProjects]               = useState<Project[]>([]);
  const [filter, setFilter]                   = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [hoveredId, setHoveredId]             = useState<number | null>(null);
  const [analyzeProject, setAnalyzeProject]   = useState<Project | null>(null);
  const [analyzing, setAnalyzing]             = useState(false);
  const [analysisResult, setAnalysisResult]   = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError]     = useState<string | null>(null);
  const [ready, setReady]                     = useState(false);

  // Ref to scroll into view when analysis starts
  const analysisSectionRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  // ── Fetch projects ──
  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      try {
        const res = await fetch(`/api/projects/get-projects?userId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProjects(data.projects.map(mapDbRow));
        setReady(true);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        toast.error("Failed to load projects");
      }
    };
    fetchProjects();
  }, [user]);

  // ── Add project ──
  const handleAdd = async (optimistic: Project) => {
    if (!user) { toast.error("You must be logged in to add a project"); return; }
    setProjects((prev) => [optimistic, ...prev]);
    try {
      const res = await fetch("/api/projects/save-projects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: optimistic.name, emoji: optimistic.emoji, status: optimistic.status, description: optimistic.desc, techTags: optimistic.tags, steps: optimistic.steps, progress: optimistic.pct }),
      });
      if (!res.ok) throw new Error("Failed to save project");
      const { project: saved } = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === optimistic.id ? mapDbRow(saved) : p)));
      toast.success("✦ Project added successfully!");
    } catch (error) {
      console.error(error);
      setProjects((prev) => prev.filter((p) => p.id !== optimistic.id));
      toast.error("❌ Failed to save project");
    }
  };

  // ── Analyze — scroll immediately then run the API ──
  const handleAnalyzeSubmit = async (context: string) => {
    if (!analyzeProject) return;
    const project = analyzeProject;
    setAnalyzeProject(null);
    setAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    // Scroll to the analysis section right away so user sees the scanning state
    setTimeout(() => {
      analysisSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    try {
      const res = await fetch("/api/projects/projects-ai-analyzer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, projectContext: context || undefined }),
      });
      if (!res.ok) {
        let detail = "";
        try { const j = await res.json(); detail = j?.error ?? ""; } catch {}
        throw new Error(detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setAnalysisResult({ ...data, projectEmoji: project.emoji });
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setAnalysisError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelectedProject(null); setShowAddModal(false); setAnalyzeProject(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filters = ["all", "active", "progress", "planning", "done"];
  const filterLabels: Record<string, string> = { all: "All", active: "Active", progress: "In Progress", planning: "Planning", done: "Done" };

  return (
    <div className="min-h-screen text-[#f0eeff] font-sans">
      <div className="relative z-10 md:max-w-6xl mx-auto px-9 pt-10 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-[fadeUp_0.5s_ease_both]">
          <div className="inline-flex items-center gap-1.5 bg-[#c4b0ff]/8 border border-[#c4b0ff]/20 rounded-full px-3.5 py-1.5 text-[11.5px] text-[#c4b0ff] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ee8fa]" />
            AI-Powered Career Intelligence
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] text-[#0a0714] font-bold text-[13px] px-[18px] py-2.5 rounded-[10px] hover:brightness-110 hover:-translate-y-px transition-all shadow-[0_4px_28px_rgba(196,176,255,0.30)]">
            + New Project
          </button>
        </div>

        {/* Hero */}
        <div className="mb-9 animate-[fadeUp_0.5s_ease_both]" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-[clamp(2rem,5vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.03em] mb-2">
            Build the Features<br />
            Behind{" "}
            <em className="not-italic bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] bg-clip-text text-transparent">Resumate Bro</em>
          </h1>
          <p className="text-[14px] text-[#dcd7ff]/70 leading-[1.7] max-w-[500px]">
            A curated list of real sub-projects that make up the Resumate Bro platform. Hover any card to analyze it with AI.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-[fadeUp_0.5s_ease_both]" style={{ animationDelay: "0.2s" }}>
          <div className="flex gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-[12px] font-semibold px-4 py-1.5 rounded-full border transition-all ${filter === f ? "bg-gradient-to-r from-[#c4b0ff] to-[#7ee8fa] text-[#0a0714] border-transparent" : "border-white/8 text-[#dcd7ff]/45 bg-white/3 hover:border-[#c4b0ff]/30 hover:text-[#d4c6ff]"}`}>
                {filterLabels[f]}
              </button>
            ))}
          </div>
          <span className="text-[12px] text-[#dcd7ff]/45">
            Showing <strong className="text-[#d4c6ff]">{filtered.length}</strong> of {projects.length} projects
          </span>
        </div>

        {/* Loading skeleton */}
        {!ready && (
          <div className="grid grid-cols-3 gap-[18px] max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
            {Array.from({ length: 6 }).map((_, i) => <ProjectSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && ready && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center animate-[fadeUp_0.5s_ease_both]">
            <span className="text-5xl">🚀</span>
            <p className="text-[15px] font-semibold text-[#dcd7ff]/60">No projects yet</p>
            <p className="text-[13px] text-[#dcd7ff]/35 max-w-xs">Hit <strong className="text-[#d4c6ff]">+ New Project</strong> to add your first one.</p>
          </div>
        )}

        {/* Grid */}
        {projects.length > 0 && ready && (
          <div className="grid grid-cols-3 gap-[18px] max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
            {filtered.map((p, i) => (
              <div
                key={String(p.id)}
                onClick={() => setSelectedProject(p)}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 p-[22px] cursor-pointer bg-white/[0.035] backdrop-blur-[8px] hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(0,0,0,.4),0_0_0_1px_rgba(196,176,255,.14)] hover:border-[#c4b0ff]/25 hover:bg-white/[0.058] transition-all duration-[220ms] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:rounded-t-2xl before:bg-gradient-to-r ${cardAccent[p.color]}`}
                style={{ animationDelay: `${i * 0.05 + 0.04}s` }}
              >
                <span className="text-[26px] block mb-3.5">{p.emoji}</span>
                <div className="text-[15px] font-bold mb-1.5 leading-[1.25]">{p.name}</div>
                <p className="text-[12.5px] text-[#dcd7ff]/70 leading-[1.65] mb-[18px] font-light">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-[18px]">
                  {p.tags.map((t) => <span key={t} className="text-[10px] font-semibold px-2 py-1 rounded-full border border-white/8 text-[#dcd7ff]/45 bg-white/4">{t}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-[.6px] px-2.5 py-1 rounded-full ${statusStyle[p.status]}`}>{p.statusLabel}</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#dcd7ff]/45 font-semibold">
                    <div className="w-[52px] h-[5px] bg-white/8 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${p.grad}`} style={{ width: `${p.pct}%` }} />
                    </div>
                    {p.pct}%
                  </div>
                </div>
                {/* Hover Analyze Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center rounded-2xl transition-all duration-200 ${hoveredId === p.id ? "opacity-100" : "opacity-0 pointer-events-none"}`} style={{ background: "rgba(8,11,18,0.78)", backdropFilter: "blur(4px)" }}>
                  <button onClick={(e) => { e.stopPropagation(); setAnalyzeProject(p); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] text-[#0a0714] font-bold text-[13px] shadow-[0_4px_28px_rgba(196,176,255,0.40)] hover:brightness-110 hover:scale-105 transition-all">
                    <Sparkles size={14} /> Analyze with AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Analysis section anchor ── */}
        <div ref={analysisSectionRef} className="scroll-mt-8">
          {/* Scanning state */}
          {analyzing && <ScanningHeading />}

          {/* Error */}
          {analysisError && !analyzing && (
            <div className="animate-[fadeUp_0.4s_ease_both] mt-10 flex items-center justify-between gap-4 py-5 px-7 rounded-[18px] border border-red-400/25 bg-red-400/5">
              <p className="text-[13px] text-red-300/80">{analysisError}</p>
              <button onClick={() => setAnalysisError(null)} className="text-[11px] font-semibold text-red-400/60 hover:text-red-300 transition-colors flex-shrink-0">Dismiss</button>
            </div>
          )}

          {/* Result */}
          {analysisResult && !analyzing && (
            <AnalysisCard result={analysisResult} onClose={() => setAnalysisResult(null)} />
          )}
        </div>

      </div>

      {/* Modals */}
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {showAddModal     && <AddProjectModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
      {analyzeProject   && <AnalyzeDialog project={analyzeProject} onClose={() => setAnalyzeProject(null)} onSubmit={handleAnalyzeSubmit} />}
    </div>
  );
}