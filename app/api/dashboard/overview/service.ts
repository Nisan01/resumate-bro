import { desc, eq } from "drizzle-orm";
import { db } from "@/index";
import {
  careerRoadmaps,
  dailyProgress,
  interviewSessions,
  resumes,
  resumeSuggestions,
  skills,
  tasks,
  userRoadmapEnrollments,
  userSkills,
} from "@/utils/db/schema/schema";
import type { ResumeProfile } from "@/lib/resume-profile";
import type { DashboardSession } from "../_lib/session";

type FocusStatus = "Now" | "Queued" | "Done";
type SkillTone = "emerald" | "cyan" | "amber" | "rose";
type SignalSeverity = "High" | "Medium" | "Low";

export const overviewFallbackPayload = {
  metrics: {
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
  },
  todayFocus: [
    {
      task: "Tune resume summary for Frontend Engineer role",
      eta: "25 min",
      status: "Now" as FocusStatus,
    },
    {
      task: "Add deployment details in Portfolio Project",
      eta: "40 min",
      status: "Queued" as FocusStatus,
    },
    {
      task: "Practice 5 JS interview questions",
      eta: "20 min",
      status: "Done" as FocusStatus,
    },
  ],
  skillMomentum: [
    { label: "React + Next.js", value: 82, note: "Strong delivery speed this week", tone: "emerald" as SkillTone },
    { label: "System Design", value: 58, note: "Needs more scenario practice", tone: "amber" as SkillTone },
    { label: "Behavioral Storytelling", value: 71, note: "Good interview readiness", tone: "cyan" as SkillTone },
  ],
  resumeSignals: [
    {
      signal: "Quantified achievements are missing in 2 recent projects",
      severity: "High" as SignalSeverity,
      action: "Add impact metrics using numbers and outcomes.",
    },
    {
      signal: "Keyword alignment for Product Engineer role is partial",
      severity: "Medium" as SignalSeverity,
      action: "Add role-specific phrases in summary and skills.",
    },
    {
      signal: "Overall formatting and section order is consistent",
      severity: "Low" as SignalSeverity,
      action: "Keep this structure for future updates.",
    },
  ],
  roadmapCheckpoints: [
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
  ],
};

function clampPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreToPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value <= 1) return clampPercent(value * 100);
  if (value <= 5) return clampPercent(value * 20);
  return clampPercent(value);
}

function toFocusStatus(status: string | null): FocusStatus {
  if (status === "completed") return "Done";
  if (status === "in_progress") return "Now";
  return "Queued";
}

function priorityToSeverity(priority: string | null): SignalSeverity {
  const normalized = (priority ?? "").toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  return "Low";
}

function formatEta(dueDate: Date | string | null): string {
  if (!dueDate) return "30 min";

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return "30 min";

  const daysRemaining = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) return "Today";
  if (daysRemaining === 1) return "1 day";
  return `${daysRemaining} days`;
}

function formatSignedChange(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return "0";
}

