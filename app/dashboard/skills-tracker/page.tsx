"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import {
  Sparkles, Plus, Search, Target, Brain, Zap, TrendingUp,
  X, ChevronRight, BarChart3, BookOpen, Eye, EyeOff
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillSource = "resume" | "manual" | "suggested";
type SkillProficiency = "none" | "beginner" | "intermediate" | "advanced" | "expert";
type SkillStatus = "learning" | "learned" | "interested" | "ignored";

interface Skill {
  id: string;
  userId: string;
  skillName: string;
  source: SkillSource;
  proficiency: SkillProficiency;
  status: SkillStatus;
  notes: string | null;
  meta: {
    reason?: string;
    priority?: "high" | "medium" | "low";
    category?: "technical" | "soft" | "tool";
    industry?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROFICIENCY_ORDER: SkillProficiency[] = ["none", "beginner", "intermediate", "advanced", "expert"];

const PROFICIENCY_COLORS: Record<SkillProficiency, string> = {
  none: "bg-white/5 text-white/30 border border-white/10",
  beginner: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  intermediate: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
  advanced: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  expert: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
};

const PROFICIENCY_GLOW: Record<SkillProficiency, string> = {
  none: "",
  beginner: "shadow-blue-500/20",
  intermediate: "shadow-violet-500/20",
  advanced: "shadow-amber-500/20",
  expert: "shadow-emerald-500/20",
};

const PROFICIENCY_BAR: Record<SkillProficiency, string> = {
  none: "bg-white/10",
  beginner: "bg-gradient-to-r from-blue-600 to-blue-400",
  intermediate: "bg-gradient-to-r from-violet-600 to-violet-400",
  advanced: "bg-gradient-to-r from-amber-600 to-amber-400",
  expert: "bg-gradient-to-r from-emerald-600 to-emerald-400",
};

const PROFICIENCY_WIDTH: Record<SkillProficiency, string> = {
  none: "w-0",
  beginner: "w-1/5",
  intermediate: "w-2/5",
  advanced: "w-3/5",
  expert: "w-full",
};

const STATUS_STYLES: Record<SkillStatus, string> = {
  interested: "bg-white/5 text-white/50 border border-white/10",
  learning: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  learned: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  ignored: "bg-white/5 text-white/20 border border-white/5",
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
  medium: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
  low: "text-zinc-500 bg-white/5 border border-white/10",
};

const SOURCE_ICON: Record<SkillSource, string> = {
  resume: "📄",
  manual: "✍️",
  suggested: "🤖",
};

const SOURCE_TABS: { key: SkillSource | "all"; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <BarChart3 className="w-3 h-3" /> },
  { key: "resume", label: "Resume", icon: <BookOpen className="w-3 h-3" /> },
  { key: "manual", label: "Manual", icon: <Plus className="w-3 h-3" /> },
  { key: "suggested", label: "AI", icon: <Sparkles className="w-3 h-3" /> },
];

const INDUSTRIES = [
  "Software Engineering", "Data Science", "Cybersecurity", "Cloud & DevOps",
  "AI / ML", "Product Management", "UX Design", "Mobile Development",
  "Blockchain", "Embedded Systems",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cycleStatus(current: SkillStatus): SkillStatus {
  const order: SkillStatus[] = ["interested", "learning", "learned", "ignored"];
  return order[(order.indexOf(current) + 1) % order.length];
}

function cycleProficiency(current: SkillProficiency): SkillProficiency {
  return PROFICIENCY_ORDER[(PROFICIENCY_ORDER.indexOf(current) + 1) % PROFICIENCY_ORDER.length];
}

// ─── SkillCard ────────────────────────────────────────────────────────────────

function SkillCard({ skill, onStatusChange, onProficiencyChange, onDelete }: {
  skill: Skill;
  onStatusChange: (id: string, next: SkillStatus) => void;
  onProficiencyChange: (id: string, next: SkillProficiency) => void;
  onDelete: (id: string) => void;
}) {
  const isIgnored = skill.status === "ignored";

  // Color scheme per source
  const sourceColors = {
    resume: {
      border: isIgnored ? "border-white/5" : "border-blue-500/20 hover:border-blue-400/40",
      bg: isIgnored ? "bg-white/[0.02]" : "bg-blue-950/30 hover:bg-blue-950/50",
      glow: "hover:shadow-blue-900/20",
      accent: "bg-blue-500/20 border-blue-500/30",
      dot: "bg-blue-400",
    },
    manual: {
      border: isIgnored ? "border-white/5" : "border-violet-500/20 hover:border-violet-400/40",
      bg: isIgnored ? "bg-white/[0.02]" : "bg-violet-950/30 hover:bg-violet-950/50",
      glow: "hover:shadow-violet-900/20",
      accent: "bg-violet-500/20 border-violet-500/30",
      dot: "bg-violet-400",
    },
    suggested: {
      border: isIgnored ? "border-white/5" : "border-purple-500/20 hover:border-purple-400/40",
      bg: isIgnored ? "bg-white/[0.02]" : "bg-purple-950/30 hover:bg-purple-950/50",
      glow: "hover:shadow-purple-900/20",
      accent: "bg-purple-500/20 border-purple-500/30",
      dot: "bg-purple-400",
    },
  };

  const c = sourceColors[skill.source];

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg ${c.border} ${c.bg} ${c.glow} ${
        isIgnored ? "opacity-40" : ""
      }`}
      style={{ minHeight: "226px" }}  // uniform min height
    >
      {/* Top row — source + priority + delete */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Colored source dot + label */}
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              {skill.source}
            </span>
          </div>
          {skill.meta?.priority && (
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${PRIORITY_STYLES[skill.meta.priority]}`}>
              {skill.meta.priority}
            </span>
          )}
          {skill.meta?.category && (
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] text-white/30 font-medium">
              {skill.meta.category}
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(skill.id)}
          className="opacity-0 group-hover:opacity-100 rounded-full p-1 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 flex-shrink-0"
          title="Remove skill"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Skill name */}
      <p className={`text-sm font-semibold leading-tight tracking-tight mb-2 ${
        isIgnored ? "line-through text-white/20" : "text-white"
      }`}>
        {skill.skillName}
      </p>

      {/* Reason — fixed height zone so cards stay aligned */}
      <div className="flex-1 mb-3">
        {skill.meta?.reason ? (
          <p className="text-[11px] text-white/30 leading-relaxed border-l-2 border-purple-500/30 pl-2.5 italic line-clamp-2">
            {skill.meta.reason} 
          </p>
        ) :   <p className="text-[11px] mt-7 text-white/30 leading-relaxed border-l-2 border-purple-500/30 pl-2.5 italic line-clamp-2">
            No Description provided .
          </p>}
      </div>

      {/* Proficiency — always at same vertical position */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/25 uppercase tracking-widest font-medium">
            Proficiency
          </span>
          <button
            onClick={() => onProficiencyChange(skill.id, cycleProficiency(skill.proficiency))}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all duration-200 hover:scale-105 ${PROFICIENCY_COLORS[skill.proficiency]}`}
          >
            {skill.proficiency}
          </button>
        </div>
        <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden mb-3">
          <div className={`h-1 rounded-full transition-all duration-700 ease-out ${PROFICIENCY_BAR[skill.proficiency]} ${PROFICIENCY_WIDTH[skill.proficiency]}`} />
        </div>

        {/* Status badge */}
        <button
          onClick={() => onStatusChange(skill.id, cycleStatus(skill.status))}
          className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all duration-200 hover:scale-105 ${STATUS_STYLES[skill.status]}`}
        >
          {skill.status}
        </button>
      </div>
    </div>
  );
}

