import { desc, eq } from "drizzle-orm";
import { db } from "@/index";
import { dailyProgress, tasks } from "@/utils/db/schema/schema";
import type { ResumeProfile } from "@/lib/resume-profile";
import type { DashboardSession } from "../_lib/session";

type ProgressTone = "emerald" | "cyan" | "amber" | "rose";

export const reportsFallbackPayload = {
  metrics: {
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
  },
  weeklyTrend: [
    { day: "Mon", score: 62 },
    { day: "Tue", score: 68 },
    { day: "Wed", score: 71 },
    { day: "Thu", score: 66 },
    { day: "Fri", score: 78 },
    { day: "Sat", score: 74 },
    { day: "Sun", score: 81 },
  ],
  categoryBreakdown: [
    {
      label: "Resume Refinement",
      value: 79,
      note: "Strong momentum in formatting and keyword alignment",
      tone: "emerald" as ProgressTone,
    },
    {
      label: "Project Delivery",
      value: 65,
      note: "Good build pace, polish and metrics still pending",
      tone: "cyan" as ProgressTone,
    },
    {
      label: "Interview Preparation",
      value: 58,
      note: "Needs consistent daily practice sessions",
      tone: "amber" as ProgressTone,
    },
  ],
  insightNotes: [
    "Your highest output days are Friday and Sunday, ideal for deep project work.",
    "Resume score improved by 6 points after quantified achievements were added.",
    "A focused interview prep block can raise readiness by 10-12% this month.",
  ],
};

function clampPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toDayLabel(date: Date | string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString(undefined, { weekday: "short" });
}

function getNextReviewDay(): string {
  const today = new Date();
  const nextMonday = new Date(today);
  const day = today.getDay();
  const delta = (8 - day) % 7 || 7;
  nextMonday.setDate(today.getDate() + delta);

  return nextMonday.toLocaleDateString(undefined, { weekday: "long" });
}

function buildCategoryValue(total: number, completed: number, fallback: number): number {
  if (total === 0) return fallback;
  return clampPercent((completed / total) * 100);
}

