import { desc, eq } from "drizzle-orm";
import { db } from "@/index";
import { resumes, tasks, userSkills } from "@/utils/db/schema/schema";
import type { ResumeProfile } from "@/lib/resume-profile";
import type { DashboardSession } from "../_lib/session";

type ProjectStatus = "In Build" | "Planning" | "Backlog";

export const projectsFallbackPayload = {
  metrics: {
    activeProjects: {
      value: "3",
      change: "2 this sprint",
      helperText: "One close to review",
    },
    completionRate: {
      value: "55%",
      change: "+12 this month",
      helperText: "Strong delivery trend",
    },
    technicalDepth: {
      value: "68%",
      change: "Growing",
      helperText: "Backend evidence needed",
    },
    portfolioImpact: {
      value: "73%",
      change: "Recruiter-ready",
      helperText: "Add metrics in project stories",
    },
  },
  projectPipeline: [
    {
      name: "ResuMate Dashboard Revamp",
      summary: "Build complete dashboard experience with analytics cards and smart sections.",
      stack: ["Next.js", "Tailwind", "JWT", "Drizzle"],
      progress: 72,
      status: "In Build" as ProjectStatus,
      nextMilestone: "Wire API-driven progress widgets",
    },
    {
      name: "Resume Analyzer Integration",
      summary: "Connect AI analysis output to resume score, gap matrix, and role suggestions.",
      stack: ["OpenRouter", "API Routes", "Schema Validation"],
      progress: 58,
      status: "Planning" as ProjectStatus,
      nextMilestone: "Define response contract for analysis API",
    },
    {
      name: "Career Reports Engine",
      summary: "Generate weekly progress narratives and trend snapshots from user activity.",
      stack: ["Next.js", "Drizzle", "Scheduled Jobs"],
      progress: 34,
      status: "Backlog" as ProjectStatus,
      nextMilestone: "Design report aggregation tables",
    },
  ],
  deliverables: [
    { item: "2 polished case-study projects for recruiter review", target: "April Week 2" },
    { item: "1 full-stack project with authentication and analytics", target: "April Week 4" },
    { item: "Project README upgrades with outcomes and metrics", target: "May Week 1" },
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

function toProjectStatus(status: string | null): ProjectStatus {
  if (status === "in_progress") return "In Build";
  if (status === "pending") return "Planning";
  return "Backlog";
}

function toProgressValue(status: string | null): number {
  if (status === "completed") return 100;
  if (status === "in_progress") return 68;
  if (status === "pending") return 36;
  return 18;
}

function toMilestone(dueDate: Date | string | null): string {
  if (!dueDate) return "Plan next implementation checkpoint";

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return "Plan next implementation checkpoint";

  return `Due ${parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function toDeliverableTarget(dueDate: Date | string | null): string {
  if (!dueDate) return "Upcoming";

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return "Upcoming";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export async function getProjectsPayload(session: DashboardSession, resumeProfile?: ResumeProfile | null) {
  const [taskRows, skillRows, resumeRows] = await Promise.all([
    db
      .select({
        title: tasks.title,
        description: tasks.description,
        category: tasks.category,
        status: tasks.status,
        dueDate: tasks.dueDate,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.userId, session.userId))
      .orderBy(desc(tasks.updatedAt))
      .limit(24),
    db
      .select({ proficiencyLevel: userSkills.proficiencyLevel })
      .from(userSkills)
      .where(eq(userSkills.userId, session.userId))
      .orderBy(desc(userSkills.proficiencyLevel))
      .limit(12),
    db
      .select({ resumeScore: resumes.resumeScore })
      .from(resumes)
      .where(eq(resumes.userId, session.userId))
      .orderBy(desc(resumes.createdAt))
      .limit(1),
  ]);

  const projectCandidates = taskRows.filter((task) => {
    const category = (task.category ?? "").toLowerCase();
    return category.includes("project") || task.title.toLowerCase().includes("project");
  });

  const sourceRows = (projectCandidates.length > 0 ? projectCandidates : taskRows).slice(0, 3);

  const projectPipeline = sourceRows.length > 0
    ? sourceRows.map((row) => ({
        name: row.title,
        summary: row.description ?? "Project milestone captured from your task board.",
        stack: ["Next.js", "TypeScript", "API"],
        progress: toProgressValue(row.status),
        status: toProjectStatus(row.status),
        nextMilestone: toMilestone(row.dueDate),
      }))
    : resumeProfile
      ? [
          {
            name: `${resumeProfile.targetRole} Portfolio Build`,
            summary: `Build a project that demonstrates ${resumeProfile.topSkills.slice(0, 2).join(" and ") || "core engineering skills"}.`,
            stack: resumeProfile.topSkills.slice(0, 4),
            progress: clampPercent(resumeProfile.resumeScore - 18),
            status: "In Build" as ProjectStatus,
            nextMilestone: `Implement ${resumeProfile.focusAreas[0] ?? "role-aligned interview story"}`,
          },
          {
            name: "Impact Metrics Upgrade",
            summary: "Add measurable outcomes to your key projects and deployment stories.",
            stack: ["Analytics", "Testing", "Performance"],
            progress: clampPercent(resumeProfile.resumeScore - 26),
            status: "Planning" as ProjectStatus,
            nextMilestone: "Rewrite top 3 project bullets with numbers",
          },
          {
            name: "Interview Proof Project",
            summary: "Create one end-to-end project that can be explained in mock interviews.",
            stack: ["API", "Database", "Frontend"],
            progress: clampPercent(resumeProfile.resumeScore - 36),
            status: "Backlog" as ProjectStatus,
            nextMilestone: `Align architecture with ${resumeProfile.targetRole} expectations`,
          },
        ]
    : projectsFallbackPayload.projectPipeline;

  const activeProjects = projectCandidates.filter((row) => row.status !== "completed").length;
  const completedProjects = projectCandidates.filter((row) => row.status === "completed").length;
  const completionRate = projectCandidates.length > 0
    ? clampPercent((completedProjects / projectCandidates.length) * 100)
    : 0;

  const technicalDepth = skillRows.length > 0
    ? clampPercent(
        skillRows.reduce((sum, row) => sum + scoreToPercent(row.proficiencyLevel), 0) / skillRows.length,
      )
    : resumeProfile && resumeProfile.topSkills.length > 0
      ? clampPercent(54 + resumeProfile.topSkills.length * 5)
    : 68;

  const resumeScore = clampPercent(resumeProfile?.resumeScore ?? scoreToPercent(resumeRows[0]?.resumeScore ?? 72));
  const portfolioImpact = clampPercent((completionRate + technicalDepth + resumeScore) / 3);

  const deliverables = taskRows
    .filter((row) => row.status !== "completed")
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 3)
    .map((row) => ({
      item: row.title,
      target: toDeliverableTarget(row.dueDate),
    }));

  const resumeDrivenDeliverables = resumeProfile
    ? resumeProfile.focusAreas.slice(0, 3).map((area, index) => ({
        item: `Project story upgrade: ${area}`,
        target: ["This Week", "Next Week", "This Month"][index] ?? "Upcoming",
      }))
    : [];

  return {
    metrics: {
      activeProjects: {
        value: String(activeProjects),
        change: projectCandidates.length > 0 ? `${projectCandidates.length} tracked` : "No project tasks yet",
        helperText: "Derived from project category tasks",
      },
      completionRate: {
        value: `${completionRate}%`,
        change: completedProjects > 0 ? `${completedProjects} completed` : "Start first project sprint",
        helperText: "Completion ratio of tracked projects",
      },
      technicalDepth: {
        value: `${technicalDepth}%`,
        change: technicalDepth >= 70 ? "Strong" : "Growing",
        helperText: "Computed from user skill proficiency",
      },
      portfolioImpact: {
        value: `${portfolioImpact}%`,
        change: portfolioImpact >= 70 ? "Recruiter-ready trend" : "Needs stronger outcomes",
        helperText: "Blend of delivery, skills, and resume score",
      },
    },
    projectPipeline,
    deliverables:
      deliverables.length > 0
        ? deliverables
        : resumeDrivenDeliverables.length > 0
          ? resumeDrivenDeliverables
          : projectsFallbackPayload.deliverables,
    source: "database" as const,
  };
}
