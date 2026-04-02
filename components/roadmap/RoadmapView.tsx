"use client";

import { useSyncExternalStore } from "react";
import { BookOpenCheck, BriefcaseBusiness, GraduationCap, Sparkles, Target } from "lucide-react";
import {
  DashboardPageShell,
  DashboardPanel,
  MetricCard,
  ProgressMeter,
  StatusBadge,
} from "@/components/shared/dashboard";
import { RoadmapWaveTimeline, type RoadmapStep } from "./RoadmapWaveTimeline";

type StudentTrack = "btech" | "bca";

interface TrackRoadmap {
  persona: string;
  targetRole: string;
  score: number;
  ats: number;
  skillMatch: number;
  readiness: number;
  strengths: string[];
  focusAreas: string[];
  progress: Array<{
    label: string;
    value: number;
    note: string;
    tone: "emerald" | "cyan" | "amber" | "rose";
  }>;
  steps: RoadmapStep[];
}

const trackRoadmaps: Record<StudentTrack, TrackRoadmap> = {
  btech: {
    persona: "BTech Student",
    targetRole: "Software Engineer / SDE Intern",
    score: 78,
    ats: 81,
    skillMatch: 66,
    readiness: 58,
    strengths: [
      "Solid programming fundamentals and problem solving",
      "Good exposure to mini projects and Git workflows",
      "Strong technical curiosity and learning velocity",
    ],
    focusAreas: [
      "Deepen DBMS, OS, and CN revision for interviews",
      "Improve coding round speed under timed conditions",
      "Rewrite project impact bullets with measurable outcomes",
    ],
    progress: [
      {
        label: "Core CS Coverage",
        value: 52,
        note: "Target 80% mastery before placement season",
        tone: "cyan",
      },
      {
        label: "Project Quality",
        value: 61,
        note: "Need one more production-like project",
        tone: "emerald",
      },
      {
        label: "Interview Readiness",
        value: 47,
        note: "Mock rounds and communication practice pending",
        tone: "amber",
      },
    ],
    steps: [
      {
        id: "01",
        title: "Resume & Skill Baseline Audit",
        description: "Map your current strengths across DSA, OOP, DBMS, and real project contribution.",
        align: "top",
        theme: "amber",
      },
      {
        id: "02",
        title: "Core CS Gap Closing Sprint",
        description: "Follow a focused plan for DBMS, OS, CN and top interview coding patterns.",
        align: "bottom",
        theme: "amber",
      },
      {
        id: "03",
        title: "Role-Focused Project Upgrade",
        description: "Build two proof projects with clean architecture, deployment, and impact-oriented README.",
        align: "top",
        theme: "violet",
      },
      {
        id: "04",
        title: "Assessment & Mock Round Cycle",
        description: "Practice OA, aptitude, and debugging rounds weekly with strict time-boxing.",
        align: "bottom",
        theme: "violet",
      },
      {
        id: "05",
        title: "Technical + HR Interview Prep",
        description: "Prepare concise stories, core concept answers, and role-aligned technical walkthroughs.",
        align: "top",
        theme: "lime",
      },
      {
        id: "06",
        title: "Placement Application Momentum",
        description: "Apply in weekly batches, use referrals, and track callbacks to optimize outcomes.",
        align: "bottom",
        theme: "lime",
      },
    ],
  },
  bca: {
    persona: "BCA Student",
    targetRole: "Full-Stack / Software Support Intern",
    score: 72,
    ats: 76,
    skillMatch: 61,
    readiness: 54,
    strengths: [
      "Strong practical mindset with web development interest",
      "Comfortable with frontend basics and SQL fundamentals",
      "Consistent project execution and documentation effort",
    ],
    focusAreas: [
      "Strengthen backend APIs, authentication, and deployment",
      "Improve resume achievement language with metrics",
      "Practice communication for HR and support interviews",
    ],
    progress: [
      {
        label: "Web Stack Depth",
        value: 58,
        note: "Backend API and auth depth needed",
        tone: "cyan",
      },
      {
        label: "Portfolio Strength",
        value: 63,
        note: "Add one end-to-end deployed project",
        tone: "emerald",
      },
      {
        label: "Interview Confidence",
        value: 49,
        note: "Need mock interviews with feedback loop",
        tone: "amber",
      },
    ],
    steps: [
      {
        id: "01",
        title: "Resume & Foundation Review",
        description: "Evaluate coding basics, communication, and resume clarity for internship readiness.",
        align: "top",
        theme: "amber",
      },
      {
        id: "02",
        title: "Web + SQL Skill Build",
        description: "Strengthen HTML/CSS/JS, React basics, SQL querying, and API consumption workflow.",
        align: "bottom",
        theme: "amber",
      },
      {
        id: "03",
        title: "Practical Portfolio Sprint",
        description: "Create role-relevant projects with authentication, CRUD, and responsive UI quality.",
        align: "top",
        theme: "violet",
      },
      {
        id: "04",
        title: "Mock Tests & Debug Practice",
        description: "Run aptitude drills, SQL tests, and debugging exercises on real mini case studies.",
        align: "bottom",
        theme: "violet",
      },
      {
        id: "05",
        title: "Interview Communication Prep",
        description: "Practice project explanation, teamwork stories, and role-based problem solving responses.",
        align: "top",
        theme: "lime",
      },
      {
        id: "06",
        title: "Internship & Job Launch Plan",
        description: "Apply strategically, improve profile weekly, and follow up consistently on opportunities.",
        align: "bottom",
        theme: "lime",
      },
    ],
  },
};

