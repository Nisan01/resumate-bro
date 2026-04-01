import {
  DashboardPageShell,
  DashboardPanel,
  MetricCard,
  ProgressMeter,
  StatusBadge,
} from "@/components/shared/dashboard";
import { Button } from "@/components/ui/button";
import { FileText, Gauge, Lightbulb, Target, Upload } from "lucide-react";

const roleMatches = [
  {
    role: "Frontend Engineer",
    match: 89,
    note: "Strong fit based on React, Next.js, and UI project experience.",
  },
  {
    role: "UI Developer",
    match: 84,
    note: "Design implementation quality is strong, add accessibility evidence.",
  },
  {
    role: "Product Engineer",
    match: 71,
    note: "Needs more backend integration and metrics-driven outcomes.",
  },
];

const skillGaps = [
  {
    skill: "System Design Storytelling",
    current: 46,
    target: 75,
    priority: "High",
  },
  {
    skill: "Performance Optimization",
    current: 61,
    target: 80,
    priority: "Medium",
  },
  {
    skill: "Testing Strategy",
    current: 54,
    target: 78,
    priority: "High",
  },
];

const improvements = [
  "Rewrite project bullets with measurable impact (load time, users, conversion).",
  "Add one section highlighting deployment, monitoring, and debugging ownership.",
  "Prioritize role keywords in your summary and top skills block.",
  "Include one short case study style project to showcase problem solving depth.",
];

const priorityTone = {
  High: "danger",
  Medium: "warning",
  Low: "success",
} as const;

const glassItemCardClass =
  "rounded-2xl border border-white/24 bg-linear-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-4 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

const compactGlassCardClass =
  "rounded-xl border border-white/24 bg-linear-to-br from-slate-950/74 via-slate-900/58 to-slate-800/42 p-3 backdrop-blur-md shadow-[0_10px_24px_rgba(2,8,24,0.3)]";

const glassActionButtonClass =
  "!border-white/35 !bg-slate-900/72 !text-slate-100 shadow-[0_10px_22px_rgba(2,8,24,0.34)] hover:!bg-slate-800/78 hover:!text-white";

export function ResumeAnalyzerView() {
  return (
    <DashboardPageShell
      eyebrow="Resume Analyzer"
      title="AI Resume Analysis Workspace"
      description="Upload your resume, review your score, close job-role gaps, and apply targeted improvements."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Resume Score"
          value="82 / 100"
          change="+6 vs last scan"
          helperText="Structure and readability improved"
          tone="teal"
          icon={<Gauge className="h-4 w-4" />}
        />
        <MetricCard
          label="Job-Ready Index"
          value="74%"
          change="Role aligned"
          helperText="Frontend roles are strongest"
          tone="sky"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          label="Improvement Priority"
          value="4 items"
          change="2 critical"
          helperText="Action plan generated"
          tone="amber"
          icon={<Lightbulb className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardPanel
          className="xl:col-span-2"
          title="Upload and Analyze"
          description="Use PDF format for best extraction quality and scoring accuracy."
        >
          <div className="rounded-2xl border border-dashed border-white/35 bg-linear-to-br from-slate-950/72 via-slate-900/56 to-slate-800/42 p-6 shadow-[0_18px_34px_rgba(2,8,24,0.36)]">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-slate-950/46">
                <Upload className="h-6 w-6 text-cyan-100" />
              </div>
              <p className="text-base font-medium text-slate-100">Drop your resume file here</p>
              <p className="mt-1 text-sm text-slate-300">
                Supported format: PDF. Max size: 5MB. Keep it single-column for best parsing.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button className="bg-white text-slate-900 hover:bg-slate-200">Select Resume PDF</Button>
                <Button variant="outline" className={glassActionButtonClass}>
                  Analyze with AI
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className={compactGlassCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Latest Scan</p>
              <p className="mt-1 text-sm font-medium text-slate-100">Today, 10:24 AM</p>
            </div>
            <div className={compactGlassCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Version</p>
              <p className="mt-1 text-sm font-medium text-slate-100">resume-v5.pdf</p>
            </div>
            <div className={compactGlassCardClass}>
              <p className="text-xs uppercase tracking-wide text-slate-300">Scan Status</p>
              <p className="mt-1 text-sm font-medium text-emerald-100">Complete</p>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Role Suggestions" description="Suggested job roles based on resume strengths.">
          <div className="space-y-4">
            {roleMatches.map((item) => (
              <div key={item.role} className={compactGlassCardClass}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-100">{item.role}</p>
                  <StatusBadge tone="info">{item.match}% match</StatusBadge>
                </div>
                <ProgressMeter label="Role fit" value={item.match} tone="cyan" />
                <p className="mt-2 text-xs text-slate-300">{item.note}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel
          title="Job-Ready Gap Analysis"
          description="Current skill coverage versus the target level for your roles."
        >
          <div className="space-y-4">
            {skillGaps.map((gap) => (
              <div key={gap.skill} className={glassItemCardClass}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-100">{gap.skill}</p>
                  <StatusBadge tone={priorityTone[gap.priority]}>{gap.priority}</StatusBadge>
                </div>
                <ProgressMeter
                  label="Current level"
                  value={gap.current}
                  tone={gap.priority === "High" ? "rose" : "amber"}
                  note={`Target level: ${gap.target}%`}
                />
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Improvement Suggestions"
          description="High-impact changes generated from your latest analysis."
          action={
            <Button variant="ghost" className="text-slate-100 hover:bg-white/10 hover:text-white">
              Export tips
            </Button>
          }
        >
          <ul className="space-y-3">
            {improvements.map((item) => (
              <li key={item} className={glassItemCardClass}>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </section>
    </DashboardPageShell>
  );
}
