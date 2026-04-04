

"use client";

import { useEffect, useRef, useState } from "react";

/* ── Keyframes injected once ── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Soria:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

    * { font-family: 'Soria', sans-serif; }

    @keyframes drift {
      0%   { transform: translateY(0)     translateX(0)     rotate(0deg);   }
      25%  { transform: translateY(-30px) translateX(20px)  rotate(90deg);  }
      50%  { transform: translateY(-15px) translateX(-15px) rotate(180deg); }
      75%  { transform: translateY(-40px) translateX(10px)  rotate(270deg); }
      100% { transform: translateY(0)     translateX(0)     rotate(360deg); }
    }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0% { background-position:0%; } 100% { background-position:200%; } }
    @keyframes bpulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.42;transform:scale(.70)} }
    @keyframes fillBar { from { width:0% } to { width: var(--target) } }
    @keyframes statPulse {
      0%,100% { box-shadow: 0 0 0 rgba(196,176,255,0); }
      50%     { box-shadow: 0 0 20px rgba(196,176,255,0.22); }
    }

    .anim-fadeup-0  { animation: fadeUp .55s cubic-bezier(.22,.88,.34,1) both; }
    .anim-fadeup-1  { animation: fadeUp .6s  cubic-bezier(.22,.88,.34,1) .07s both; }
    .anim-fadeup-2  { animation: fadeUp .6s  cubic-bezier(.22,.88,.34,1) .14s both; }
    .anim-fadeup-3  { animation: fadeUp .6s  cubic-bezier(.22,.88,.34,1) .04s both; }
    .anim-fadeup-4  { animation: fadeUp .6s  cubic-bezier(.22,.88,.34,1) .22s both; }
    .anim-fadeup-5  { animation: fadeUp .6s  cubic-bezier(.22,.88,.34,1) .30s both; }
    .anim-fadeup-6  { animation: fadeUp .6s  cubic-bezier(.22,.88,.34,1) .38s both; }
    .anim-fadeup-7  { animation: fadeUp .6s  cubic-bezier(.22,.88,.34,1) .46s both; }
    .anim-fadeup-8  { animation: fadeUp .6s  cubic-bezier(.22,.88,.34,1) .54s both; }

    .shimmer-text {
      background: linear-gradient(100deg, #c4b0ff 0%, #7ee8fa 50%, #ff9de2 100%);
      background-size: 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 5s linear infinite;
    }
    .badge-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #c4b0ff; box-shadow: 0 0 8px rgba(196,176,255,0.6);
      animation: bpulse 2.4s ease-in-out infinite;
      flex-shrink: 0;
    }
    .drift { animation: drift linear infinite; }

    .orb {
      position: absolute; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%,
        rgba(255,255,255,0.55) 0%, rgba(196,176,255,0.35) 15%,
        rgba(126,232,250,0.25) 35%, rgba(255,157,226,0.2) 55%,
        rgba(8,11,18,0.1) 75%, transparent 100%);
      box-shadow: inset 0 0 30px rgba(255,255,255,0.12), inset 2px 2px 12px rgba(255,255,255,0.25), 0 0 60px rgba(180,140,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .orb::after {
      content: ''; position: absolute; top: 12%; left: 18%; width: 30%; height: 18%;
      background: rgba(255,255,255,0.35); border-radius: 50%;
      filter: blur(6px); transform: rotate(-30deg);
    }
    .orb-ring {
      position: absolute; border-radius: 50%;
      border: 1.5px solid transparent;
      background: linear-gradient(#080b12, #080b12) padding-box,
                  linear-gradient(135deg, rgba(196,176,255,0.6), rgba(126,232,250,0.6), rgba(255,157,226,0.6)) border-box;
    }

    .bar-fill {
      height: 100%; border-radius: 99px; width: 0%;
      background: linear-gradient(90deg, #c4b0ff, #7ee8fa, #ff9de2);
      background-size: 200% 100%;
      animation: fillBar 1.1s cubic-bezier(.34,1.56,.64,1) forwards, shimmer 3s linear infinite;
      box-shadow: 0 0 8px rgba(196,176,255,0.4);
    }

    .glass-card {
      background: rgba(8,11,18,0.50);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-radius: 16px;
      padding: 26px 28px;
      position: relative; overflow: hidden;
      transition: border-color .25s, box-shadow .25s;
    }
    .glass-card::before {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 65% 52% at 105% 0%, rgba(196,176,255,0.06) 0%, transparent 68%),
        radial-gradient(ellipse 50% 42% at -5% 100%, rgba(126,232,250,0.04) 0%, transparent 68%);
    }
    .glass-card:hover {
      border-color: rgba(196,176,255,0.18);
      box-shadow: 0 8px 40px rgba(0,0,0,0.3);
    }

    .field-input {
      flex: 1; min-width: 180px;
      padding: 11px 16px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.085);
      background: rgba(255,255,255,0.04);
      color: #f0eeff;
      font-size: 13.5px;
      outline: none;
      transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .field-input::placeholder { color: rgba(220,215,255,0.30); }
    .field-input:focus {
      border-color: rgba(196,176,255,0.48);
      background: rgba(196,176,255,0.04);
      box-shadow: 0 0 0 3px rgba(196,176,255,0.09);
    }

    .btn-primary {
      padding: 11px 26px;
      border-radius: 10px; border: none;
      background: linear-gradient(135deg, #c4b0ff 0%, #7ee8fa 50%, #ff9de2 100%);
      color: #0a0714;
      font-size: 13.5px; font-weight: 700;
      cursor: pointer; letter-spacing: .01em;
      box-shadow: 0 4px 28px rgba(196,176,255,0.30);
      transition: all .22s ease;
      position: relative; overflow: hidden; white-space: nowrap;
    }
    .btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.13),transparent); opacity:0; transition:opacity .2s; }
    .btn-primary:hover { transform: translateY(-2px); filter: brightness(1.08); box-shadow: 0 8px 36px rgba(196,176,255,0.45); }
    .btn-primary:hover::before { opacity: 1; }
    .btn-primary:active { transform: translateY(0); }

    .skill-chip {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 14px 12px;
      position: relative; cursor: default;
      transition: transform .22s, border-color .22s, box-shadow .22s;
    }
    .skill-chip:hover {
      transform: translateY(-5px);
      border-color: rgba(196,176,255,0.38);
      box-shadow: 0 0 22px rgba(196,176,255,0.14), 0 8px 20px rgba(0,0,0,0.22);
    }
    .chip-remove {
      position: absolute; top: 7px; right: 7px;
      width: 17px; height: 17px; border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: none; cursor: pointer;
      color: rgba(220,215,255,0.30); font-size: 10px;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .2s, background .2s;
    }
    .skill-chip:hover .chip-remove { opacity: 1; }
    .chip-remove:hover { background: rgba(255,157,226,0.22); color: #ff9de2; }

    .stat-block {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 18px 16px;
      text-align: center;
      position: relative; overflow: hidden;
      transition: transform .22s, border-color .22s, box-shadow .22s;
      animation: statPulse 4s ease-in-out infinite;
    }
    .stat-block:hover { transform: translateY(-4px); border-color: rgba(196,176,255,0.2); }

    .toast {
      position: fixed; bottom: 28px; right: 28px;
      background: rgba(13,16,32,0.88);
      border: 1px solid rgba(196,176,255,0.28);
      backdrop-filter: blur(14px);
      border-radius: 10px;
      padding: 11px 18px;
      font-size: 13px; color: #f0eeff;
      transform: translateY(70px); opacity: 0;
      transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .3s;
      z-index: 999;
    }
    .toast.show { transform: translateY(0); opacity: 1; }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(196,176,255,0.15); border-radius: 3px; }
  `}</style>
);

/* ── Types ── */
type Level = "Advanced" | "Proficient" | "Learning" | "Beginner";
interface Skill { name: string; level: Level; pct: number; }