const glassItemCardClass =
  "rounded-2xl border border-white/24 bg-gradient-to-br from-slate-950/78 via-slate-900/64 to-slate-800/48 p-5 sm:p-6 backdrop-blur-md shadow-[0_14px_30px_rgba(2,8,24,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:shadow-[0_20px_36px_rgba(12,74,110,0.4)]";

function inferTrackFromResumeSnapshot(): StudentTrack {
  const candidates = [
    localStorage.getItem("resumeDegreeTrack"),
    localStorage.getItem("resume_degree_track"),
    localStorage.getItem("roadmapTrack"),
  ]
    .filter(Boolean)
    .map((value) => value!.toLowerCase().trim());

  if (candidates.some((value) => value.includes("bca"))) {
    return "bca";
  }

  return "btech";
}

export function RoadmapView() {
  const track = useSyncExternalStore<StudentTrack>(
    () => () => {},
    inferTrackFromResumeSnapshot,
    () => "btech",
  );

  const selectedRoadmap: TrackRoadmap = trackRoadmaps[track];

  return (
    <DashboardPageShell
      eyebrow="Roadmap"
      title="Career Growth Roadmap"
      description="After resume review, this roadmap is personalized for your degree track to move from skill gaps to interview-ready execution."
    >
      <DashboardPanel
        title="Resume Review Snapshot"
        description="Roadmap generated from your latest resume audit and role alignment signals."
      >
        <div className="mb-5 flex flex-wrap gap-2">
          <StatusBadge tone="info">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Resume Reviewed
          </StatusBadge>
          <StatusBadge tone="neutral">
            <GraduationCap className="mr-1 h-3.5 w-3.5" />
            {selectedRoadmap.persona}
          </StatusBadge>
          <StatusBadge tone="success">
            <BriefcaseBusiness className="mr-1 h-3.5 w-3.5" />
            Target: {selectedRoadmap.targetRole}
          </StatusBadge>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <MetricCard
            label="Resume Quality"
            value={`${selectedRoadmap.score}/100`}
            change="Review Updated"
            helperText="Content depth and impact statements"
            tone="sky"
            icon={<BookOpenCheck className="h-4 w-4" />}
          />
          <MetricCard
            label="ATS Match"
            value={`${selectedRoadmap.ats}%`}
            change="Role Matched"
            helperText="Keyword and structure alignment"
            tone="teal"
            icon={<Target className="h-4 w-4" />}
          />
          <MetricCard
            label="Placement Readiness"
            value={`${selectedRoadmap.readiness}%`}
            change="Action Needed"
            helperText="Interview and application momentum"
            tone="amber"
            icon={<Sparkles className="h-4 w-4" />}
          />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200/35 bg-linear-to-br from-emerald-400/16 via-emerald-300/10 to-transparent p-5 sm:p-6 shadow-[0_14px_30px_rgba(6,78,59,0.3)]">
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-emerald-100 uppercase">Strengths</h3>
            <ul className="space-y-2 text-sm text-emerald-50/90">
              {selectedRoadmap.strengths.map((point, idx) => (
                <li key={`strength-${idx}`} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-200" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200/35 bg-linear-to-br from-amber-400/16 via-amber-300/10 to-transparent p-5 sm:p-6 shadow-[0_14px_30px_rgba(120,53,15,0.28)]">
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-amber-100 uppercase">Needs Focus</h3>
            <ul className="space-y-2 text-sm text-amber-50/90">
              {selectedRoadmap.focusAreas.map((point, idx) => (
                <li key={`focus-${idx}`} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-200" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {selectedRoadmap.progress.map((meter) => (
            <div key={meter.label} className={glassItemCardClass}>
              <ProgressMeter label={meter.label} value={meter.value} note={meter.note} tone={meter.tone} />
            </div>
          ))}
        </div>
      </DashboardPanel>

      <RoadmapWaveTimeline steps={selectedRoadmap.steps} />
    </DashboardPageShell>
  );
}
