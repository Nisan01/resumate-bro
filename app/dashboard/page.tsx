"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Resume {
  id: string;
  name: string;
  score?: number;
  tags?: string[];
  createdAt?: string;
}
type Skill = { name: string; note?: string; level?: string; score?: number; status?: string };

interface ResumeCount {
  resumeCount: number;
}

const meshBg = {
  background: `
    radial-gradient(ellipse 70% 55% at 15% 20%,rgba(90,60,180,.3) 0%,transparent 60%),
    radial-gradient(ellipse 55% 45% at 85% 10%,rgba(60,140,200,.18) 0%,transparent 55%),
    radial-gradient(ellipse 50% 60% at 75% 85%,rgba(180,80,160,.18) 0%,transparent 55%),
    radial-gradient(ellipse 40% 35% at 10% 80%,rgba(40,100,190,.13) 0%,transparent 50%),
    #080b12`,
};

const dashboardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  .rmd-wrap * { box-sizing: border-box; }
  @keyframes rmd-drift {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(18px,-22px) scale(1.04); }
    66%      { transform: translate(-14px,12px) scale(.97); }
  }
  @keyframes rmd-fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rmd-pulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }
  .rmd-orb {
    position:fixed; border-radius:50%; pointer-events:none;
    background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.4) 0%,rgba(196,176,255,.25) 20%,rgba(126,232,250,.15) 45%,transparent 75%);
    animation: rmd-drift linear infinite;
  }
  .rmd-fade-up { animation: rmd-fadeUp .5s cubic-bezier(.22,.68,0,1.2) both; }
  .rmd-feature-card { transition: transform .2s, box-shadow .2s; }
  .rmd-feature-card:hover { transform: translateY(-3px) scale(1.01); }
  .rmd-step-item:hover { transform: translateX(4px); transition: transform .2s; }
  .rmd-tab-btn { transition: all .2s; }
  .rmd-tab-btn:hover { opacity: .85; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(196,176,255,.15); border-radius:4px; }

  
  .rmd-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .rmd-resumes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .rmd-tab-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .rmd-how-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .rmd-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .rmd-topbar-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .rmd-stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .rmd-resumes-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .rmd-how-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .rmd-features-grid {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .rmd-tab-bar {
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 4px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .rmd-tab-bar::-webkit-scrollbar { display: none; }
    .rmd-tab-btn { flex-shrink: 0; }
    .rmd-topbar-badges { justify-content: flex-start !important; margin-left: 0 !important; }
  }

  @media (max-width: 480px) {
    .rmd-stats-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .rmd-features-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .rmd-stat-value { font-size: 22px !important; }
    .rmd-how-headline { font-size: 15px !important; }
    .rmd-topbar-inner { gap: 8px; }
  }
`;

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ width: 24, height: 24, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(196,176,255,.12)", color: "#c4b0ff", flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(196,176,255,.9)", textShadow: "0 0 16px rgba(196,176,255,.5)", fontFamily: "'DM Sans',sans-serif" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(196,176,255,.2) 0%,transparent 100%)" }} />
    </div>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ borderRadius: 16, backdropFilter: "blur(20px)", background: "rgba(255,255,255,.035)", border: "1px solid rgba(196,176,255,.1)", boxShadow: "0 4px 32px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.05)", ...style }}>
      {children}
    </div>
  );
}

const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const HOW_TABS = [
  {
    id: "resume",
    label: "Resume Analyzer",
    color: "#7ee8fa",
    routePath: "/dashboard/resume-analyzer",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
      </svg>
    ),
    headline: "AI scans your resume in seconds",
    subline: "Upload your resume PDF — our AI reads every line, detects keyword gaps, scores sections, and tells you exactly what recruiters see.",
    steps: [
      { num: "01", title: "Upload your resume", desc: "Drag & drop your PDF or paste your resume text. We accept all common formats.", color: "#7ee8fa,#38b2ac" },
      { num: "02", title: "AI deep-scans content", desc: "Claude analyses tone, keyword density, ATS compatibility, and impact language across every section.", color: "#7ee8fa,#38b2ac" },
      { num: "03", title: "Receive a score + report", desc: "Get an overall score (0–100), per-section grades, and a prioritised list of improvements.", color: "#7ee8fa,#38b2ac" },
      { num: "04", title: "Apply fixes instantly", desc: "One-click rewrites for weak bullet points. Re-analyse as many times as you like.", color: "#7ee8fa,#38b2ac" },
    ],
    features: [
      { icon: "🎯", label: "ATS Compatibility Check", desc: "Know if bots will even read your resume before a human does." },
      { icon: "🔑", label: "Keyword Gap Analysis", desc: "See which role-specific keywords are missing from your current draft." },
      { icon: "📊", label: "Section-by-Section Score", desc: "Summary, Experience, Skills, Education — each gets its own grade." },
      { icon: "✏️", label: "One-click Rewrites", desc: "AI generates stronger bullet-point alternatives on demand." },
    ],
  },
  {
    id: "practice",
    label: "Practice Questions",
    color: "#c4b0ff",
    routePath: "/dashboard/practice-questions",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14H6a4 4 0 0 0-4 4z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14h6a4 4 0 0 1 4 4z" />
      </svg>
    ),
    headline: "Enter a topic — AI asks the questions",
    subline: "Type any topic (React Hooks, System Design, SQL…), pick your difficulty, and get a live interactive Q&A session powered by Claude.",
    steps: [
      { num: "01", title: "Enter any topic", desc: "From DSA to Behavioural to System Design — any topic you're preparing for works.", color: "#c4b0ff,#9f7aea" },
      { num: "02", title: "Choose difficulty", desc: "Beginner, Intermediate, or Advanced. The AI calibrates question depth accordingly.", color: "#c4b0ff,#9f7aea" },
      { num: "03", title: "Answer flashcard questions", desc: "Flip cards to reveal model answers. Track which concepts you're shaky on.", color: "#c4b0ff,#9f7aea" },
      { num: "04", title: "Build your streak", desc: "Daily practice earns XP. A streak counter keeps you accountable.", color: "#c4b0ff,#9f7aea" },
    ],
    features: [
      { icon: "🧠", label: "AI-Generated Questions", desc: "Fresh questions every session — never the same card twice." },
      { icon: "🎓", label: "3 Difficulty Levels", desc: "Beginner to Advanced — the AI adjusts complexity in real time." },
      { icon: "🃏", label: "Flashcard Format", desc: "Tap to reveal, navigate at your own pace, repeat weak areas." },
      { icon: "🔥", label: "Streak & XP System", desc: "Gamified daily practice keeps you coming back." },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    color: "#ff9de2",
    routePath: "/dashboard/skills-tracker",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="16" height="16" x="4" y="4" rx="2" />
        <rect width="6" height="6" x="9" y="9" rx="1" />
        <path d="M15 2v2M15 20v2M2 15h2M20 15h2M9 2v2M2 9h2M20 9h2M9 20v2" />
      </svg>
    ),
    headline: "Add skills — AI analyses them",
    subline: "Build your personal skills library. Click any skill to get a proficiency estimate, improvement tips, and resources tailored to your level.",
    steps: [
      { num: "01", title: "Add your skills", desc: "Type in any technology, language, or soft skill you have. Build your full stack profile.", color: "#ff9de2,#e879a8" },
      { num: "02", title: "Click to analyse", desc: "Hover any skill chip and hit Analyze. The AI evaluates your proficiency based on context.", color: "#ff9de2,#e879a8" },
      { num: "03", title: "Get improvement tips", desc: "Receive a proficiency score, actionable next steps, and resource suggestions per skill.", color: "#ff9de2,#e879a8" },
      { num: "04", title: "Match to job roles", desc: "See which roles your skill set best aligns with and what gaps to close first.", color: "#ff9de2,#e879a8" },
    ],
    features: [
      { icon: "📈", label: "Proficiency Score", desc: "AI estimates your level (0–100%) based on your profile context." },
      { icon: "🗺️", label: "Gap Detection", desc: "Compare your skills to any target job description instantly." },
      { icon: "💡", label: "Actionable Tips", desc: "Concrete next steps for every skill — not generic advice." },
      { icon: "🔗", label: "Role Matching", desc: "See which job titles your current skills are best suited for." },
    ],
  },
  {
    id: "roadmap",
    label: "Roadmap",
    color: "#f9ca73",
    routePath: "/dashboard/roadmap",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6" />
        <line x1="8" y1="3" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="21" />
      </svg>
    ),
    headline: "Enter a job role — get a learning roadmap",
    subline: "Tell us the role you're targeting. We generate a structured, step-by-step roadmap from where you are now to where you want to be.",
    steps: [
      { num: "01", title: "Specify your target role", desc: "Frontend Dev, ML Engineer, DevOps — any role, any level from junior to senior.", color: "#f9ca73,#e09b20" },
      { num: "02", title: "AI builds your roadmap", desc: "A personalised 6-step learning path is generated covering skills, projects, and resources.", color: "#f9ca73,#e09b20" },
      { num: "03", title: "Follow the steps", desc: "Each step is actionable — no vague advice, just concrete things to learn and build.", color: "#f9ca73,#e09b20" },
      { num: "04", title: "Track your progress", desc: "Mark steps complete, earn XP, and watch your profile strengthen over time.", color: "#f9ca73,#e09b20" },
    ],
    features: [
      { icon: "🗂️", label: "Role-Specific Paths", desc: "Roadmaps tailored to your exact target job title, not generic guides." },
      { icon: "⚡", label: "Generated in < 1 second", desc: "No waiting — your full roadmap appears instantly." },
      { icon: "📌", label: "Step-by-Step Structure", desc: "Numbered milestones so you always know what's next." },
      { icon: "✅", label: "Progress Tracking", desc: "Check off steps and see your completion percentage grow." },
    ],
  },
];

export default function ResumeateDashboard() {
  const [activeTab, setActiveTab] = useState("resume");
  const tab = HOW_TABS.find((t) => t.id === activeTab)!;
  const [tokens, setTokens] = useState({ totalSkillTokens: 0, totalResumeTokens: 0, totalAllTokens: 0 });
  const [count, setCount] = useState({ resumeCount: 0 });
  const { user, logout } = useUser();
  const [resumes, setResumes] = useState<any[]>([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [resumesLoading, setResumesLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const res= await fetch("/api/dashboard/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");

        const { tokens: tokenRes, resumeCount: countRes, projectCounts: projectsRes,resumes:resumes } = await res.json();

        setTokens(tokenRes);
        setCount({ resumeCount: countRes });
      
        setProjectsCount(projectsRes || 0);
        setResumes(resumes || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setResumesLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const routeHandler = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <style>{dashboardStyles}</style>

     
      <div className="rmd-wrap" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", ...meshBg }} />

      <div className="rmd-orb" style={{ width: 340, height: 340, top: -80, right: "8%", opacity: 0.45, animationDuration: "22s" }} />
      <div className="rmd-orb" style={{ width: 200, height: 200, top: "38%", left: "2%", opacity: 0.35, animationDuration: "18s", animationDelay: "-6s" }} />
      <div className="rmd-orb" style={{ width: 120, height: 120, bottom: "12%", left: "45%", opacity: 0.3, animationDuration: "15s", animationDelay: "-4s" }} />
      <div className="rmd-orb" style={{ width: 260, height: 260, bottom: -60, right: -40, opacity: 0.28, animationDuration: "25s", animationDelay: "-12s" }} />

      <div
        className="rmd-wrap w-full"
        style={{ position: "relative", zIndex: 10, minHeight: "100vh", padding: "20px 16px", color: "#f0eeff" }}
      >
        <div
          className="w-full max-w-6xl"
          style={{ margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}
        >

          {}
          <div className="rmd-fade-up" style={{ animationDelay: ".05s" }}>
            <Card style={{ padding: "12px 16px" }}>
              <div className="rmd-topbar-inner">
                <Image
                  src={user?.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(user?.name || user?.email || "user")}`}
                  alt={user?.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  style={{ width: 40, height: 40, flexShrink: 0 }}
                  priority
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f0eeff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name}
                  </div>
                  <div className="ml-4" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, marginTop: 2, color: "rgba(196,176,255,.45)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                    </svg>
                 
                  </div>
                </div>
                <div className="rmd-topbar-badges" style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center", flexShrink: 0 }}>
                  <Button
                    onClick={logout}
                    size="lg"
                    className="px-5 text-[13px] bg-purple-600/40 hover:bg-purple-600/20 rounded backdrop-blur-2xl border-[1px] border-purple-500/30 shadow-xl"
                  >
                    LogOut
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          
          <div className="rmd-fade-up" style={{ animationDelay: ".1s" }}>
            <SectionLabel
              label="overview"
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
              }
            />
            <div className="rmd-stats-grid">
              {[
                {
                  color: "#c4b0ff", label: "Resumes Generated", value: `${count.resumeCount || 0}`, sub: "total generated",
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /></svg>,
                  points: "0,20 13,16 26,18 39,11 52,13 65,7 80,3", gradId: "sg1",
                },
                {
                  color: "#7ee8fa", label: "Tokens Used", value: `${(tokens.totalAllTokens / 1000).toFixed(1)}k`, sub: "AI usage",
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /></svg>,
                  points: "0,22 13,17 26,19 39,13 52,9 65,11 80,5", gradId: "sg2",
                },
                {
                  color: "#ff9de2", label: "Projects Added", value: `${projectsCount || 0}`, sub: "in portfolio",
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" /></svg>,
                  points: "0,22 13,19 26,21 39,16 52,18 65,12 80,8", gradId: "sg3",
                },
              ].map(({ color, label, value, sub, icon, points, gradId }) => (
                <div
                  key={gradId}
                  className="rmd-feature-card"
                  style={{
                    borderRadius: 16, padding: 16, position: "relative", overflow: "hidden", cursor: "default",
                    background: "rgba(255,255,255,.04)", border: `1px solid ${color}33`,
                    boxShadow: "0 4px 32px rgba(0,0,0,.25)", backdropFilter: "blur(20px)",
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 50% -10%,${color}18 0%,transparent 65%)` }} />
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}1f`, color, flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, marginBottom: 4, fontWeight: 500, textAlign: "right", color: "rgba(220,215,255,.4)" }}>{label}</div>
                      <div className="rmd-stat-value" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, textAlign: "right", color }}>{value}</div>
                    </div>
                  </div>
                  <svg style={{ width: "100%", height: 28, opacity: 0.7 }} viewBox="0 0 80 24" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <polyline points={points} fill="none" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 11, fontWeight: 500, color }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                    </svg>
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="rmd-fade-up" style={{ animationDelay: ".15s" }}>
            <SectionLabel
              label="recent analysis"
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                </svg>
              }
            />
            <div className="rmd-resumes-grid ">
              {resumesLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} style={{ padding: 14,display: "flex", alignItems: "center", gap: 10, animation: "pulse 1.5s ease-in-out infinite" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Skeleton
                          className="rounded-full shrink-0"
                          style={{
                            width: 38, height: 44,
                            background: "rgba(196,176,255,.08)",
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                          <Skeleton
                            style={{
                              height: 13, width: "65%", borderRadius: 6,
                              background: "rgba(196,176,255,.08)",
                            }}
                          />
                          {}
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <Skeleton style={{ height: 18, width: 52, borderRadius: 999, background: "rgba(196,176,255,.07)" }} />
                            <Skeleton style={{ height: 18, width: 44, borderRadius: 999, background: "rgba(196,176,255,.07)" }} />
                            <Skeleton style={{ height: 12, width: 56, borderRadius: 4, background: "rgba(196,176,255,.06)", marginLeft: "auto" }} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                :
                
                
                 resumes.length === 0 ? (
  <Card
    style={{
      padding: 20,
       gridColumn: "1 / -1",
      textAlign: "center",
      display: "flex",

      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      minHeight: 120,
      background: "rgba(255,255,255,.03)",
      border: "1px dashed rgba(196,176,255,.2)",
    }}
  >

<div className="flex items-center w-full justify-between gap-14">
    <div className="flex items-center gap-3">
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(126,232,250,.08)",
        color: "#7ee8fa",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </div>

    <div style={{ fontSize: 13, color: "rgba(196,176,255,.7)", fontWeight: 500 }}>
      No resumes analyzed yet
    </div>

</div>

    {}
    <button
      onClick={() => router.push("/dashboard/resume-analyzer")}
      style={{
        marginTop: 6,
        padding: "8px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        background: "linear-gradient(135deg,#7ee8fa,#38b2ac)",
        color: "#0a0714",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 2px 12px rgba(126,232,250,.25)",
      }}
    >
      Analyze Resume
    </button>
    </div>
  </Card>
) : (
  resumes.map((r) => {
                    const skills: Skill[] = r.extractedSkills?.skills?.slice(0, 3) || [];
                    return (
                      <Card key={r.id} style={{ padding: 14, cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                            background: "#7ee8fa1a", border: "1.5px solid #7ee8fa4d", color: "#7ee8fa",
                          }}>
                            {r.overallScore?.toString() || "-"}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#f0eeff" }}>
                              {r.fileName}
                            </div>
                            <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                              {skills.map((skill, index: number) => (
                                <span key={index} style={{
                                  fontSize: 10, padding: "2px 7px", borderRadius: 999,
                                  background: "rgba(196,176,255,.08)", color: "rgba(196,176,255,.6)",
                                  border: "1px solid rgba(196,176,255,.1)",
                                }}>
                                  {skill.name}
                                </span>
                              ))}
                              <span style={{ fontSize: 10, marginLeft: "auto", color: "rgba(196,176,255,.3)", whiteSpace: "nowrap" }}>
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )
                
              
                }
              
            </div>
          </div>

          {}
          <div className="rmd-fade-up" style={{ animationDelay: ".2s" }}>
            <SectionLabel label="how it works" icon={<SparkleIcon />} />

            {}
            <div className="rmd-tab-bar" style={{ marginBottom: 20 }}>
              {HOW_TABS.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    className="rmd-tab-btn"
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "8px 14px", borderRadius: 10,
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      border: active ? `1px solid ${t.color}55` : "1px solid rgba(196,176,255,.1)",
                      background: active ? `${t.color}18` : "rgba(255,255,255,.03)",
                      color: active ? t.color : "rgba(196,176,255,.45)",
                      boxShadow: active ? `0 0 16px ${t.color}22` : "none",
                      transition: "all .2s", whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ color: active ? t.color : "rgba(196,176,255,.35)" }}>{t.icon}</span>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {}
            <Card style={{ padding: "20px 18px", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${tab.color},transparent)`, borderRadius: "16px 16px 0 0" }} />
              <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle,${tab.color}12 0%,transparent 70%)`, pointerEvents: "none" }} />

              {}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${tab.color}1f`, color: tab.color, flexShrink: 0, marginTop: 2 }}>
                    {tab.icon}
                  </div>
                  <h3
                    className="rmd-how-headline"
                    style={{ fontSize: 17, fontWeight: 700, color: tab.color, margin: 0, lineHeight: 1.3 }}
                  >
                    {tab.headline}
                  </h3>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(196,176,255,.6)", maxWidth: 560, margin: 0 }}>
                  {tab.subline}
                </p>
              </div>

              {}
              <div className="rmd-how-grid">

                {}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(196,176,255,.4)", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>
                    Steps
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
                    <div style={{ position: "absolute", left: 15, top: 20, bottom: 20, width: 1, background: `linear-gradient(to bottom,${tab.color}44,transparent)` }} />
                    {tab.steps.map((s) => (
                      <div key={s.num} className="rmd-step-item" style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,.025)", border: "1px solid rgba(196,176,255,.07)" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, zIndex: 1, background: `linear-gradient(135deg,${s.color})`, color: "#0a0714", fontFamily: "'Syne',sans-serif" }}>
                          {s.num}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#f0eeff", marginBottom: 2 }}>{s.title}</div>
                          <div style={{ fontSize: 11, color: "rgba(196,176,255,.5)", lineHeight: 1.55 }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(196,176,255,.4)", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>
                    Features
                  </div>
                  <div className="rmd-features-grid">
                    {tab.features.map((f) => (
                      <div key={f.label} className="rmd-feature-card" style={{ padding: "12px 11px", borderRadius: 12, background: `${tab.color}0a`, border: `1px solid ${tab.color}22`, cursor: "default" }}>
                        <div style={{ fontSize: 18, marginBottom: 6 }}>{f.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: tab.color, marginBottom: 3 }}>{f.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(196,176,255,.5)", lineHeight: 1.5 }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>

                  {}
                  <button
                    onClick={() => routeHandler(tab.routePath)}
                    style={{
                      marginTop: 14, width: "100%",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: `linear-gradient(135deg,${tab.color.split(",")[0]} 0%,${tab.color}cc 100%)`,
                      color: "#0a0714", border: "none", fontFamily: "'DM Sans',sans-serif",
                      boxShadow: `0 2px 16px ${tab.color}33`,
                    }}
                  >
                    Try {tab.label} <ArrowRight />
                  </button>
                </div>
              </div>

              {}
              <div style={{ marginTop: 18, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,.025)", border: "1px solid rgba(196,176,255,.07)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ color: tab.color, flexShrink: 0, marginTop: 1 }}><CheckIcon /></div>
                <p style={{ fontSize: 12, color: "rgba(196,176,255,.5)", lineHeight: 1.55, margin: 0 }}>
                  <span style={{ color: tab.color, fontWeight: 600 }}>Pro tip: </span>
                  {tab.id === "resume" && "Run your resume through the analyser before every application — tailored resumes get 3× more callbacks."}
                  {tab.id === "practice" && "Practise the same topic across all three difficulty levels. The AI never repeats the same question twice."}
                  {tab.id === "skills" && "Add both hard and soft skills. The AI cross-references them to suggest the strongest job roles for your profile."}
                  {tab.id === "roadmap" && "Generate separate roadmaps for your current role and your dream role — then compare the gaps to fill."}
                </p>
              </div>
            </Card>
          </div>

          <div style={{ height: 16 }} />
        </div>
      </div>
    </>
  );
}
