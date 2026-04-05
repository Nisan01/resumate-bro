"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";

const FEATURES = [
  "ATS compatibility score + breakdown",
  "Keyword gap analysis vs job description",
  "Line-by-line improvement suggestions",
  "AI-powered bullet point optimization"
];

// ── Sub-Components ──────────────────────────────────────────────────────────

function AccuracyMetric({ 
  icon: Icon, 
  label, 
  pct, 
  colorClass,
  bgClass 
}: { 
  icon: any, 
  label: string, 
  pct: number, 
  colorClass: string,
  bgClass: string 
}) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[200px]">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <div className="flex items-center gap-2">
          <Icon size={12} className={colorClass} />
          {label}
        </div>
        <span>{pct}%</span>
      </div>
      {/* Progress Bar Container */}
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${bgClass}`} 
        />
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-400 text-base">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 flex-shrink-0">
        <Sparkles size={12} className="text-violet-400" />
      </div>
      <span className="text-[15px]">{text}</span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ResumeHeroLeft() {
  return (
    <div className="flex flex-col gap-12  justify-center py-8 lg:py-10"> 
      
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 w-fit"
      >
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
          Next-Gen Analysis
        </span>
      </motion.div>

      {/* Main Title */}
      <div className="flex flex-col">
        <h1 className="text-5xl md:text-[5rem] font-black tracking-tighter leading-[0.9] text-white">
          Your Resume, <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent ">
             Perfected.
          </span>
        </h1>
      </div>

      <div className=" flex flex-col gap-10">
        {/* Subtext */}
        <p className="text-[16px] text-slate-400 max-w-xl leading-relaxed">
          Stop guessing why you aren't getting interviews. Our AI scans your resume
          against 1,000+ industry standards in real-time.
        </p>

        {/* Accuracy Section Card */}
        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-white/[0.03] border backdrop-blur-md border-white/10 shadow-2xl max-w-xl">
          <div className="flex flex-wrap gap-10">
            <AccuracyMetric 
              icon={FileText} 
              label="PDF Extraction" 
              pct={98} 
              colorClass="text-emerald-400" 
              bgClass="bg-emerald-400"
            />
            <AccuracyMetric 
              icon={ImageIcon} 
              label="Image / OCR" 
              pct={72} 
              colorClass="text-amber-400" 
              bgClass="bg-amber-400"
            />
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-500 italic border-t border-white/5 pt-4">
            <AlertCircle size={14} className="text-violet-400 flex-shrink-0" />
            <span>
              Pro tip: Use <b className="text-slate-300">PDF format</b> for maximum AI extraction accuracy.
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 gap-y-5 gap-x-12 mt-2">
          {FEATURES.map((f) => (
            <FeatureItem key={f} text={f} />
          ))}
        </div>
      </div>
    </div>
  );
}