export async function getReportsPayload(session: DashboardSession, resumeProfile?: ResumeProfile | null) {
  const [progressRows, taskRows] = await Promise.all([
    db
      .select({
        date: dailyProgress.date,
        tasksCompleted: dailyProgress.tasksCompleted,
        tasksTotal: dailyProgress.tasksTotal,
        streakDay: dailyProgress.streakDay,
      })
      .from(dailyProgress)
      .where(eq(dailyProgress.userId, session.userId))
      .orderBy(desc(dailyProgress.date))
      .limit(7),
    db
      .select({
        category: tasks.category,
        status: tasks.status,
      })
      .from(tasks)
      .where(eq(tasks.userId, session.userId))
      .limit(300),
  ]);

  const weeklyTrend = [...reportsFallbackPayload.weeklyTrend];

  if (progressRows.length > 0) {
    const trendByDay = new Map<string, number>();

    for (const row of progressRows) {
      const day = toDayLabel(row.date);
      const total = row.tasksTotal ?? 0;
      const completed = row.tasksCompleted ?? 0;
      const computedScore = total > 0 ? clampPercent((completed / total) * 100) : clampPercent((row.streakDay ?? 0) * 12);
      trendByDay.set(day, computedScore);
    }

    for (const item of weeklyTrend) {
      if (trendByDay.has(item.day)) {
        item.score = trendByDay.get(item.day) ?? item.score;
      }
    }
  }

  const weeklyScore = clampPercent(
    weeklyTrend.reduce((sum, item) => sum + item.score, 0) / weeklyTrend.length,
  );

  const activeStreak = progressRows[0]?.streakDay ?? 0;
  const reportCoverage = progressRows.length > 0 ? clampPercent((progressRows.length / 7) * 100) : 0;

  const categorized = {
    resume: { total: 0, completed: 0 },
    project: { total: 0, completed: 0 },
    interview: { total: 0, completed: 0 },
  };

  for (const row of taskRows) {
    const category = (row.category ?? "").toLowerCase();
    const isCompleted = row.status === "completed";

    if (category.includes("resume")) {
      categorized.resume.total += 1;
      if (isCompleted) categorized.resume.completed += 1;
    }

    if (category.includes("project")) {
      categorized.project.total += 1;
      if (isCompleted) categorized.project.completed += 1;
    }

    if (category.includes("interview") || category.includes("practice")) {
      categorized.interview.total += 1;
      if (isCompleted) categorized.interview.completed += 1;
    }
  }

  const categoryBreakdown = [
    {
      label: "Resume Refinement",
      value: buildCategoryValue(
        categorized.resume.total,
        categorized.resume.completed,
        resumeProfile ? clampPercent(resumeProfile.resumeScore) : 79,
      ),
      note: categorized.resume.total > 0
        ? `${categorized.resume.completed}/${categorized.resume.total} resume tasks completed`
        : resumeProfile
          ? `Latest resume for ${resumeProfile.targetRole} scored ${clampPercent(resumeProfile.resumeScore)}%`
        : "Strong momentum in formatting and keyword alignment",
      tone: "emerald" as ProgressTone,
    },
    {
      label: "Project Delivery",
      value: buildCategoryValue(categorized.project.total, categorized.project.completed, 65),
      note: categorized.project.total > 0
        ? `${categorized.project.completed}/${categorized.project.total} project tasks completed`
        : "Good build pace, polish and metrics still pending",
      tone: "cyan" as ProgressTone,
    },
    {
      label: "Interview Preparation",
      value: buildCategoryValue(
        categorized.interview.total,
        categorized.interview.completed,
        resumeProfile ? clampPercent(resumeProfile.resumeScore - 10) : 58,
      ),
      note: categorized.interview.total > 0
        ? `${categorized.interview.completed}/${categorized.interview.total} interview tasks completed`
        : resumeProfile && resumeProfile.focusAreas.length > 0
          ? `Focus: ${resumeProfile.focusAreas[0]}`
        : "Needs consistent daily practice sessions",
      tone: "amber" as ProgressTone,
    },
  ];

  const bestDay = weeklyTrend.reduce((best, current) => (current.score > best.score ? current : best), weeklyTrend[0]);
  const weakestCategory = categoryBreakdown.reduce((min, item) => (item.value < min.value ? item : min), categoryBreakdown[0]);

  const consistencyNote = weeklyScore >= 70
    ? "Weekly consistency is healthy; maintain this rhythm for compounding growth."
    : "A consistent daily completion streak can quickly improve weekly score.";

  const insightNotes = [
    `Your strongest output day is ${bestDay.day} at ${bestDay.score}%.`,
    `${weakestCategory.label} is currently the lowest area at ${weakestCategory.value}%.`,
    resumeProfile
      ? `Latest resume target role is ${resumeProfile.targetRole}; use this report to prioritize ${resumeProfile.focusAreas[0] ?? "interview readiness"}.`
      : consistencyNote,
  ];

  if (resumeProfile) {
    insightNotes.push(consistencyNote);
  }

  return {
    metrics: {
      weeklyScore: {
        value: `${weeklyScore}%`,
        change: weeklyScore >= 70 ? "Strong week" : "Recovery week",
        helperText: "Average of last 7 tracked days",
      },
      activeStreak: {
        value: `${activeStreak} days`,
        change: activeStreak > 0 ? "Current" : "Start today",
        helperText: "Based on latest daily progress record",
      },
      reportCoverage: {
        value: `${reportCoverage}%`,
        change: reportCoverage >= 85 ? "Comprehensive" : "Partial",
        helperText: "How many recent days have tracked progress",
      },
      nextReview: {
        value: getNextReviewDay(),
        change: "Scheduled",
        helperText: "Weekly sync checkpoint",
      },
    },
    weeklyTrend,
    categoryBreakdown,
    insightNotes,
    source: "database" as const,
  };
}
