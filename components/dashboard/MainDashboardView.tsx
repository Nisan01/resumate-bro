"use client";

import { useEffect, useState } from "react";
import {
  DashboardPageShell,
  DashboardPanel,
  MetricCard,
  ProgressMeter,
  StatusBadge,
} from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Briefcase,
  Gauge,
  ListChecks,
  Target,
  TrendingUp,
} from "lucide-react";

const todayFocus: DashboardOverviewResponse["todayFocus"] = [
  {
    task: "Tune resume summary for Frontend Engineer role",
    eta: "25 min",
    status: "Now",
  },
  {
    task: "Add deployment details in Portfolio Project",
    eta: "40 min",
    status: "Queued",
  },
  {
    task: "Practice 5 JS interview questions",
    eta: "20 min",
    status: "Done",
  },
];

const skillMomentum: DashboardOverviewResponse["skillMomentum"] = [
  { label: "React + Next.js", value: 82, note: "Strong delivery speed this week", tone: "emerald" as const },
  { label: "System Design", value: 58, note: "Needs more scenario practice", tone: "amber" as const },
  { label: "Behavioral Storytelling", value: 71, note: "Good interview readiness", tone: "cyan" as const },
];

const resumeSignals: DashboardOverviewResponse["resumeSignals"] = [
  {
    signal: "Quantified achievements are missing in 2 recent projects",
    severity: "High",
    action: "Add impact metrics using numbers and outcomes.",
  },
  {
    signal: "Keyword alignment for Product Engineer role is partial",
    severity: "Medium",
    action: "Add role-specific phrases in summary and skills.",
  },
  {
    signal: "Overall formatting and section order is consistent",
    severity: "Low",
    action: "Keep this structure for future updates.",
  },
];

const roadmapCheckpoints: DashboardOverviewResponse["roadmapCheckpoints"] = [
  {
    phase: "April Sprint",
    target: "Complete resume analyzer integration and upload validation",
    due: "Due in 4 days",
  },
  {
    phase: "May Sprint",
    target: "Ship projects and reports pages with API wiring",
    due: "Starts next week",
  },
  {
    phase: "June Sprint",
    target: "Launch interview prep and roadmap intelligence modules",
    due: "Planned milestone",
  },
];

const glassItemCardClass =
  "rounded-2xl border border-white/24 bg-gradient-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-5 sm:p-6 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

const glassActionButtonClass =
  "!border-white/35 !bg-slate-900/72 !text-slate-100 shadow-[0_10px_22px_rgba(2,8,24,0.34)] hover:!bg-slate-800/78 hover:!text-white";

type BadgeTone = "success" | "info" | "warning" | "danger" | "neutral";

interface DashboardMetric {
  value: string;
  change: string;
  helperText: string;
}

interface DashboardOverviewResponse {
  metrics: {
    resumeStrength: DashboardMetric;
    weeklyConsistency: DashboardMetric;
    activeProjects: DashboardMetric;
    interviewReadiness: DashboardMetric;
  };
  todayFocus: Array<{ task: string; eta: string; status: string }>;
  skillMomentum: Array<{ label: string; value: number; note: string; tone: "emerald" | "cyan" | "amber" | "rose" }>;
  resumeSignals: Array<{ signal: string; severity: string; action: string }>;
  roadmapCheckpoints: Array<{ phase: string; target: string; due: string }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && !Array.isArray(value) && typeof value === "object";
}

function toDashboardMetric(value: unknown, fallback: DashboardMetric): DashboardMetric {
  if (!isRecord(value)) return fallback;

  const candidate = value as Partial<DashboardMetric>;

  return {
    value: typeof candidate.value === "string" ? candidate.value : fallback.value,
    change: typeof candidate.change === "string" ? candidate.change : fallback.change,
    helperText: typeof candidate.helperText === "string" ? candidate.helperText : fallback.helperText,
  };
}

function mergeDashboardMetrics(value: unknown): DashboardOverviewResponse["metrics"] {
  if (!isRecord(value)) return defaultMetrics;

  return {
    resumeStrength: toDashboardMetric(value.resumeStrength, defaultMetrics.resumeStrength),
    weeklyConsistency: toDashboardMetric(value.weeklyConsistency, defaultMetrics.weeklyConsistency),
    activeProjects: toDashboardMetric(value.activeProjects, defaultMetrics.activeProjects),
    interviewReadiness: toDashboardMetric(value.interviewReadiness, defaultMetrics.interviewReadiness),
  };
}