const ICONS: Record<string, string> = {
  React: "⚛️", JavaScript: "🟨", TypeScript: "🔷", Docker: "🐳",
  Python: "🐍", Kubernetes: "☸️", Node: "🟢", CSS: "🎨",
  Vue: "💚", Angular: "🔺", SQL: "🗄️", AWS: "☁️",
  Git: "🔀", Linux: "🐧", Rust: "🦀", Go: "🐹",
};

function lvClass(l: Level) {
  return ({
    Advanced:  "bg-[rgba(196,176,255,0.14)] text-[#c4b0ff]",
    Proficient:"bg-[rgba(126,232,250,0.12)] text-[#7ee8fa]",
    Learning:  "bg-[rgba(255,157,226,0.12)] text-[#ff9de2]",
    Beginner:  "bg-[rgba(251,191,36,0.10)]  text-[#fde68a]",
  })[l];
}

/* ── Radar Chart ── */
declare const Chart: any;

export default function SkillTracker() {
  const [skills, setSkills] = useState<Skill[]>([
    { name: "React",      level: "Advanced",   pct: 80 },
    { name: "JavaScript", level: "Proficient",  pct: 70 },
    { name: "Docker",     level: "Learning",    pct: 55 },
    { name: "Kubernetes", level: "Beginner",    pct: 30 },
  ]);
  const [skillInput, setSkillInput] = useState("");
  const [levelSelect, setLevelSelect] = useState<Level>("Advanced");
  const [pctInput, setPctInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);
  const radarChart = useRef<any>(null);

  /* ── Toast ── */
  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  }

  /* ── Add / Remove ── */
  function addSkill() {
    const raw = skillInput.trim();
    if (!raw) return;
    const name = raw.charAt(0).toUpperCase() + raw.slice(1);
    if (skills.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      showToast("⚠ Skill already added"); return;
    }
    const pct = Math.min(100, Math.max(0, parseInt(pctInput) || 50));
    setSkills(prev => [...prev, { name, level: levelSelect, pct }]);
    setSkillInput("");
    setPctInput("");
    showToast("✦ " + name + " added!");
  }

  function removeSkill(idx: number) {
    setSkills(prev => prev.filter((_, i) => i !== idx));
    showToast("Skill removed");
  }

  /* ── Radar Chart ── */
  useEffect(() => {
    if (!radarRef.current) return;
    if (radarChart.current) radarChart.current.destroy();
    const ctx = radarRef.current.getContext("2d");
    if (!ctx || typeof Chart === "undefined") return;
    radarChart.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: skills.map(s => s.name),
        datasets: [{
          label: "Proficiency",
          data: skills.map(s => s.pct),
          backgroundColor: "rgba(196,176,255,0.10)",
          borderColor: "rgba(196,176,255,0.65)",
          pointBackgroundColor: "#c4b0ff",
          pointBorderColor: "rgba(255,255,255,0.4)",
          pointHoverBackgroundColor: "#ff9de2",
          borderWidth: 1.8,
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: "easeOutQuart" },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: {
              color: "rgba(220,215,255,0.28)",
              backdropColor: "transparent",
              font: { size: 9, family: "Soria" },
              stepSize: 25,
            },
            grid:       { color: "rgba(255,255,255,0.06)" },
            angleLines: { color: "rgba(255,255,255,0.06)" },
            pointLabels: {
              color: "rgba(220,215,255,0.65)",
              font: { size: 12, family: "Soria", weight: "500" },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(8,11,18,0.88)",
            borderColor: "rgba(196,176,255,0.3)",
            borderWidth: 1,
            titleColor: "#f0eeff",
            bodyColor: "#c4b0ff",
            padding: 10,
            titleFont: { family: "Soria", size: 12 },
            bodyFont:  { family: "Soria", size: 11 },
          },
        },
      },
    });
  }, [skills]);

  /* ── Insights ── */
  const sorted = [...skills].sort((a, b) => b.pct - a.pct);
  const topSkill = sorted[0]?.name ?? "—";
  const lowSkill = sorted[sorted.length - 1]?.name ?? "—";

  return (
    <>
      <GlobalStyles />

      {/* Chart.js CDN */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js" />

      {/* ── Mesh gradient bg ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 15% 20%, rgba(90,60,180,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 85% 10%, rgba(60,140,200,0.2)  0%, transparent 55%),
            radial-gradient(ellipse 50% 60% at 75% 85%, rgba(180,80,160,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 10% 80%, rgba(40,100,190,0.15) 0%, transparent 50%),
            #080b12
          `,
        }}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── Orb layer ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <div className="orb drift" style={{ width: 340, height: 340, top: -80, right: "8%", animationDuration: "22s", opacity: 0.55 }} />
        <div className="orb drift" style={{ width: 200, height: 200, top: "38%", left: "2%", animationDuration: "18s", animationDelay: "-6s", opacity: 0.45 }} />
        <div className="orb drift" style={{ width: 120, height: 120, bottom: "12%", left: "45%", animationDuration: "15s", animationDelay: "-4s", opacity: 0.4 }} />
        <div className="orb drift" style={{ width: 80,  height: 80,  top: "14%", left: "42%", animationDuration: "12s", animationDelay: "-2s", opacity: 0.5 }} />
        <div className="orb-ring drift" style={{ width: 280, height: 280, top: "20%", right: "22%", animationDuration: "28s", animationDelay: "-10s", opacity: 0.3 }} />
        <div className="orb-ring drift" style={{ width: 180, height: 180, bottom: "25%", left: "18%", animationDuration: "20s", animationDelay: "-7s", opacity: 0.25 }} />
        <div className="orb drift" style={{ width: 260, height: 260, bottom: -60, right: -40, animationDuration: "25s", animationDelay: "-12s", opacity: 0.35 }} />
      </div>

      {/* ── Toast ── */}
      <div className={`toast ${toastVisible ? "show" : ""}`}>{toastMsg}</div>

      {/* ── Page ── */}
      <div className="relative z-10 w-full px-8 pt-[52px] pb-20 min-h-screen" style={{ color: "#f0eeff" }}>

        {/* Logo */}
        <img src="/logo.png" alt="Resumate" className="w-[34px] h-[34px] object-contain mb-9 anim-fadeup-0" />
         

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-[6px] mb-5 text-[12px] font-medium tracking-[0.04em] anim-fadeup-3"
          style={{
            background: "rgba(196,176,255,0.08)",
            border: "1px solid rgba(196,176,255,0.2)",
            color: "#c4b0ff",
          }}
        >
          <span className="badge-dot" />
          AI-Powered Skill Intelligence
        </div>

        {/* Headline */}
        <h1
          className="font-bold leading-[1.1] tracking-[-0.03em] mb-3 anim-fadeup-1"
          style={{ fontSize: "clamp(32px,4vw,50px)" }}
        >
          Track Your<br />
          <em className="not-italic shimmer-text">Skill Journey</em>
        </h1>

        {/* Sub */}
        <p
          className="text-[15px] leading-[1.68] font-light mb-10 max-w-[440px] anim-fadeup-2"
          style={{ color: "rgba(220,215,255,0.45)" }}
        >
          Track your skills and see how well they match your resume and job roles.
        </p>

        {/* Add Skill Card */}
        <div className="glass-card anim-fadeup-4 mb-[22px]">
          <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase mb-[5px]" style={{ color: "rgba(220,215,255,0.30)" }}>New Entry</div>
          <div className="text-[17px] font-bold tracking-[-0.01em] mb-5" style={{ color: "#f0eeff" }}>Add a Skill</div>
          <div className="flex gap-[10px] flex-wrap">
            <input
              className="field-input"
              type="text"
              placeholder="Enter a skill (e.g. React, Docker, Python)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSkill()}
            />
            <select
              className="field-input"
              style={{ maxWidth: 150, cursor: "pointer" }}
              value={levelSelect}
              onChange={e => setLevelSelect(e.target.value as Level)}
            >
              <option value="Advanced">Advanced</option>
              <option value="Proficient">Proficient</option>
              <option value="Learning">Learning</option>
              <option value="Beginner">Beginner</option>
            </select>
            <input
              className="field-input"
              type="number"
              placeholder="% (0–100)"
              min={0} max={100}
              style={{ maxWidth: 110 }}
              value={pctInput}
              onChange={e => {
                let v = parseInt(e.target.value);
                if (v > 100) v = 100;
                if (v < 0)  v = 0;
                setPctInput(isNaN(v) ? "" : String(v));
              }}
            />
            <button className="btn-primary" onClick={addSkill}>+ Add Skill</button>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px my-[22px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(196,176,255,0.12), transparent)" }}
        />

        {/* Progress + Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* Progress */}
          <div className="glass-card anim-fadeup-5">
            <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase mb-[5px]" style={{ color: "rgba(220,215,255,0.30)" }}>Proficiency</div>
            <div className="text-[17px] font-bold tracking-[-0.01em] mb-5" style={{ color: "#f0eeff" }}>Skill Progress</div>
            <div className="flex flex-col gap-0">
              {skills.map((s, i) => (
                <div
                  key={s.name + i}
                  className="mb-[18px] last:mb-0"
                  style={{ animation: `fadeUp .5s ease ${i * 0.08}s both` }}
                >
                  <div className="flex justify-between items-center mb-[7px]">
                    <span className="text-[13px] font-medium" style={{ color: "#f0eeff" }}>{s.name}</span>
                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: "#c4b0ff" }}>{s.pct}%</span>
                  </div>
                  <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="bar-fill"
                      style={{ "--target": `${s.pct}%`, animationDelay: `${0.35 + i * 0.1}s` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Cards */}
          <div className="glass-card anim-fadeup-6">
            <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase mb-[5px]" style={{ color: "rgba(220,215,255,0.30)" }}>Collection</div>
            <div className="text-[17px] font-bold tracking-[-0.01em] mb-5" style={{ color: "#f0eeff" }}>Skill Cards</div>
            <div className="grid gap-[10px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))" }}>
              {skills.map((s, i) => (
                <div
                  key={s.name + i}
                  className="skill-chip"
                  style={{ animation: `fadeUp .5s ease ${0.15 + i * 0.07}s both` }}
                >
                  <button className="chip-remove" onClick={() => removeSkill(i)} title="Remove">✕</button>
                  <div className="text-[20px] mb-[7px]">{ICONS[s.name] || "💡"}</div>
                  <div className="text-[12.5px] font-semibold mb-[5px]" style={{ color: "#f0eeff" }}>{s.name}</div>
                  <span className={`text-[10px] font-medium tracking-[0.05em] px-[7px] py-[2px] rounded-full inline-block ${lvClass(s.level)}`}>
                    {s.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Insights */}
        <div className="glass-card anim-fadeup-7 mb-5">
          <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase mb-[5px]" style={{ color: "rgba(220,215,255,0.30)" }}>Analytics</div>
          <div className="text-[17px] font-bold tracking-[-0.01em] mb-5" style={{ color: "#f0eeff" }}>Skill Insights</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px]">
            {[
              { icon: "🎯", lbl: "Total Skills",  val: String(skills.length), sub: "being tracked",      delay: "0s" },
              { icon: "🏆", lbl: "Top Skill",     val: topSkill,              sub: "highest proficiency", delay: "1.3s", small: true },
              { icon: "📈", lbl: "Needs Work",    val: lowSkill,              sub: "lowest proficiency",  delay: "2.6s", small: true },
            ].map(({ icon, lbl, val, sub, delay, small }) => (
              <div key={lbl} className="stat-block" style={{ animationDelay: delay }}>
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,176,255,0.08), transparent 70%)" }}
                />
                <div className="text-[22px] mb-[7px]">{icon}</div>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-[6px]" style={{ color: "rgba(220,215,255,0.30)" }}>{lbl}</div>
                <div
                  className={`shimmer-text font-extrabold ${small ? "text-[15px]" : "text-[21px]"}`}
                  style={{ fontFamily: "Soria, sans-serif" }}
                >
                  {val}
                </div>
                <div className="text-[11px] mt-1" style={{ color: "rgba(220,215,255,0.45)" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar */}
        <div className="glass-card anim-fadeup-8">
          <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase mb-[5px]" style={{ color: "rgba(220,215,255,0.30)" }}>Visualization</div>
          <div className="text-[17px] font-bold tracking-[-0.01em] mb-5" style={{ color: "#f0eeff" }}>Skill Radar</div>
          <div className="max-w-[320px] mx-auto">
            <canvas ref={radarRef} width={320} height={290} />
          </div>
        </div>

      </div>
    </>
  );
}



