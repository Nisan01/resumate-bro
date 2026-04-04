"use client";

import { useEffect, useState } from "react";
import { DashboardPageShell, DashboardPanel, MetricCard, ProgressMeter } from "@/components/shared/dashboard";
import { BarChart3, CalendarDays, FileCheck2, Flame } from "lucide-react";

const weeklyTrend: ReportsResponse["weeklyTrend"] = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 68 },
  { day: "Wed", score: 71 },
  { day: "Thu", score: 66 },
  { day: "Fri", score: 78 },
  { day: "Sat", score: 74 },
  { day: "Sun", score: 81 },
];

const categoryBreakdown: ReportsResponse["categoryBreakdown"] = [
  {
    label: "Resume Refinement",
    value: 79,
    note: "Strong momentum in formatting and keyword alignment",
    tone: "emerald" as const,
  },
  {
    label: "Project Delivery",
    value: 65,
    note: "Good build pace, polish and metrics still pending",
    tone: "cyan" as const,
  },
  {
    label: "Interview Preparation",
    value: 58,
    note: "Needs consistent daily practice sessions",
    tone: "amber" as const,
  },
];

const insightNotes: ReportsResponse["insightNotes"] = [
  "Your highest output days are Friday and Sunday, ideal for deep project work.",
  "Resume score improved by 6 points after quantified achievements were added.",
  "A focused interview prep block can raise readiness by 10-12% this month.",
];

interface ReportsResponse {
  metrics: {
    weeklyScore: { value: string; change: string; helperText: string };
    activeStreak: { value: string; change: string; helperText: string };
    reportCoverage: { value: string; change: string; helperText: string };
    nextReview: { value: string; change: string; helperText: string };
  };
  weeklyTrend: Array<{ day: string; score: number }>;
  categoryBreakdown: Array<{
    label: string;
    value: number;
    note: string;
    tone: "emerald" | "cyan" | "amber" | "rose";
  }>;
  insightNotes: string[];
}

const defaultMetrics: ReportsResponse["metrics"] = {
  weeklyScore: {
    value: "74%",
    change: "+8 from last week",
    helperText: "Steady growth trend",
  },
  activeStreak: {
    value: "5 days",
    change: "Current",
    helperText: "2 more for your best run",
  },
  reportCoverage: {
    value: "92%",
    change: "Comprehensive",
    helperText: "All core modules tracked",
  },
  nextReview: {
    value: "Monday",
    change: "Scheduled",
    helperText: "Weekly sync checkpoint",
  },
};

const glassItemCardClass =
  "rounded-2xl border border-white/24 bg-gradient-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-5 sm:p-6 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

export function ReportsView() {
  const [metrics, setMetrics] = useState<ReportsResponse["metrics"]>(defaultMetrics);
  const [weeklyTrendData, setWeeklyTrendData] = useState<ReportsResponse["weeklyTrend"]>(weeklyTrend);
  const [categoryBreakdownData, setCategoryBreakdownData] = useState<ReportsResponse["categoryBreakdown"]>(categoryBreakdown);
  const [insightNotesData, setInsightNotesData] = useState<ReportsResponse["insightNotes"]>(insightNotes);

  useEffect(() => {
    let cancelled = false;

    const loadReportsData = async () => {
      try {
        const res = await fetch("/api/dashboard/reports", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = (await res.json()) as Partial<ReportsResponse>;
        if (cancelled) return;

        if (data.metrics) {
          setMetrics(data.metrics);
        }

        if (Array.isArray(data.weeklyTrend) && data.weeklyTrend.length > 0) {
          setWeeklyTrendData(data.weeklyTrend);
        }

        if (Array.isArray(data.categoryBreakdown) && data.categoryBreakdown.length > 0) {
          setCategoryBreakdownData(data.categoryBreakdown);
        }

        if (Array.isArray(data.insightNotes) && data.insightNotes.length > 0) {
          setInsightNotesData(data.insightNotes);
        }
      } catch {
        // Preserve fallback report data.
      }
    };

    void loadReportsData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardPageShell
      eyebrow="Reports"
      title="Progress and Performance Reports"
      description="Monitor your weekly execution, category-level strength, and action-oriented insights."
    >
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Weekly Score"
          value={metrics.weeklyScore.value}
          change={metrics.weeklyScore.change}
          helperText={metrics.weeklyScore.helperText}
          tone="teal"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Streak"
          value={metrics.activeStreak.value}
          change={metrics.activeStreak.change}
          helperText={metrics.activeStreak.helperText}
          tone="amber"
          icon={<Flame className="h-4 w-4" />}
        />
        <MetricCard
          label="Report Coverage"
          value={metrics.reportCoverage.value}
          change={metrics.reportCoverage.change}
          helperText={metrics.reportCoverage.helperText}
          tone="sky"
          icon={<FileCheck2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Next Review"
          value={metrics.nextReview.value}
          change={metrics.nextReview.change}
          helperText={metrics.nextReview.helperText}
          tone="rose"
          icon={<CalendarDays className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <DashboardPanel
          className="xl:col-span-2"
          title="7-Day Performance Trend"
          description="Daily score trend based on completed tasks and quality of outputs."
        >
          <div className="grid grid-cols-7 gap-2">
            {weeklyTrendData.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end rounded-xl border border-white/22 bg-linear-to-b from-slate-950/74 to-slate-800/56 p-1.5 shadow-[0_10px_24px_rgba(2,8,24,0.3)]">
                  <div
                    className="w-full rounded-md bg-linear-to-t from-cyan-400 to-emerald-300"
                    style={{ height: `${item.score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-200">{item.day}</p>
                <p className="text-xs font-medium text-slate-100">{item.score}%</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Category Breakdown"
          description="Contribution of each learning and execution category."
        >
          <div className="space-y-4">
            {categoryBreakdownData.map((item) => (
              <ProgressMeter
                key={item.label}
                label={item.label}
                value={item.value}
                note={item.note}
                tone={item.tone}
              />
            ))}
          </div>
        </DashboardPanel>
      </section>

      <section>
        <DashboardPanel title="Report Insights" description="Generated observations to guide your next actions.">
          <ul className="space-y-3">
            {insightNotesData.map((note, idx) => (
              <li key={idx} className={`${glassItemCardClass} text-sm text-slate-200`}>
                {note}
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </section>
    </DashboardPageShell>
  );
}
