"use client";

import { useState } from "react";
import { Sparkles, Plus, RotateCcw, Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type Priority = "critical" | "high" | "medium" | "optional";

interface Node {
  title: string;
  priority: Priority;
  desc: string;
}

interface Phase {
  label: string;
  name: string;
  dur: string;
  accent: string;
  nodes: Node[];
}

interface Roadmap {
  phases: Phase[];
}

const PRIORITY_CONFIG: Record<Priority, { bg: string; dot: string; label: string }> = {
  critical: { bg: "bg-red-500/10 text-red-400",     dot: "bg-red-400",    label: "Must learn" },
  high:     { bg: "bg-amber-500/10 text-amber-400",  dot: "bg-amber-400",  label: "High" },
  medium:   { bg: "bg-violet-500/10 text-violet-400",dot: "bg-violet-400", label: "Medium" },
  optional: { bg: "bg-slate-500/10 text-slate-400",  dot: "bg-slate-400",  label: "Optional" },
};


const SUGGESTIONS = ["Frontend Developer", "Data Scientist", "DevOps Engineer", "UX Designer"];



function addAccents(data: Roadmap): Roadmap {
  const accents = ["#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b"];

  return {
    phases: data.phases.map((p, i) => ({
      ...p,
      accent: accents[i] || "#8b5cf6",
    })),
  };
}

function NodeCard({ node, accent }: { node: Node; accent: string }) {
  const p = PRIORITY_CONFIG[node.priority];
  return (
    <div className="relative rounded-2xl p-4 bg-white/[0.04] border border-white/10 overflow-hidden w-full sm:w-56 md:w-60 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]">
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: accent }} />
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full px-2.5 py-1 mt-2 mb-3 border ${p.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
        {p.label}
      </span>
      <p className="text-sm font-semibold text-white leading-snug mb-1.5">{node.title}</p>
      <p className="text-xs text-white/35 leading-relaxed line-clamp-2">{node.desc}</p>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (v: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center rounded-2xl border border-dashed border-white/10">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-white/20" />
      </div>
      <div>
        <p className="text-sm font-medium text-white/30 mb-1">No roadmap generated yet</p>
        <p className="text-xs text-white/20 mb-5">Search a job title or pick a suggestion to get started</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-xs text-white/40 hover:text-white/70 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CareerGuide() {
  const [input, setInput] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");

const generate = async (val?: string) => {
  const query = (val ?? input).trim();
  if (!query) return;
  setLoading(true);
  

  if (val) setInput(val);

  try {
    const res = await fetch("/api/dashboard/roadmap-analyzer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ goal: query }),
    });

    const data = await res.json();

    
    const colored = addAccents(data);
    setLoading(false);
    setRoadmap(colored);
    setCurrentTitle(query);
  } catch (err) {
    console.error(err);
    setLoading(false);

    setCurrentTitle(query);
  }
};

  const reset = () => {
    setRoadmap(null);
    setInput("");
    setCurrentTitle("");
  };

  const totalPhases = roadmap?.phases.length ?? 0;
  const totalSkills = roadmap?.phases.reduce((s, p) => s + p.nodes.length, 0) ?? 0;

  return (
    <div className="relative min-h-screen mb-1  text-white">
      {}
      <div className="pointer-events-none fixed top-0 left-1/4 w-96 h-96 rounded-full bg-purple-700/10 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-700/10 blur-[120px]" />

      {}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
        }}
      />

     <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          {}
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Roadmap</h1>
            </div>
            <p className="text-sm text-white/30 ml-[42px]">
              {roadmap
                ? `${totalPhases} phases · ${totalSkills} skills — ${currentTitle}`
                : "Generate a learning path for any career"}
            </p>
          </div>

          {}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder="e.g. Frontend Developer…"
                className="w-64 rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all backdrop-blur-sm"
              />
            </div>

            {}
            <button
              onClick={() => generate()}
              disabled={!input.trim()}
              className={`group flex shrink-0 items-center gap-2 rounded-xl ${loading ? 'bg-gray-500' : 'bg-gradient-to-r from-purple-600 to-violet-600'}  hover:from-purple-500 hover:to-violet-500 px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/40 hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
             {loading?"Generating...":"Generate"} 
            </button>

            {}
            {roadmap && (
              <button
                onClick={reset}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2.5 text-xs text-white/40 hover:text-white/70 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>



        {loading ? (
          <div className="h-[calc(100vh-165px)] w-full flex items-center justify-center">  <Spinner className="size-7 text-purple-400" />
</div>
) :!roadmap ? (
          <EmptyState onPick={(v) => generate(v)} />
   
   
        ) : (
          <div className="flex flex-col gap-10">
            {roadmap.phases.map((phase, pi) => (
              <div key={pi}>
                {}
                <div className="mb-5">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: phase.accent }}>
                    {phase.label} · {phase.dur}
                  </p>
                  <p className="text-base font-bold text-white/80">{phase.name}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{phase.nodes.length} skills</p>
                </div>

                {}
                <div className="flex flex-wrap justify-center gap-4">
                  {phase.nodes.map((node) => (
                    <NodeCard key={node.title} node={node} accent={phase.accent} />
                  ))}
                </div>

                {pi < roadmap.phases.length - 1 && (
                  <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}
              </div>
            ))}

            {}
            <div className="flex flex-wrap items-center gap-4 pt-2 pb-4">
              {Object.entries(PRIORITY_CONFIG).map(([, v]) => (
                <div key={v.label} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
                  <span className="text-[10px] text-white/25">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}








      </div>



    </div>
  );
}