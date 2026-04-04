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

        if (data.metrics) {
          setMetrics(data.metrics);
        }

        if (Array.isArray(data.todayFocus) && data.todayFocus.length > 0) {
          setTodayFocusItems(data.todayFocus);
        }

        if (Array.isArray(data.skillMomentum) && data.skillMomentum.length > 0) {
          setSkillMomentumItems(data.skillMomentum);
        }

        if (Array.isArray(data.resumeSignals) && data.resumeSignals.length > 0) {
          setResumeSignalsItems(data.resumeSignals);
        }

        if (Array.isArray(data.roadmapCheckpoints) && data.roadmapCheckpoints.length > 0) {
          setRoadmapCheckpointItems(data.roadmapCheckpoints);
        }
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
            {todayFocusItems.map((item) => (
              <li
                key={item.task}
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
            {resumeSignalsItems.map((item) => (
              <li key={item.signal} className={glassItemCardClass}>
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
            {roadmapCheckpointItems.map((checkpoint) => (
              <li key={checkpoint.phase} className={glassItemCardClass}>
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
