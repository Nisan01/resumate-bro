"use client";

import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle2, AlertCircle, XCircle, User,
  Star, TrendingUp, Layers, Phone, Mail,
  BookOpenText, Cat, MapPin, FileText,
  Target, Brain, ShieldCheck, Award,
} from "lucide-react";

import ProgressBar from "./_components/ProgressBar";
import CertCard from "./_components/CertCard";
import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Status = "good" | "ok" | "missing";

interface Props {
  analysis: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:      "#080b12",
  text:    "#f0eeff",
  muted:   "rgba(220,215,255,0.75)",
  muted2:  "rgba(220,215,255,0.50)",
  accent1: "#c4b0ff",
  accent2: "#ff9de2",
  accent3: "#7ee8fa",
  accent4: "#a5f3a0",
  border:  "rgba(255,255,255,0.08)",
  glass:   "rgba(8,11,22,0.50)",
  heroBg:  "rgba(255,255,255,0.025)",
  heroBdr: "rgba(196,176,255,0.22)",
};

const KEYFRAMES = `
section[id] { scroll-margin-top: 100px; }

@keyframes shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes bpulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.42; transform: scale(0.7); }
}
@keyframes skeletonPulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.8; }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(196,176,255,0.15), 0 0 40px rgba(196,176,255,0.08); }
  50%      { box-shadow: 0 0 30px rgba(196,176,255,0.30), 0 0 60px rgba(196,176,255,0.15); }
}
@keyframes glowPulseCyan {
  0%, 100% { box-shadow: 0 0 20px rgba(126,232,250,0.15), 0 0 40px rgba(126,232,250,0.08); }
  50%      { box-shadow: 0 0 30px rgba(126,232,250,0.30), 0 0 60px rgba(126,232,250,0.15); }
}
@keyframes glowPulsePink {
  0%, 100% { box-shadow: 0 0 20px rgba(255,157,226,0.12), 0 0 40px rgba(255,157,226,0.06); }
  50%      { box-shadow: 0 0 28px rgba(255,157,226,0.25), 0 0 55px rgba(255,157,226,0.12); }
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
@keyframes iconGlow {
  0%, 100% { filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 0 14px currentColor); }
  50%      { filter: drop-shadow(0 0 14px currentColor) drop-shadow(0 0 32px currentColor); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes badgePop {
  0%   { opacity: 0; transform: scale(0.80); }
  60%  { transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}

.anim-shimmer  { animation: shimmer 5s linear infinite; background-size: 200% 200%; }
.anim-bpulse   { animation: bpulse 2.4s ease-in-out infinite; }
.anim-skeleton { animation: skeletonPulse 1.6s ease-in-out infinite; }
.anim-glow-purple { animation: glowPulse 3s ease-in-out infinite; }
.anim-glow-cyan   { animation: glowPulseCyan 3s ease-in-out infinite; }
.anim-glow-pink   { animation: glowPulsePink 3.5s ease-in-out infinite; }
.anim-float       { animation: float 3.2s ease-in-out infinite; }
.anim-icon-glow   { animation: iconGlow 2.5s ease-in-out infinite; }
.anim-spin        { animation: spin 0.9s linear infinite; }
.anim-badge-pop   { animation: badgePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }

.gt-purple-cyan {
  background: linear-gradient(100deg, #c4b0ff 0%, #7ee8fa 50%, #ff9de2 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.gt-cyan-purple {
  background: linear-gradient(135deg, #7ee8fa 0%, #c4b0ff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.gt-purple-pink {
  background: linear-gradient(135deg, #c4b0ff 0%, #ff9de2 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.gt-cyan-pink {
  background: linear-gradient(135deg, #7ee8fa 0%, #ff9de2 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.gt-all {
  background: linear-gradient(135deg, #c4b0ff 0%, #7ee8fa 50%, #ff9de2 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-card {
  background: rgba(13,16,32,0.80);
  border: 1px solid rgba(196,176,255,0.15);
  border-radius: 20px;
  backdrop-filter: blur(32px) saturate(160%);
  transition: box-shadow 0.35s ease, border-color 0.35s ease, transform 0.25s ease;
}
.glass-card:hover {
  border-color: rgba(196,176,255,0.35);
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.55), 0 0 40px rgba(196,176,255,0.12);
}

.nav-link {
  color: rgba(220,215,255,0.45);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
  cursor: pointer;
  background: none;
}
.nav-link:hover {
  color: #c4b0ff;
  background: rgba(196,176,255,0.08);
  border-color: rgba(196,176,255,0.20);
}
.nav-link.active {
  color: #c4b0ff;
  background: rgba(196,176,255,0.10);
  border-color: rgba(196,176,255,0.25);
}

.score-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.score-card-hover:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: rgba(196,176,255,0.30) !important;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4), 0 0 20px rgba(196,176,255,0.12);
}

.signal-row {
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.signal-row:hover {
  background: rgba(196,176,255,0.06) !important;
  border-color: rgba(196,176,255,0.18) !important;
  transform: translateX(3px);
}

.contact-item {
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.js-reveal {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.22,0.88,0.34,1);
}
.js-reveal.visible { opacity: 1; transform: translateY(0); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCORE CALCULATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function computeOverallScore(analysis: Record<string, any>): number | null {
  const raw = [
    analysis?.contactInfo?.overall_score,
    analysis?.summary?.overall_score,
    analysis?.workExperience?.overall_score,
    analysis?.skills?.overall_score,
    analysis?.atsEvaluation?.overallATSScore,
    analysis?.certifications?.overall_score,
  ].filter((s): s is number => typeof s === "number");

  if (raw.length === 0) return null;
  const avg = raw.reduce((a, b) => a + b, 0) / raw.length;
  return Math.round(avg * 10);
}

function computePostFix(overall: number): number {
  return Math.min(100, overall + Math.round((100 - overall) * 0.55));
}

function computeAtsPct(atsScore: number): number {
  return Math.round(30 + (atsScore / 10) * 60);
}

function computeAtsPostFix(atsPct: number): number {
  return Math.min(95, atsPct + Math.round((95 - atsPct) * 0.60));
}

// ─────────────────────────────────────────────────────────────────────────────
// VERDICT TIER CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const VERDICT_TIERS = [
  { max: 20,  color: "#ef4444", border: "rgba(239,68,68,0.25)",    bg: "rgba(239,68,68,0.07)",    label: "Critical",   sub: "Major overhaul needed",          path: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" },
  { max: 40,  color: "#f97316", border: "rgba(249,115,22,0.25)",   bg: "rgba(249,115,22,0.07)",   label: "Needs Work", sub: "Significant fixes required",      path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { max: 60,  color: "#f59e0b", border: "rgba(245,158,11,0.25)",   bg: "rgba(245,158,11,0.07)",   label: "Average",    sub: "Follow the priority fixes",       path: "M12 2a6 6 0 016 6c0 3-2.5 5.5-5 8.5C10.5 13.5 8 11 8 8a6 6 0 016-6zm0 20v-4m-4 4h8" },
  { max: 80,  color: "#22c55e", border: "rgba(34,197,94,0.25)",    bg: "rgba(34,197,94,0.07)",    label: "Good",       sub: "Solid — polish it up",            path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-2-7l-2-2 1.4-1.4L10 12.2l4.6-4.6L16 9l-6 6z" },
  { max: 90,  color: "#7ee8fa", border: "rgba(126,232,250,0.25)",  bg: "rgba(126,232,250,0.07)",  label: "Strong",     sub: "Above average — almost there",    path: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" },
  { max: 101, color: "#c4b0ff", border: "rgba(196,176,255,0.30)",  bg: "rgba(196,176,255,0.08)",  label: "Elite",      sub: "Interview-ready",                 path: "M8 21h8m-4-4v4M5 8h14l-1.5 7H6.5L5 8zm-2 0l2-5h14l2 5" },
];

function getTier(score: number) {
  return VERDICT_TIERS.find(t => score < t.max) ?? VERDICT_TIERS[5];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const statusCfg = {
  good:    { icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",  label: "Good"    },
  ok:      { icon: AlertCircle,  color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "OK"      },
  missing: { icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  label: "Missing" },
};

function scoreColor(s: number) {
  return s >= 7 ? "#22c55e" : s >= 4 ? "#f59e0b" : "#ef4444";
}

function Pill({ status }: { status: Status }) {
  const c = statusCfg[status];
  const I = c.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>
      <I size={9} />{c.label}
    </span>
  );
}

function Ring({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = Math.min(score / 10, 1) * circ;
  const color = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${fill} ${circ-fill}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size < 44 ? 8 : 10} fontWeight="700" fontFamily="'DM Mono', monospace">
        {Number.isInteger(score) ? score : score.toFixed(1)}
      </text>
    </svg>
  );
}

function ScoreDisplay({ score }: { score: number | null }) {
  if (score == null) return (
    <div className="anim-skeleton" style={{ width: 80, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.06)" }} />
  );
  const col = scoreColor(score);
  const display = Number.isInteger(score) ? score * 10 : Math.round(score * 10);
  return (
    <div className="flex items-baseline gap-1">
      <span style={{ fontSize: 36, fontWeight: 900, color: col, fontFamily: "'DM Mono', monospace", lineHeight: 1, textShadow: `0 0 20px ${col}66` }}>
        {display}
      </span>
      <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.20)", fontFamily: "'DM Mono', monospace" }}>/100</span>
    </div>
  );
}

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`glass-card ${className}`} style={{ padding: 0, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase mb-[18px]"
      style={{ color: "rgba(220,215,255,0.50)" }}>
      {children}
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(196,176,255,0.15),transparent)" }} />
    </div>
  );
}

function SkeletonLine({ w = "100%", h = 13, mb = 8 }: { w?: string | number; h?: number; mb?: number }) {
  return (
    <div className="anim-skeleton" style={{ width: w, height: h, borderRadius: 6, background: "rgba(255,255,255,0.07)", marginBottom: mb }} />
  );
}

function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ padding: "18px 20px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} w={i === lines - 1 ? "65%" : "100%"} mb={i === lines - 1 ? 0 : 10} />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-8 px-6 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.10)" }}>
      <p style={{ fontSize: 13, color: "rgba(220,215,255,0.30)", fontStyle: "italic" }}>{message}</p>
    </div>
  );
}

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let cur = 0;
    const step = Math.ceil(target / (duration / 16));
    const tick = () => { cur = Math.min(cur + step, target); setVal(cur); if (cur < target) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [trigger, target, duration]);
  return val;
}

function useTrigger(threshold = 0.4) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTriggered(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, triggered };
}

function ScoreBox({ target, label, gtClass }: { target: number; label: string; gtClass: string }) {
  const { ref, triggered } = useTrigger(0.5);
  const val = useCountUp(target, 1400, triggered);
  return (
    <div ref={ref} className="score-card-hover flex flex-col items-center justify-center w-[100px] h-[100px] rounded-2xl gap-1 relative overflow-hidden cursor-default"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at bottom,rgba(196,176,255,0.07),transparent 70%)" }} />
      <div className={`anim-shimmer ${gtClass} text-[28px] font-bold leading-none`}>{val}</div>
      <div className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "rgba(220,215,255,0.50)" }}>{label}</div>
    </div>
  );
}

type BV = "purple" | "green" | "orange" | "red" | "blue";
const BS: Record<BV, React.CSSProperties> = {
  purple: { background: "rgba(196,176,255,0.10)", color: "#c4b0ff",  border: "1px solid rgba(196,176,255,0.25)" },
  green:  { background: "rgba(126,232,250,0.10)", color: "#7ee8fa",  border: "1px solid rgba(126,232,250,0.25)" },
  orange: { background: "rgba(196,176,255,0.08)", color: "rgba(196,176,255,0.85)", border: "1px solid rgba(196,176,255,0.20)" },
  red:    { background: "rgba(255,157,226,0.10)", color: "#ff9de2",  border: "1px solid rgba(255,157,226,0.25)" },
  blue:   { background: "rgba(126,232,250,0.10)", color: "#7ee8fa",  border: "1px solid rgba(126,232,250,0.22)" },
};
function Badge({ v, children }: { v: BV; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold tracking-[0.05em] uppercase" style={BS[v]}>
      {children}
    </span>
  );
}

const contactIconMap: Record<string, any> = {
  "Full Name": User, "Phone Number": Phone, "Email Address": Mail,
  "LinkedIn Profile": BookOpenText, "GitHub / Portfolio": Cat,
  "GitHub/Portfolio": Cat, "Location": MapPin,
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE — Analyzing / Complete
// ─────────────────────────────────────────────────────────────────────────────
const REQUIRED_SECTIONS = [
  "contactInfo", "summary", "workExperience",
  "skills", "certifications", "recruiterEye", "atsEvaluation",
];

function StatusBadge({ analysis }: { analysis: Record<string, any> }) {
  const loaded = REQUIRED_SECTIONS.filter(k => analysis?.[k] != null).length;
  const total  = REQUIRED_SECTIONS.length;
  const done   = loaded === total;

  if (done) {
    return (
      <div
        key="done"
        className="anim-badge-pop inline-flex items-center gap-[7px] mb-3.5 px-3.5 py-1 rounded-full text-[12px] font-medium tracking-[0.06em]"
        style={{
          background: "rgba(34,197,94,0.10)",
          border: "1px solid rgba(34,197,94,0.30)",
          color: "#4ade80",
        }}
      >
        <CheckCircle2 size={12} style={{ color: "#4ade80" }} />
        Analysis Complete
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-[7px] mb-3.5 px-3.5 py-1 rounded-full text-[12px] font-medium tracking-[0.06em]"
      style={{
        background: "rgba(196,176,255,0.08)",
        border: "1px solid rgba(196,176,255,0.20)",
        color: C.accent1,
      }}
    >
      {/* Spinner ring */}
      <svg
        className="anim-spin"
        width="12" height="12" viewBox="0 0 12 12"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <circle cx="6" cy="6" r="4.5" stroke="rgba(196,176,255,0.25)" strokeWidth="1.5" />
        <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" stroke="#c4b0ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Analyzing&hellip;&nbsp;
      <span style={{ color: "rgba(196,176,255,0.50)", fontSize: 11, fontWeight: 400 }}>
        {loaded}/{total}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "sec-overview",   label: "Overview"      },
  { id: "sec-actions",    label: "Actions"       },
  { id: "sec-contact",    label: "Contact"       },
  { id: "sec-summary",    label: "Summary"       },
  { id: "sec-experience", label: "Experience"    },
  { id: "sec-skills",     label: "Skills"        },
  { id: "sec-recruiter",  label: "Recruiter Eye" },
  { id: "sec-ats",        label: "ATS Audit"     },
  { id: "sec-certs",      label: "Certs"         },
  { id: "sec-verdict",    label: "Verdict"       },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AnalysisResult({ analysis }: Props) {
  const [activeNav, setActiveNav] = useState("sec-overview");
  const navRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const overallScore  = computeOverallScore(analysis);
  const postFixScore  = overallScore != null ? computePostFix(overallScore) : null;
  const atsRaw        = analysis?.atsEvaluation?.overallATSScore ?? null;
  const atsPct        = atsRaw  != null ? computeAtsPct(atsRaw)        : null;
  const atsPostFix    = atsPct  != null ? computeAtsPostFix(atsPct)    : null;
  const verdictTier   = overallScore != null ? getTier(overallScore)   : null;

  const highSignals: any[] = analysis?.recruiterEye?.highSignalSignals ?? [];
  const jobFit = highSignals.length > 0
    ? Math.round(
        (highSignals.reduce((a: number, s: any) => a + (s.strength ?? 5), 0) / highSignals.length) * 10
      )
    : null;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let scroller: HTMLElement | Window = window;
    let el: HTMLElement | null = navRef.current;
    while (el) {
      const style = getComputedStyle(el);
      if (style.overflowY === "auto" || style.overflowY === "scroll") { scroller = el; break; }
      el = el.parentElement;
    }
    const handleScroll = () => {
      for (const item of [...NAV_ITEMS].reverse()) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= 120) { setActiveNav(item.id); break; }
      }
    };
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".js-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [analysis]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("visible");
    el.querySelectorAll(".js-reveal").forEach(child => child.classList.add("visible"));
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const contactFields: any[] = analysis?.contactInfo?.contact_fields ?? [];
  const summaryData = analysis?.summary;
  const workExp: any[] = analysis?.workExperience?.work_experience ?? [];
  const skillsList: any[] = analysis?.skills?.skills ?? [];
  const technicalSkills = skillsList.filter((s: any) => !["Cross-functional Leadership", "Communication", "Mentorship"].includes(s.name));
  const softSkills      = skillsList.filter((s: any) =>  ["Cross-functional Leadership", "Communication", "Mentorship"].includes(s.name));
  const certData = analysis?.certifications;
  const projects: any[] = certData?.projects ?? [];
  const certs: any[]    = certData?.certifications ?? [];
  const atsData = analysis?.atsEvaluation;
  const atsCategories: any[] = atsData?.categories ?? [];
  const allRules = atsCategories.flatMap((c: any) => c.rules ?? []);
  const passing  = allRules.filter((r: any) => r.status === "good").length;
  const warnings = allRules.filter((r: any) => r.status === "ok").length;
  const failing  = allRules.filter((r: any) => r.status === "missing").length;

  const overallForBox = overallScore ?? 0;
  const atsForBox     = Math.round((atsRaw ?? 0) * 10);

  return (
    <div style={{ color: "rgba(255,255,255,0.85)" }}>
      <style>{KEYFRAMES}</style>

      <div ref={sentinelRef} style={{ height: 1, marginBottom: -1, pointerEvents: "none" }} />

      {/* ── Nav ── */}
      <div
        ref={navRef}
        className="sticky top-3 p-3 rounded-full z-50 mb-8"
        style={{
          background: scrolled ? "rgba(0,0,75,0.18)" : "rgba(8,11,18,0)",
          backdropFilter: scrolled ? "blur(24px) saturate(200%)" : "blur(0px)",
          borderBottom: scrolled ? "1px solid rgba(196,176,255,0.15)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
          transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        <div className="flex items-center justify-center gap-1 px-4 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => scrollTo(id)} className={`nav-link ${activeNav === id ? "active" : ""}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          01 — OVERVIEW HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-overview" className="js-reveal mb-[52px]">
        <div className="relative overflow-hidden rounded-[20px] px-10 py-9 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-start anim-glow-purple"
          style={{ background: C.heroBg, border: `1px solid ${C.heroBdr}` }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `
            radial-gradient(ellipse 60% 55% at 0% 0%,   rgba(196,176,255,0.09), transparent 65%),
            radial-gradient(ellipse 45% 40% at 100% 100%, rgba(126,232,250,0.06), transparent 60%)` }} />
          <div className="relative z-10">

            {/* ── Dynamic status badge ── */}
            <StatusBadge analysis={analysis} />

            <div className="text-[44px] sm:text-[32px] font-bold leading-[1.08] tracking-[-0.03em] mb-2">
              <em className="not-italic anim-shimmer gt-purple-cyan">
                {analysis?.contactInfo?.contact_fields[0]?.value || <Spinner />}
              </em>
            </div>
            <div className={`flex items-center ${analysis?.header?.currentRole ? "text-[15px] font-light" : "text-[15px] font-light text-gray-600"}`}>
              {analysis?.header?.currentRole || "Role Unavailable"}
              <span className="ml-3" style={{ color: "rgba(196,176,255,0.40)" }}>→</span>
              <span className="font-medium px-2.5 py-0.5 rounded-md ml-2"
                style={{ color: C.accent1, background: "rgba(196,176,255,0.08)", border: "1px solid rgba(196,176,255,0.20)" }}>
                {analysis?.header?.targetRole || <Spinner />}
              </span>
            </div>
            <div className="h-px mt-4 mb-6" style={{ background: "linear-gradient(90deg,transparent,rgba(196,176,255,0.15),transparent)" }} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[
                { label: "Contact Info",   score: analysis?.contactInfo?.overall_score,    gradFrom: "#7ee8fa", gradTo: "#c4b0ff" },
                { label: "Summary",        score: analysis?.summary?.overall_score,         gradFrom: "#c4b0ff", gradTo: "#ff9de2" },
                { label: "Experience",     score: analysis?.workExperience?.overall_score,  gradFrom: "#c4b0ff", gradTo: "#7ee8fa" },
                { label: "Skills",         score: analysis?.skills?.overall_score,          gradFrom: "#7ee8fa", gradTo: "#ff9de2" },
                { label: "ATS Score",      score: atsRaw,                                   gradFrom: "#ff9de2", gradTo: "#c4b0ff" },
                { label: "Certifications", score: analysis?.certifications?.overall_score,  gradFrom: "#7ee8fa", gradTo: "#c4b0ff" },
              ].map(({ label, score, gradFrom, gradTo }) => (
                <ProgressBar key={label} label={label} pct={score ?? null} gradFrom={gradFrom} gradTo={gradTo} />
              ))}
            </div>
          </div>
          <div className="relative z-10 flex gap-3 flex-shrink-0 flex-wrap">
            <ScoreBox target={overallForBox} label="Overall" gtClass="gt-purple-pink" />
            <ScoreBox target={atsForBox}     label="ATS"     gtClass="gt-cyan-purple" />
            {jobFit != null && (
              <ScoreBox target={jobFit} label="Job Fit" gtClass="gt-cyan-pink" />
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          02 — PRIORITY ACTIONS
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-actions" className="js-reveal mb-[52px]">
        <SectionLabel>02 — Priority Actions</SectionLabel>
        {!analysis?.atsEvaluation?.suggestions && !analysis?.contactInfo?.suggestions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map(i => <SkeletonBlock key={i} lines={3} />)}
          </div>
        ) : (() => {
          const allSuggestions: { text: string; color: string; bv: BV; bl: string; prio: "high" | "med" | "low" }[] = [
            ...((analysis?.atsEvaluation?.suggestions ?? []).slice(0, 3).map((s: string) => ({ text: s, color: "rgba(255,157,226,0.25)", bv: "red" as BV, bl: "HIGH", prio: "high" as const }))),
            ...((analysis?.contactInfo?.suggestions   ?? []).slice(0, 2).map((s: string) => ({ text: s, color: "rgba(196,176,255,0.22)", bv: "orange" as BV, bl: "MED",  prio: "med"  as const }))),
            ...((analysis?.skills?.suggestions        ?? []).slice(0, 2).map((s: string) => ({ text: s, color: "rgba(126,232,250,0.22)", bv: "blue" as BV,   bl: "LOW",  prio: "low"  as const }))),
          ];
          const icons: Record<string, string> = { high: "🌸", med: "✦", low: "◈" };
          if (!allSuggestions.length) return <EmptyState message="No priority actions found." />;
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {allSuggestions.map((item, i) => (
                <div key={i} className="flex gap-3.5 items-start p-[18px_20px] rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: C.glass, border: `1px solid ${item.color}` }}>
                  <div className="text-xl mt-0.5 flex-shrink-0">{icons[item.prio]}</div>
                  <div className="text-[13.5px] leading-[1.6] font-light" style={{ color: C.muted }}>
                    <strong className="block text-[13px] font-semibold mb-[5px]" style={{ color: C.text }}>
                      <Badge v={item.bv}>{item.bl}</Badge>&nbsp;&nbsp;Action Required
                    </strong>
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          03 — CONTACT INFORMATION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-contact" className="js-reveal mb-[52px]">
        <SectionLabel>03 — Contact Information</SectionLabel>
        {!analysis?.contactInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonBlock key={i} lines={2} />)}
          </div>
        ) : contactFields.length === 0 ? (
          <EmptyState message="No contact information found in resume." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactFields.map((f: any, i: number) => {
              const status: Status = (f.status as Status) || "missing";
              const c = statusCfg[status];
              const SI = c.icon;
              const FIcon = contactIconMap[f.label] ?? User;
              return (
                <div key={i} className="contact-item" style={{ borderRadius: 14, padding: "15px 17px", background: c.bg, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FIcon size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.28)", flex: 1 }}>{f.label}</span>
                    <Pill status={status} />
                    {f.score != null && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: scoreColor(f.score / 10), fontFamily: "monospace", marginLeft: 4 }}>{f.score}/10</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: f.value ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)", fontStyle: f.value ? "normal" : "italic", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.value || "Not found"}
                  </p>
                  <div className="flex gap-1.5 items-start">
                    <SI size={11} style={{ color: c.color, marginTop: 1.5, flexShrink: 0 }} />
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", lineHeight: 1.5 }}>{f.feedback}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          04 — PROFESSIONAL SUMMARY
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-summary" className="js-reveal mb-[52px]">
        <SectionLabel>04 — Professional Summary</SectionLabel>
        {!analysis?.summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkeletonBlock lines={5} /><SkeletonBlock lines={5} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlassCard style={{ padding: "20px 22px" }}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>Current Version</span>
                <Pill status={(summaryData?.status === "good" ? "good" : summaryData?.status === "needs improvement" ? "missing" : "ok") as Status} />
                <div style={{ marginLeft: "auto" }}><ScoreDisplay score={summaryData?.score ?? summaryData?.overall_score ?? null} /></div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.58)", lineHeight: 1.75, fontStyle: "italic", borderLeft: "2px solid rgba(255,255,255,0.1)", paddingLeft: 13, marginBottom: 14 }}>
                "{summaryData?.summary || "—"}"
              </p>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 8 }}>Issues Found</p>
              {(summaryData?.suggestions ?? []).length === 0
                ? <p style={{ fontSize: 12, color: "rgba(255,255,255,0.30)", fontStyle: "italic" }}>No issues found.</p>
                : (summaryData?.suggestions ?? []).map((s: string, i: number) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <XCircle size={11} style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.48)", lineHeight: 1.55 }}>{s}</p>
                    </div>
                  ))}
            </GlassCard>
            <GlassCard style={{ padding: "20px 22px", border: "1px solid rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.04)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(52,211,153,0.7)" }}>Suggested Rewrite</span>
                <Pill status="good" />
              </div>
              {summaryData?.improved ? (
                <>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.75, fontStyle: "italic", borderLeft: "2px solid rgba(52,211,153,0.3)", paddingLeft: 13, marginBottom: 14 }}>
                    "{summaryData.improved}"
                  </p>
                  <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "rgba(52,211,153,0.07)" }}>
                    <CheckCircle2 size={11} style={{ color: "#34d399", marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontSize: 11, color: "rgba(52,211,153,0.7)", lineHeight: 1.55 }}>Metrics added · JD keywords mirrored · Vague filler removed</p>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>No rewrite suggestion available for this resume.</p>
              )}
            </GlassCard>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          05 — WORK EXPERIENCE
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-experience" className="js-reveal mb-[52px]">
        <SectionLabel>05 — Work Experience</SectionLabel>
        {!analysis?.workExperience ? (
          <div className="flex flex-col gap-4">{[1, 2].map(i => <SkeletonBlock key={i} lines={4} />)}</div>
        ) : workExp.length === 0 ? (
          <EmptyState message="No work experience found in resume." />
        ) : (
          <div className="flex flex-col gap-4">
            {workExp.map((role: any, ri: number) => {
              const status: Status = (role.status as Status) || "ok";
              const c = statusCfg[status];
              return (
                <GlassCard key={ri} style={{ padding: 0, overflow: "hidden" }}>
                  <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Ring score={role.score ?? 5} size={46} />
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{role.title}</span>
                        <Pill status={status} />
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.36)", marginTop: 2 }}>
                        {role.company}&nbsp;·&nbsp;{role.period}
                      </p>
                    </div>
                    <ScoreDisplay score={role.score ?? null} />
                  </div>
                  <div className="px-5 py-4">
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 10, letterSpacing: "0.1em" }}>
                      Bullet-by-Bullet Analysis
                    </p>
                    {(role.bullets ?? []).map((b: any, i: number) => {
                      const bs: Status = (b.status as Status) || "ok";
                      const bc = statusCfg[bs];
                      const BI = bc.icon;
                      return (
                        <div key={i} className="flex gap-2.5 py-2.5"
                          style={{ borderBottom: i < (role.bullets?.length ?? 0) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                          <BI size={13} style={{ color: bc.color, flexShrink: 0, marginTop: 2 }} />
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, flex: 1 }}>{b.text}</p>
                          <div style={{ marginLeft: "auto", flexShrink: 0 }}><Pill status={bs} /></div>
                        </div>
                      );
                    })}
                    {role.feedback && (
                      <div className="flex gap-2 mt-3 p-3 rounded-lg" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                        <c.icon size={11} style={{ color: c.color, flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.48)", lineHeight: 1.55 }}>
                          <span style={{ fontWeight: 700, color: c.color }}>Feedback:&nbsp;</span>{role.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
        {(analysis?.workExperience?.suggestions?.length ?? 0) > 0 && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(196,176,255,0.04)", border: "1px solid rgba(196,176,255,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: C.accent1, marginBottom: 8 }}>Suggestions</p>
            {analysis.workExperience.suggestions.map((s: string, i: number) => (
              <div key={i} className="flex gap-2 mb-1.5">
                <TrendingUp size={11} style={{ color: C.accent1, flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          06 — SKILLS ANALYSIS
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-skills" className="js-reveal mb-[52px]">
        <SectionLabel>06 — Skills Analysis</SectionLabel>
        {!analysis?.skills ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkeletonBlock lines={5} /><SkeletonBlock lines={5} />
          </div>
        ) : skillsList.length === 0 ? (
          <EmptyState message="No skills data found in resume." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Technical Skills</p>
              <div className="flex flex-col gap-2">
                {technicalSkills.map((s: any, i: number) => {
                  const st: Status = (s.status as Status) || "ok";
                  const c = statusCfg[st];
                  return (
                    <div key={i} className="signal-row flex items-center gap-3 p-3.5 rounded-xl"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      <Ring score={s.score ?? 5} size={38} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{s.name}</span>
                          {s.level && (
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: "1px 5px" }}>
                              {s.level}
                            </span>
                          )}
                          <div style={{ marginLeft: "auto" }}><Pill status={st} /></div>
                        </div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", lineHeight: 1.45 }}>{s.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Soft Skills</p>
              <div className="flex flex-col gap-2 mb-4">
                {softSkills.length === 0
                  ? <EmptyState message="No soft skills data found." />
                  : softSkills.map((s: any, i: number) => {
                      const st: Status = (s.status as Status) || "ok";
                      const c = statusCfg[st];
                      return (
                        <div key={i} className="signal-row flex items-center gap-3 p-3.5 rounded-xl"
                          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                          <Ring score={s.score ?? 5} size={38} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{s.name}</span>
                              <div style={{ marginLeft: "auto" }}><Pill status={st} /></div>
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", lineHeight: 1.45 }}>{s.note}</p>
                          </div>
                        </div>
                      );
                    })}
              </div>
              {(analysis?.skills?.suggestions?.length ?? 0) > 0 && (
                <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#ef4444", marginBottom: 8 }}>Missing / Weak Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.skills.suggestions ?? []).slice(0, 6).map((kw: string, i: number) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "rgba(239,68,68,0.75)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "3px 9px" }}>
                        {kw.length > 40 ? kw.slice(0, 40) + "…" : kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          07 — RECRUITER'S EYE
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-recruiter" className="js-reveal mb-[52px]">
        <SectionLabel>07 — Recruiter's Eye</SectionLabel>
        {!analysis?.recruiterEye ? (
          <div className="flex flex-col gap-4">
            <SkeletonBlock lines={3} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><SkeletonBlock lines={4} /><SkeletonBlock lines={4} /></div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {(() => {
              const v = analysis.recruiterEye?.recruiterVerdict;
              if (!v) return <EmptyState message="Recruiter verdict not available." />;
              const signalColor = v.overallSignal === "Strong" ? "#22c55e" : v.overallSignal === "Average" ? "#f59e0b" : "#ef4444";
              const signalBg    = v.overallSignal === "Strong" ? "rgba(34,197,94,0.08)"   : v.overallSignal === "Average" ? "rgba(245,158,11,0.08)"  : "rgba(239,68,68,0.08)";
              const signalBdr   = v.overallSignal === "Strong" ? "rgba(34,197,94,0.22)"   : v.overallSignal === "Average" ? "rgba(245,158,11,0.22)"  : "rgba(239,68,68,0.22)";
              return (
                <div className="relative overflow-hidden rounded-2xl p-5 anim-glow-cyan"
                  style={{ background: C.heroBg, border: `1px solid ${C.heroBdr}` }}>
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 55% 60% at 0% 0%, rgba(126,232,250,0.07), transparent 65%)" }} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(220,215,255,0.40)" }}>6-Second Scan</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide" style={{ background: signalBg, color: signalColor, border: `1px solid ${signalBdr}` }}>
                        {v.overallSignal} Signal
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide" style={{ background: "rgba(196,176,255,0.08)", color: C.accent1, border: "1px solid rgba(196,176,255,0.20)" }}>
                        {v.estimatedSeniority}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(220,215,255,0.65)", lineHeight: 1.7 }}>{v.sixSecondSummary}</p>
                  </div>
                </div>
              );
            })()}
            {(analysis.recruiterEye?.highSignalSignals?.length ?? 0) > 0 && (
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>What Caught the Recruiter's Eye</p>
                <div className="flex flex-col gap-2.5">
                  {analysis.recruiterEye.highSignalSignals.map((s: any, i: number) => {
                    const typeColor: Record<string, string> = { Prestige: "#c4b0ff", Impact: "#7ee8fa", Velocity: "#ff9de2", Leadership: "#22c55e" };
                    const typeBg:    Record<string, string> = { Prestige: "rgba(196,176,255,0.08)", Impact: "rgba(126,232,250,0.08)", Velocity: "rgba(255,157,226,0.08)", Leadership: "rgba(34,197,94,0.08)" };
                    const typeBdr:   Record<string, string> = { Prestige: "rgba(196,176,255,0.22)", Impact: "rgba(126,232,250,0.22)", Velocity: "rgba(255,157,226,0.22)", Leadership: "rgba(34,197,94,0.22)" };
                    const col = typeColor[s.type] ?? C.accent1;
                    const bg  = typeBg[s.type]    ?? "rgba(196,176,255,0.08)";
                    const bdr = typeBdr[s.type]   ?? "rgba(196,176,255,0.22)";
                    return (
                      <div key={i} className="signal-row flex gap-3.5 items-start p-4 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide" style={{ background: bg, color: col, border: `1px solid ${bdr}` }}>{s.type}</span>
                          <Ring score={s.strength} size={38} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{s.observation}</p>
                          <div className="flex gap-1.5 items-start mt-1">
                            <Star size={10} style={{ color: col, flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", lineHeight: 1.55 }}>{s.whyItMatters}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {(analysis.recruiterEye?.redFlags?.length ?? 0) > 0 && (
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Red Flags</p>
                <div className="flex flex-col gap-2">
                  {analysis.recruiterEye.redFlags.map((f: any, i: number) => {
                    const sevColor = f.severity === "High" ? "#ef4444" : f.severity === "Medium" ? "#f59e0b" : "#38bdf8";
                    const sevBg    = f.severity === "High" ? "rgba(239,68,68,0.08)"   : f.severity === "Medium" ? "rgba(245,158,11,0.08)"  : "rgba(56,189,248,0.08)";
                    const sevBdr   = f.severity === "High" ? "rgba(239,68,68,0.22)"   : f.severity === "Medium" ? "rgba(245,158,11,0.22)"  : "rgba(56,189,248,0.22)";
                    return (
                      <div key={i} className="contact-item p-4 rounded-2xl" style={{ background: sevBg, border: `1px solid ${sevBdr}` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle size={12} style={{ color: sevColor, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", flex: 1 }}>{f.issue}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: sevBg, color: sevColor, border: `1px solid ${sevBdr}` }}>{f.severity}</span>
                        </div>
                        <div className="flex gap-1.5 items-start">
                          <TrendingUp size={10} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0, marginTop: 2 }} />
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", lineHeight: 1.55 }}>{f.fix}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {analysis.recruiterEye?.visualOptimization && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard style={{ padding: "18px 20px" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Bold These to Guide the Eye</p>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.recruiterEye.visualOptimization.anchorKeywords ?? []).map((kw: string, i: number) => (
                      <span key={i} style={{ fontSize: 12, fontWeight: 700, color: C.accent1, background: "rgba(196,176,255,0.10)", border: "1px solid rgba(196,176,255,0.25)", borderRadius: 6, padding: "4px 10px" }}>{kw}</span>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard style={{ padding: "18px 20px", background: "rgba(255,157,226,0.04)", border: "1px solid rgba(255,157,226,0.18)" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,157,226,0.60)", marginBottom: 8 }}>Missing Narrative</p>
                  <div className="flex gap-2 items-start">
                    <Target size={12} style={{ color: C.accent2, flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{analysis.recruiterEye.visualOptimization.narrativeGap}</p>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          08 — ATS AUDIT
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-ats" className="js-reveal mb-[52px]">
        <SectionLabel>08 — ATS Audit</SectionLabel>
        {!analysis?.atsEvaluation ? (
          <div className="flex flex-col gap-4"><SkeletonBlock lines={2} /><SkeletonBlock lines={4} /></div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Rules Passing", value: passing,  sub: `of ${allRules.length} total`, color: "#22c55e" },
                { label: "Warnings",      value: warnings, sub: "partial compliance",           color: "#f59e0b" },
                { label: "Failing",       value: failing,  sub: "need fixing now",              color: "#ef4444" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="score-card-hover text-center py-4 rounded-xl"
                  style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                  <p style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{label}</p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{sub}</p>
                </div>
              ))}
            </div>
            {atsCategories.length === 0
              ? <EmptyState message="No ATS category data available." />
              : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {atsCategories.map((cat: any, ci: number) => {
                    const iconMap: Record<string, any> = { "Layout & Structure": Layers, "Visuals & Fonts": FileText, "Content & Keywords": Brain, "Technical Specifics": ShieldCheck };
                    const CatIcon = iconMap[cat.label] ?? ShieldCheck;
                    return (
                      <GlassCard key={ci} style={{ padding: 0, overflow: "hidden" }}>
                        <div className="flex items-center gap-3 px-5 py-3.5"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                          <CatIcon size={13} style={{ color: "rgba(255,255,255,0.38)" }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", flex: 1 }}>{cat.label}</span>
                          <Ring score={cat.score ?? 5} size={36} />
                        </div>
                        <div className="px-5 py-3">
                          {(cat.rules ?? []).map((rule: any, i: number) => {
                            const rs: Status = (rule.status as Status) || "ok";
                            const rc = statusCfg[rs];
                            const RI = rc.icon;
                            return (
                              <div key={i} className="py-2.5"
                                style={{ borderBottom: i < (cat.rules?.length ?? 0) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                                <div className="flex items-center gap-2 mb-1">
                                  <RI size={12} style={{ color: rc.color, flexShrink: 0 }} />
                                  <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.72)", flex: 1 }}>{rule.rule}</span>
                                  <Pill status={rs} />
                                </div>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", lineHeight: 1.5, paddingLeft: 20 }}>{rule.feedback}</p>
                              </div>
                            );
                          })}
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
          </>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          09 — CERTIFICATIONS & PROJECTS
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-certs" className="js-reveal mb-[52px]">
        <SectionLabel>09 — Certifications & Projects</SectionLabel>
        {!analysis?.certifications ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3].map(i => <SkeletonBlock key={i} lines={3} />)}
          </div>
        ) : (certs.length === 0 && projects.length === 0) ? (
          <EmptyState message="No certifications or projects found in resume." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {certs.map((cert: any, i: number) => (
              <CertCard key={`cert-${i}`}
                type="🏆 Certification"
                name={cert.name ?? "Certification"}
                desc={cert.description ?? ""}
                impact={cert.impact ?? ""}
              />
            ))}
            {projects.map((proj: any, i: number) => (
              <CertCard key={`proj-${i}`}
                type={proj.type === "education" ? "🎓 Education" : "💡 Project"}
                name={proj.name ?? "Project"}
                desc={proj.description ?? ""}
                impact={proj.impact ?? ""}
                muted={proj.impact?.toLowerCase().includes("moderate") || proj.impact?.toLowerCase().includes("low")}
              />
            ))}
          </div>
        )}
        {(analysis?.certifications?.suggestions?.length ?? 0) > 0 && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(196,176,255,0.04)", border: "1px solid rgba(196,176,255,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: C.accent1, marginBottom: 8 }}>Suggestions</p>
            {(analysis.certifications.suggestions ?? []).map((s: string, i: number) => (
              <div key={i} className="flex gap-2 mb-1.5">
                <Award size={11} style={{ color: C.accent1, flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          10 — FINAL VERDICT
      ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-verdict" className="js-reveal mb-[52px]">
        <SectionLabel>10 — Final Verdict</SectionLabel>
        <div
          className="relative overflow-hidden rounded-[20px] px-10 py-9 anim-glow-pink"
          style={{
            background: C.heroBg,
            border: `1px solid ${C.heroBdr}`,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: `
            radial-gradient(ellipse 65% 55% at 0% 0%,   rgba(196,176,255,0.07), transparent 65%),
            radial-gradient(ellipse 50% 45% at 100% 100%, rgba(255,157,226,0.05), transparent 60%)` }} />

          <div className="relative z-10">
            <div className="text-[28px] font-bold mb-4 tracking-tight" style={{ color: C.text }}>
              {analysis?.header?.name
                ? `${analysis.header.name} — Resume Analysis Complete`
                : "Resume Analysis Complete"}
            </div>
            <p className="text-[15px] leading-[1.78] max-w-[660px] font-light" style={{ color: C.muted }}>
              This resume demonstrates{" "}
              <em className="not-italic font-medium" style={{ color: C.accent1 }}>real potential</em>{" "}
              — the experience and skills are present. The gap between a rejection and an interview often
              comes down to{" "}
              <span className="font-medium" style={{ color: C.accent3 }}>execution details</span>:
              missing keywords, unquantified bullets, and a summary that doesn't lead with impact.
              Implement the HIGH and MED priority fixes above — most can be done in{" "}
              <em className="not-italic font-medium" style={{ color: C.accent1 }}>2–3 focused hours</em>.
            </p>
            <div className="mt-5 flex flex-col gap-1">
              <span className="text-[12.5px] font-light" style={{ color: C.muted2 }}>
                Current overall score:{" "}
                <strong style={{ color: C.text, fontWeight: 600 }}>
                  {overallScore != null ? `${overallScore}/100` : "—"}
                </strong>
              </span>
              <span className="text-[12.5px] font-light" style={{ color: C.muted2 }}>
                Estimated post-fix:{" "}
                <strong style={{ color: C.text, fontWeight: 600 }}>
                  {postFixScore != null ? `${postFixScore}/100` : "—"}
                </strong>
              </span>
              <span className="text-[12.5px] font-light" style={{ color: C.muted2 }}>
                Est. ATS pass probability:{" "}
                <strong style={{ color: C.text, fontWeight: 600 }}>
                  {atsPct != null && atsPostFix != null ? `${atsPct}% → ${atsPostFix}%` : "—"}
                </strong>
              </span>
            </div>
            <div className="mt-5 px-[18px] py-3.5 rounded-[10px] flex items-center gap-2.5 text-[14px] font-normal text-gray-300"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)" }}>
              <span style={{ color: "#22c55e" }}>✦</span>
              Implement HIGH and MED priority fixes before applying — keyword gaps are the #1 cause of ATS rejection before human review.
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 flex-shrink-0">
            {verdictTier && overallScore != null ? (
              <>
                <div
                  className="anim-float"
                  style={{
                    width: 96, height: 96, borderRadius: "50%",
                    background: verdictTier.bg,
                    border: `1px solid ${verdictTier.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 24px ${verdictTier.color}55, 0 0 52px ${verdictTier.color}28`,
                  }}
                >
                  <svg
                    width="44" height="44" viewBox="0 0 24 24"
                    fill="none" stroke={verdictTier.color}
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                    className="anim-icon-glow"
                    style={{ color: verdictTier.color }}
                  >
                    <path d={verdictTier.path} />
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
                    <span style={{
                      fontSize: 58, fontWeight: 900,
                      color: verdictTier.color,
                      fontFamily: "'DM Mono', monospace",
                      lineHeight: 1,
                      textShadow: `0 0 30px ${verdictTier.color}99`,
                    }}>
                      {overallScore}
                    </span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Mono', monospace" }}>/100</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: verdictTier.color, margin: "5px 0 3px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {verdictTier.label}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(220,215,255,0.40)", margin: 0 }}>{verdictTier.sub}</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="anim-skeleton" style={{ width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div className="anim-skeleton" style={{ width: 80, height: 48, borderRadius: 10, background: "rgba(255,255,255,0.06)" }} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}