// ─── AddSkillModal ────────────────────────────────────────────────────────────

function AddSkillModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (name: string, proficiency: SkillProficiency) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [proficiency, setProficiency] = useState<SkillProficiency>("none");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    setLoading(true);
    await onAdd(name.trim(), proficiency);
    setLoading(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0b1e]/90 backdrop-blur-xl p-6 shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
     <div className="flex items-center justify-between mb-5">
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300" />
    </div>
    <h3 className="text-xs sm:text-sm font-bold text-white">Add Skill</h3>
  </div>
  <button
    onClick={onClose}
    className="text-white/30 hover:text-white/70 transition-colors p-1 -mr-1 rounded-md hover:bg-white/5 flex-shrink-0"
  >
    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
  </button>
</div>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="e.g. TypeScript, System Design…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all mb-4"
        />

        <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-2.5">Proficiency</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {PROFICIENCY_ORDER.map((p) => (
            <button
              key={p}
              onClick={() => setProficiency(p)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                proficiency === p ? PROFICIENCY_COLORS[p] : "bg-white/5 text-white/30 border border-white/10 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 py-2.5 text-xs font-bold text-white disabled:opacity-30 transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Adding…
              </span>
            ) : "Add Skill"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── IndustryAnalyzerPanel ────────────────────────────────────────────────────

