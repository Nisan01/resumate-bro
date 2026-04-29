"use client";

import { useState, useEffect } from "react";
import { Sparkles, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";

const FEATURES = [
  "ATS compatibility score + breakdown",
  "Keyword gap analysis vs job description",
  "Line-by-line improvement suggestions",
  "AI-powered bullet point optimization"
];

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
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 200);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="flex flex-col gap-2 w-full max-w-[200px]">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <div className="flex items-center gap-2">
          <Icon size={12} className={colorClass} />
          {label}
        </div>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bgClass} transition-all duration-[1500ms] ease-out`}
          style={{ width: `${width}%` }}
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

export default function ResumeHeroLeft() {
  return (
    <div className="flex flex-col gap-12 justify-center py-8 lg:py-10">

      {}
      <div className="animate-[fadeUp_0.5s_ease_both] inline-flex items-center gap-3 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 w-fit"
        style={{ animationDelay: "0s" }}
      >
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
          Next-Gen Analysis
        </span>
      </div>

      {}
      <div className="animate-[fadeUp_0.5s_ease_both] flex flex-col" style={{ animationDelay: "0.1s" }}>
        <h1 className="text-5xl md:text-[5rem] font-black tracking-tighter leading-[0.9] text-white">
          Your Resume, <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Perfected.
          </span>
        </h1>
      </div>

      <div className="animate-[fadeUp_0.5s_ease_both] flex flex-col gap-10" style={{ animationDelay: "0.2s" }}>
        {}
        <p className="text-[16px] text-slate-400 max-w-xl leading-relaxed">
          Stop guessing why you aren't getting interviews. Our AI scans your resume
          against 1,000+ industry standards in real-time.
        </p>

        {}
        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-white/[0.03] border backdrop-blur-md border-white/10 shadow-2xl max-w-xl">
          <div className="flex flex-wrap gap-10">
            <AccuracyMetric icon={FileText} label="PDF Extraction" pct={98} colorClass="text-emerald-400" bgClass="bg-emerald-400" />
            <AccuracyMetric icon={ImageIcon} label="Image / OCR" pct={72} colorClass="text-amber-400" bgClass="bg-amber-400" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 italic border-t border-white/5 pt-4">
            <AlertCircle size={14} className="text-violet-400 flex-shrink-0" />
            <span>
              Pro tip: Use <b className="text-slate-300">PDF format</b> for maximum AI extraction accuracy.
            </span>
          </div>
        </div>

        {}
        <div className="animate-[fadeUp_0.5s_ease_both] grid sm:grid-cols-2 gap-y-5 gap-x-12 mt-2" style={{ animationDelay: "0.3s" }}>
          {FEATURES.map((f) => (
            <FeatureItem key={f} text={f} />
          ))}
        </div>
      </div>
    </div>
  );
}