function parseTodayFocus(value: unknown): DashboardOverviewResponse["todayFocus"] | null {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .map((item) => {
      if (!isRecord(item)) return null;
      if (typeof item.task !== "string" || typeof item.eta !== "string" || typeof item.status !== "string") {
        return null;
      }

      return { task: item.task, eta: item.eta, status: item.status };
    })
    .filter((item): item is DashboardOverviewResponse["todayFocus"][number] => Boolean(item));

  return normalized.length > 0 ? normalized : null;
}

function parseSkillMomentum(value: unknown): DashboardOverviewResponse["skillMomentum"] | null {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .map((item) => {
      if (!isRecord(item)) return null;
      if (
        typeof item.label !== "string" ||
        typeof item.value !== "number" ||
        typeof item.note !== "string" ||
        (item.tone !== "emerald" && item.tone !== "cyan" && item.tone !== "amber" && item.tone !== "rose")
      ) {
        return null;
      }

      return {
        label: item.label,
        value: item.value,
        note: item.note,
        tone: item.tone,
      };
    })
    .filter((item): item is DashboardOverviewResponse["skillMomentum"][number] => Boolean(item));

  return normalized.length > 0 ? normalized : null;
}

function parseResumeSignals(value: unknown): DashboardOverviewResponse["resumeSignals"] | null {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .map((item) => {
      if (!isRecord(item)) return null;
      if (typeof item.signal !== "string" || typeof item.severity !== "string" || typeof item.action !== "string") {
        return null;
      }

      return {
        signal: item.signal,
        severity: item.severity,
        action: item.action,
      };
    })
    .filter((item): item is DashboardOverviewResponse["resumeSignals"][number] => Boolean(item));

  return normalized.length > 0 ? normalized : null;
}

function parseRoadmapCheckpoints(value: unknown): DashboardOverviewResponse["roadmapCheckpoints"] | null {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .map((item) => {
      if (!isRecord(item)) return null;
      if (typeof item.phase !== "string" || typeof item.target !== "string" || typeof item.due !== "string") {
        return null;
      }

      return {
        phase: item.phase,
        target: item.target,
        due: item.due,
      };
    })
    .filter((item): item is DashboardOverviewResponse["roadmapCheckpoints"][number] => Boolean(item));

  return normalized.length > 0 ? normalized : null;
}

const defaultMetrics: DashboardOverviewResponse["metrics"] = {
  resumeStrength: {
    value: "82 / 100",
    change: "+6 this month",
    helperText: "Top 15% among peers",
  },
  weeklyConsistency: {
    value: "74%",
    change: "5 day streak",
    helperText: "2 focused sessions left",
  },
  activeProjects: {
    value: "3",
    change: "1 in review",
    helperText: "Portfolio + capstone",
  },
  interviewReadiness: {
    value: "68%",
    change: "Improving",
    helperText: "Behavioral answers pending",
  },
};

function getTaskStatusTone(status: string): BadgeTone {
  if (status === "Now") return "warning";
  if (status === "Queued") return "info";
  if (status === "Done") return "success";
  return "neutral";
}

function getSeverityTone(severity: string): BadgeTone {
  if (severity === "High") return "danger";
  if (severity === "Medium") return "warning";
  if (severity === "Low") return "success";
  return "neutral";
}