function IndustryAnalyzerPanel({ onAnalyze, analyzing, lastIndustry }: {
  onAnalyze: (industry: string) => Promise<void>;
  analyzing: boolean;
  lastIndustry: string | null;
}) {
  const [industry, setIndustry] = useState(lastIndustry ?? "");
  const [custom, setCustom] = useState("");
  const selectedIndustry = industry === "__custom__" ? custom : industry;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-purple-300" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">AI Analyzer</h3>
          <p className="text-[10px] text-white/30">Industry skill suggestions</p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => setIndustry(ind)}
            className={`rounded-xl px-2.5 py-2 text-left text-[11px] font-medium transition-all duration-200 ${
              industry === ind
                ? "bg-gradient-to-r from-purple-600/40 to-violet-600/30 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-900/30"
                : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/70 hover:border-white/10"
            }`}
          >
            {ind}
          </button>
        ))}
        <button
          onClick={() => setIndustry("__custom__")}
          className={`rounded-xl px-2.5 py-2 text-left text-[11px] font-medium transition-all duration-200 col-span-2 ${
            industry === "__custom__"
              ? "bg-gradient-to-r from-purple-600/40 to-violet-600/30 text-purple-200 border border-purple-500/40"
              : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/70 hover:border-white/10"
          }`}
        >
          ✏️ Custom industry…
        </button>
      </div>

      {industry === "__custom__" && (
        <input
          autoFocus
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="e.g. Fintech, Game Development…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-all mb-3"
        />
      )}

      {lastIndustry && (
        <p className="text-[10px] text-white/20 mb-3 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          Last: <span className="text-white/35 ml-1">{lastIndustry}</span>
        </p>
      )}

      <button
        disabled={!selectedIndustry.trim() || analyzing}
        onClick={() => onAnalyze(selectedIndustry.trim())}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 py-2.5 text-xs font-bold text-white disabled:opacity-30 transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/40 flex items-center justify-center gap-2"
      >
        {analyzing ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Analyzing…
          </>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5" />
            Analyze & Suggest
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────

function StatsBar({ skills }: { skills: Skill[] }) {
  const total = skills.filter((s) => s.status !== "ignored").length;
  const learned = skills.filter((s) => s.status === "learned").length;
  const learning = skills.filter((s) => s.status === "learning").length;
  const expert = skills.filter((s) => s.proficiency === "expert").length;

  const stats = [
    { label: "Total Active", value: total, color: "text-white", bg: "from-purple-500/20 to-violet-500/10", border: "border-purple-500/20", icon: <Target className="w-4 h-4 text-purple-400" /> },
    { label: "Learned", value: learned, color: "text-emerald-300", bg: "from-emerald-500/15 to-emerald-500/5", border: "border-emerald-500/20", icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { label: "Learning", value: learning, color: "text-sky-300", bg: "from-sky-500/15 to-sky-500/5", border: "border-sky-500/20", icon: <Brain className="w-4 h-4 text-sky-400" /> },
    { label: "Expert Level", value: expert, color: "text-amber-300", bg: "from-amber-500/15 to-amber-500/5", border: "border-amber-500/20", icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-br ${s.bg} p-4 backdrop-blur-sm`}>
          <div className="flex items-start justify-between mb-2">
            <p className={`text-2xl font-bold tabular-nums tracking-tight ${s.color}`}>{s.value}</p>
            {s.icon}
          </div>
          <p className="text-[11px] text-white/30 font-medium">{s.label}</p>
          {/* subtle corner glow */}
          <div className="pointer-events-none absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/5 blur-xl" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SkillsTrackerPage() {
  const { user } = useUser();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SkillSource | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastIndustry, setLastIndustry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function toast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const fetchSkills = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/skills?userId=${userId}`);
      const data = await res.json();
      setSkills(data.skills ?? []);
    } catch {
      toast("Failed to load skills.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestedMeta = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/skills/suggested?userId=${userId}`);
      const data = await res.json();
      if (data.industry) setLastIndustry(data.industry);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchSkills(user.id);
    fetchSuggestedMeta(user.id);
  }, [user?.id]);

  async function handleAddSkill(name: string, proficiency: SkillProficiency) {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, skillName: name, source: "manual", proficiency }),
      });
      const data = await res.json();
      setSkills((prev) => [...prev, data.skill]);
      toast(`"${name}" added.`);
    } catch {
      toast("Failed to add skill.");
    }
  }

  async function handleStatusChange(id: string, next: SkillStatus) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, status: next } : s)));
    try {
      await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, status: next }),
      });
    } catch {
      toast("Failed to update status.");
      if (user?.id) fetchSkills(user.id);
    }
  }

  async function handleProficiencyChange(id: string, next: SkillProficiency) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, proficiency: next } : s)));
    try {
      await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, proficiency: next }),
      });
    } catch {
      toast("Failed to update proficiency.");
      if (user?.id) fetchSkills(user.id);
    }
  }

  async function handleDelete(id: string) {
    const skill = skills.find((s) => s.id === id);
    setSkills((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/skills/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      toast(`"${skill?.skillName}" removed.`);
    } catch {
      toast("Failed to delete skill.");
      if (user?.id) fetchSkills(user.id);
    }
  }

  async function handleAnalyze(industry: string) {
    if (!user?.id) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/skills/analyze-industry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, industry }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLastIndustry(industry);
      setActiveTab("suggested");
      await fetchSkills(user.id);
      toast(`${data.count} suggestions generated for ${industry}!`);
    } catch {
      toast("AI analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  const filteredSkills = skills.filter((s) => {
    const matchesTab = activeTab === "all" || s.source === activeTab;
    const matchesSearch =
      !searchQuery ||
      s.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.meta?.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeSkillsCount = skills.filter(
    (s) => s.status !== "ignored" && s.source !== "suggested"
  ).length;

  return (
    <div className="relative min-h-screen text-white">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-96 h-96 rounded-full bg-purple-700/10 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-700/10 blur-[120px]" />

      {/* Grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
        }}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-xl px-5 py-2.5 text-xs text-white shadow-2xl">
            <Sparkles className="w-3 h-3 text-purple-300" />
            {toastMessage}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-2 md:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="md:w-8 md:h-8 w-[53px] h-[47px] rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-300" />
              </div>
              <h1 className="md:text-2xl text-xl font-bold tracking-tight text-white">Skills Tracker</h1>
            </div>
            <p className="text-sm text-white/30 ml:0 md:ml-10.5">
              {activeSkillsCount} active skills tracked
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/40 hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
            Add Skill
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsBar skills={skills} />
        </div>

        <div className="flex gap-5 flex-col lg:flex-row">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Filters */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-1">
                {SOURCE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-900/40"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${
                      activeTab === tab.key ? "bg-white/20 text-white" : "bg-white/5 text-white/30"
                    }`}>
                      {tab.key === "all" ? skills.length : skills.filter((s) => s.source === tab.key).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative flex-1 min-w-[160px] max-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-40 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-sm font-medium text-white/30 mb-1">
                  {activeTab === "suggested" ? "No AI suggestions yet" : "No skills found"}
                </p>
                <p className="text-xs text-white/20 mb-5">
                  {activeTab === "suggested" ? "Run the analyzer to get personalized suggestions →" : "Start building your skill profile"}
                </p>
                {activeTab !== "suggested" && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs text-white/40 hover:text-white/70 transition-all"
                  >
                    + Add your first skill
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredSkills.map((skill, i) => (
                  <div key={skill.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 30}ms` }}>
                    <SkillCard
                      skill={skill}
                      onStatusChange={handleStatusChange}
                      onProficiencyChange={handleProficiencyChange}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
            <IndustryAnalyzerPanel
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              lastIndustry={lastIndustry}
            />

            {/* Status guide */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-3.5 h-3.5 text-white/25" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Status Guide</p>
              </div>
              <div className="flex flex-col gap-2">
                {(["interested", "learning", "learned", "ignored"] as SkillStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${STATUS_STYLES[s]}`}>
                      {s}
                    </span>
                    <span className="text-[11px] text-white/25">
                      {s === "interested" && "On your radar"}
                      {s === "learning" && "Currently studying"}
                      {s === "learned" && "Confident skill"}
                      {s === "ignored" && "Not relevant"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-3 mb-3" />
              <p className="text-[10px] text-white/20 leading-relaxed">
                Click any status badge or proficiency pill to cycle through options.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddSkillModal onClose={() => setShowAddModal(false)} onAdd={handleAddSkill} />
      )}
    </div>
  );
}