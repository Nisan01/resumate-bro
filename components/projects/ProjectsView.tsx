import {
  DashboardPageShell,
  DashboardPanel,
  MetricCard,
  ProgressMeter,
  StatusBadge,
} from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle2, Code2, Rocket } from "lucide-react";

type ProjectStatus = "In Build" | "Planning" | "Backlog";
type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

interface ProjectPipelineItem {
  name: string;
  summary: string;
  stack: string[];
  progress: number;
  status: string;
  nextMilestone: string;
}

const projectPipeline: ProjectPipelineItem[] = [
  {
    name: "ResuMate Dashboard Revamp",
    summary: "Build complete dashboard experience with analytics cards and smart sections.",
    stack: ["Next.js", "Tailwind", "JWT", "Drizzle"],
    progress: 72,
    status: "In Build",
    nextMilestone: "Wire API-driven progress widgets",
  },
  {
    name: "Resume Analyzer Integration",
    summary: "Connect AI analysis output to resume score, gap matrix, and role suggestions.",
    stack: ["OpenRouter", "API Routes", "Schema Validation"],
    progress: 58,
    status: "Planning",
    nextMilestone: "Define response contract for analysis API",
  },
  {
    name: "Career Reports Engine",
    summary: "Generate weekly progress narratives and trend snapshots from user activity.",
    stack: ["Next.js", "Drizzle", "Scheduled Jobs"],
    progress: 34,
    status: "Backlog",
    nextMilestone: "Design report aggregation tables",
  },
];

const projectStatusTone: Record<ProjectStatus, StatusTone> = {
  "In Build": "info",
  Planning: "warning",
  Backlog: "neutral",
};

function getProjectStatusTone(status: string): StatusTone {
  return status in projectStatusTone ? projectStatusTone[status as ProjectStatus] : "neutral";
}

const deliverables = [
  {
    item: "2 polished case-study projects for recruiter review",
    target: "April Week 2",
  },
  {
    item: "1 full-stack project with authentication and analytics",
    target: "April Week 4",
  },
  {
    item: "Project README upgrades with outcomes and metrics",
    target: "May Week 1",
  },
];

const glassItemCardClass =
  "rounded-2xl border border-white/24 bg-linear-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-4 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

const glassActionButtonClass =
  "!border-white/35 !bg-slate-900/72 !text-slate-100 shadow-[0_10px_22px_rgba(2,8,24,0.34)] hover:!bg-slate-800/78 hover:!text-white";

export function ProjectsView() {
  return (
    <DashboardPageShell
      eyebrow="Projects"
      title="Project Execution Board"
      description="Track portfolio projects, monitor progress, and align each build with your target role outcomes."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active Projects"
          value="3"
          change="2 this sprint"
          helperText="One close to review"
          tone="sky"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <MetricCard
          label="Completion Rate"
          value="55%"
          change="+12 this month"
          helperText="Strong delivery trend"
          tone="teal"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Technical Depth"
          value="68%"
          change="Growing"
          helperText="Backend evidence needed"
          tone="amber"
          icon={<Code2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Portfolio Impact"
          value="73%"
          change="Recruiter-ready"
          helperText="Add metrics in project stories"
          tone="rose"
          icon={<Rocket className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardPanel
          className="xl:col-span-2"
          title="Project Pipeline"
          description="Current implementation status and next milestones."
          action={
            <Button variant="outline" className={glassActionButtonClass}>
              Create project
            </Button>
          }
        >
          <div className="space-y-4">
            {projectPipeline.map((project) => (
              <article key={project.name} className={glassItemCardClass}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-100">{project.name}</h3>
                  <StatusBadge tone={getProjectStatusTone(project.status)}>{project.status}</StatusBadge>
                </div>

                <p className="mt-2 text-sm text-slate-300">{project.summary}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((tag) => (
                    <span
                      key={`${project.name}-${tag}`}
                      className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-slate-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4">
                  <ProgressMeter
                    label="Completion"
                    value={project.progress}
                    note={`Next: ${project.nextMilestone}`}
                    tone={project.progress > 65 ? "emerald" : "cyan"}
                  />
                </div>
              </article>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Portfolio Deliverables" description="High-impact outcomes to improve your profile signal.">
          <ul className="space-y-3">
            {deliverables.map((deliverable) => (
              <li key={deliverable.item} className={glassItemCardClass}>
                <p className="text-sm font-medium text-slate-100">{deliverable.item}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-300">Target: {deliverable.target}</p>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </section>
    </DashboardPageShell>
  );
}