export function MainDashboardView() {
  const { user, loading, logout } = useUser();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardOverviewResponse["metrics"]>(defaultMetrics);
  const [todayFocusItems, setTodayFocusItems] = useState<DashboardOverviewResponse["todayFocus"]>(todayFocus);
  const [skillMomentumItems, setSkillMomentumItems] = useState<DashboardOverviewResponse["skillMomentum"]>(skillMomentum);
  const [resumeSignalsItems, setResumeSignalsItems] = useState<DashboardOverviewResponse["resumeSignals"]>(resumeSignals);
  const [roadmapCheckpointItems, setRoadmapCheckpointItems] = useState<DashboardOverviewResponse["roadmapCheckpoints"]>(roadmapCheckpoints);

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard/overview", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = (await res.json()) as Partial<DashboardOverviewResponse>;
        if (cancelled) return;

        setMetrics(mergeDashboardMetrics(data.metrics));

        const nextTodayFocus = parseTodayFocus(data.todayFocus);
        if (nextTodayFocus) setTodayFocusItems(nextTodayFocus);

        const nextSkillMomentum = parseSkillMomentum(data.skillMomentum);
        if (nextSkillMomentum) setSkillMomentumItems(nextSkillMomentum);

        const nextResumeSignals = parseResumeSignals(data.resumeSignals);
        if (nextResumeSignals) setResumeSignalsItems(nextResumeSignals);

        const nextRoadmapCheckpoints = parseRoadmapCheckpoints(data.roadmapCheckpoints);
        if (nextRoadmapCheckpoints) setRoadmapCheckpointItems(nextRoadmapCheckpoints);
      } catch {
        // Keep default UI data as resilient fallback.
      }
    };

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [loading]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/sign-in");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <DashboardPageShell
        eyebrow="Career Command Center"
        title="Preparing your dashboard"
        description="Loading your profile context and progress snapshots."
      >
        <DashboardPanel title="Syncing data">
          <p className="text-sm text-slate-300">Please wait while we fetch your latest activity.</p>
        </DashboardPanel>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      eyebrow="Career Command Center"
      title={`Welcome back, ${firstName}`}
      description="Track resume quality, project progress, and roadmap milestones from one focused workspace."
      action={
        <Button
          variant="outline"
          className={glassActionButtonClass}
          onClick={handleLogout}
        >
          Logout
        </Button>
      }
    >
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Resume Strength"
          value={metrics.resumeStrength.value}
          change={metrics.resumeStrength.change}
          helperText={metrics.resumeStrength.helperText}
          tone="teal"
          icon={<Gauge className="h-4 w-4" />}
        />
        <MetricCard
          label="Weekly Consistency"
          value={metrics.weeklyConsistency.value}
          change={metrics.weeklyConsistency.change}
          helperText={metrics.weeklyConsistency.helperText}
          tone="amber"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Projects"
          value={metrics.activeProjects.value}
          change={metrics.activeProjects.change}
          helperText={metrics.activeProjects.helperText}
          tone="sky"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <MetricCard
          label="Interview Readiness"
          value={metrics.interviewReadiness.value}
          change={metrics.interviewReadiness.change}
          helperText={metrics.interviewReadiness.helperText}
          tone="rose"
          icon={<Target className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <DashboardPanel
          className="xl:col-span-2"
          title="Today Focus"
          description="High-impact tasks to move your profile forward."
          action={
            <Button variant="ghost" className="text-slate-100 hover:bg-white/10 hover:text-white">
              <ListChecks className="mr-2 h-4 w-4" />
              Open task planner
            </Button>
          }
        >
          <ul className="space-y-3">
            {todayFocusItems.map((item, index) => (
              <li
                key={`${item.task}-${index}`}
                className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${glassItemCardClass}`}
              >
                <div>
                  <p className="font-medium text-slate-100">{item.task}</p>
                  <p className="mt-1 text-sm text-slate-300">Estimated effort: {item.eta}</p>
                </div>
                <StatusBadge tone={getTaskStatusTone(item.status)}>{item.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel title="Skill Momentum" description="Progress against your current learning targets.">
          <div className="space-y-4">
            {skillMomentumItems.map((skill) => (
              <ProgressMeter
                key={skill.label}
                label={skill.label}
                value={skill.value}
                note={skill.note}
                tone={skill.tone}
              />
            ))}
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardPanel
          title="Resume Intelligence"
          description="Signals from your latest resume analysis."
          action={
            <Button variant="ghost" className="text-slate-100 hover:bg-white/10 hover:text-white">
              Full analyzer report
            </Button>
          }
        >
          <ul className="space-y-3">
            {resumeSignalsItems.map((item, index) => (
              <li key={`${item.signal}-${index}`} className={glassItemCardClass}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-slate-100">{item.signal}</p>
                  <StatusBadge tone={getSeverityTone(item.severity)}>{item.severity}</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{item.action}</p>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Roadmap Checkpoints"
          description="Upcoming milestones from your career growth timeline."
        >
          <ul className="space-y-3">
            {roadmapCheckpointItems.map((checkpoint, index) => (
              <li key={`${checkpoint.phase}-${index}`} className={glassItemCardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{checkpoint.phase}</p>
                    <p className="mt-1 text-sm text-slate-300">{checkpoint.target}</p>
                  </div>
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-200" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-300">{checkpoint.due}</p>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </section>
    </DashboardPageShell>
  );
}