export async function getOverviewPayload(session: DashboardSession, resumeProfile?: ResumeProfile | null) {
  const [resumeRows, progressRows, taskRows, skillRows, signalRows, enrollmentRows, interviewRows] = await Promise.all([
    db
      .select({ resumeScore: resumes.resumeScore, createdAt: resumes.createdAt })
      .from(resumes)
      .where(eq(resumes.userId, session.userId))
      .orderBy(desc(resumes.createdAt))
      .limit(2),
    db
      .select({
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
        title: tasks.title,
        status: tasks.status,
        dueDate: tasks.dueDate,
        category: tasks.category,
      })
      .from(tasks)
      .where(eq(tasks.userId, session.userId))
      .orderBy(desc(tasks.updatedAt))
      .limit(12),
    db
      .select({
        label: skills.name,
        level: userSkills.proficiencyLevel,
      })
      .from(userSkills)
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, session.userId))
      .orderBy(desc(userSkills.proficiencyLevel), desc(userSkills.addedAt))
      .limit(3),
    db
      .select({
        suggestion: resumeSuggestions.suggestion,
        priority: resumeSuggestions.priority,
      })
      .from(resumeSuggestions)
      .innerJoin(resumes, eq(resumeSuggestions.resumeId, resumes.id))
      .where(eq(resumes.userId, session.userId))
      .orderBy(desc(resumeSuggestions.createdAt))
      .limit(3),
    db
      .select({
        phase: careerRoadmaps.title,
        targetRole: careerRoadmaps.targetRole,
        currentStep: userRoadmapEnrollments.currentStep,
        progressPercent: userRoadmapEnrollments.progressPercent,
      })
      .from(userRoadmapEnrollments)
      .innerJoin(careerRoadmaps, eq(userRoadmapEnrollments.roadmapId, careerRoadmaps.id))
      .where(eq(userRoadmapEnrollments.userId, session.userId))
      .orderBy(desc(userRoadmapEnrollments.enrolledAt))
      .limit(3),
    db
      .select({ averageScore: interviewSessions.averageScore })
      .from(interviewSessions)
      .where(eq(interviewSessions.userId, session.userId))
      .orderBy(desc(interviewSessions.createdAt))
      .limit(1),
  ]);

  const latestResumeScore = clampPercent(resumeProfile?.resumeScore ?? scoreToPercent(resumeRows[0]?.resumeScore ?? 82));
  const previousResumeScore = resumeProfile
    ? latestResumeScore
    : scoreToPercent(resumeRows[1]?.resumeScore ?? latestResumeScore);
  const resumeDelta = latestResumeScore - previousResumeScore;

  const completedTasks = progressRows.reduce((total, row) => total + (row.tasksCompleted ?? 0), 0);
  const totalTasks = progressRows.reduce((total, row) => total + (row.tasksTotal ?? 0), 0);
  const streakFallback = progressRows[0]?.streakDay ?? 0;
  const weeklyConsistency = totalTasks > 0
    ? clampPercent((completedTasks / totalTasks) * 100)
    : clampPercent(streakFallback * 12);

  const activeProjects = taskRows.filter((task) => {
    const category = (task.category ?? "").toLowerCase();
    const isProject = category.includes("project") || task.title.toLowerCase().includes("project");
    return isProject && task.status !== "completed";
  }).length;

  const interviewScoreRaw = interviewRows[0]?.averageScore;
  const interviewReadiness = scoreToPercent(interviewScoreRaw ?? 68);

  const todayFocus = taskRows.length > 0
    ? taskRows.slice(0, 3).map((task) => ({
        task: task.title,
        eta: formatEta(task.dueDate),
        status: toFocusStatus(task.status),
      }))
    : resumeProfile && resumeProfile.focusAreas.length > 0
      ? resumeProfile.focusAreas.slice(0, 3).map((area, index) => ({
          task: `Practice ${area}`,
          eta: ["20 min", "30 min", "25 min"][index] ?? "25 min",
          status: (index === 0 ? "Now" : index === 1 ? "Queued" : "Done") as FocusStatus,
        }))
      : overviewFallbackPayload.todayFocus;

  const skillMomentum = skillRows.length > 0
    ? skillRows.map((skill, index) => {
        const value = scoreToPercent(skill.level ?? 0);
        const tone: SkillTone = value >= 75 ? "emerald" : value >= 55 ? "cyan" : "amber";
        return {
          label: skill.label ?? `Skill ${index + 1}`,
          value,
          note: value >= 75 ? "Consistent progress observed" : "Needs focused practice sessions",
          tone,
        };
      })
    : resumeProfile && resumeProfile.topSkills.length > 0
      ? resumeProfile.topSkills.slice(0, 3).map((skill, index) => {
          const value = clampPercent(latestResumeScore - index * 8);
          const tone: SkillTone = value >= 75 ? "emerald" : value >= 55 ? "cyan" : "amber";
          return {
            label: skill,
            value,
            note: "Derived from your latest uploaded resume",
            tone,
          };
        })
    : overviewFallbackPayload.skillMomentum;

  const resumeSignals = signalRows.length > 0
    ? signalRows.map((signal) => ({
        signal: signal.suggestion,
        severity: priorityToSeverity(signal.priority),
        action: signal.suggestion,
      }))
    : resumeProfile && resumeProfile.focusAreas.length > 0
      ? resumeProfile.focusAreas.slice(0, 3).map((area, index) => ({
          signal: `Improve ${area}`,
          severity: (index === 0 ? "High" : index === 1 ? "Medium" : "Low") as SignalSeverity,
          action: `Use interview examples from your ${resumeProfile.targetRole} projects to strengthen ${area}.`,
        }))
    : overviewFallbackPayload.resumeSignals;

  const roadmapCheckpoints = enrollmentRows.length > 0
    ? enrollmentRows.map((enrollment) => ({
        phase: enrollment.phase,
        target: `Role: ${enrollment.targetRole} (Step ${enrollment.currentStep ?? 1})`,
        due: `${clampPercent(enrollment.progressPercent ?? 0)}% complete`,
      }))
    : resumeProfile
      ? [
          {
            phase: "Resume Baseline",
            target: `Target role set to ${resumeProfile.targetRole}`,
            due: `Current score: ${latestResumeScore}%`,
          },
          {
            phase: "Skill Development",
            target: `Focus on ${resumeProfile.focusAreas[0] ?? "core interview preparation"}`,
            due: "This week",
          },
          {
            phase: "Mock Interview Sprint",
            target: `Practice answers for ${resumeProfile.targetRole} scenarios`,
            due: "Next 7 days",
          },
        ]
    : overviewFallbackPayload.roadmapCheckpoints;

  return {
    metrics: {
      resumeStrength: {
        value: `${latestResumeScore} / 100`,
        change: `${formatSignedChange(resumeDelta)} this month`,
        helperText: "Resume quality from latest scan",
      },
      weeklyConsistency: {
        value: `${weeklyConsistency}%`,
        change: `${streakFallback} day streak`,
        helperText: "Based on daily task completion",
      },
      activeProjects: {
        value: String(activeProjects),
        change: activeProjects > 0 ? "In progress" : "No project tasks yet",
        helperText: "Derived from project-category tasks",
      },
      interviewReadiness: {
        value: `${interviewReadiness}%`,
        change: interviewReadiness >= 70 ? "Strong trajectory" : "Needs practice",
        helperText: "From latest interview session",
      },
    },
    todayFocus,
    skillMomentum,
    resumeSignals,
    roadmapCheckpoints,
    source: "database" as const,
  };
}
