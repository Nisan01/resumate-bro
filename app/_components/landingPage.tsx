"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── Injected global styles (animations + shimmer + reveal) ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');

    @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
    @keyframes drift {
      0%   { transform: translateY(0)     translateX(0)     rotate(0deg); }
      25%  { transform: translateY(-30px) translateX(20px)  rotate(90deg); }
      50%  { transform: translateY(-15px) translateX(-15px) rotate(180deg); }
      75%  { transform: translateY(-40px) translateX(10px)  rotate(270deg); }
      100% { transform: translateY(0)     translateX(0)     rotate(360deg); }
    }
    @keyframes floatY {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-8px); }
    }

    .shimmer {
      background: linear-gradient(100deg,#c4b0ff 0%,#7ee8fa 50%,#ff9de2 100%);
      background-size: 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 5s linear infinite;
    }
    .float-y   { animation: floatY 4s ease-in-out infinite; }
    .float-y-2 { animation: floatY 4s ease-in-out infinite; animation-delay: -2s; }

    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity .7s ease, transform .7s ease;
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    .bar-fill { transition: width 1.2s ease; }

    /* orb */
    .orb {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%,
        rgba(255,255,255,.55) 0%,
        rgba(196,176,255,.35) 15%,
        rgba(126,232,250,.25) 35%,
        rgba(255,157,226,.2)  55%,
        rgba(8,11,18,.1)      75%,
        transparent 100%);
      box-shadow:
        inset 0 0 30px rgba(255,255,255,.12),
        inset 2px 2px 12px rgba(255,255,255,.25),
        0 0 60px rgba(180,140,255,.08);
      border: 1px solid rgba(255,255,255,.12);
      animation: drift linear infinite;
      pointer-events: none;
    }
    .orb-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid transparent;
      background:
        linear-gradient(#080b12,#080b12) padding-box,
        linear-gradient(135deg,rgba(196,176,255,.6),rgba(126,232,250,.6),rgba(255,157,226,.6)) border-box;
      animation: drift linear infinite;
      pointer-events: none;
    }

    /* nav glass on scroll */
    .nav-glass { background: rgba(8,11,18,.75); border-bottom: 1px solid rgba(255,255,255,.07); backdrop-filter: blur(14px); }

    /* card hover */
    .profile-card {
      transition: transform .3s, border-color .3s, box-shadow .3s;
      position: relative;
      overflow: hidden;
    }
    .profile-card::before {
      content: "";
      position: absolute;
      bottom: -60px; left: 50%;
      transform: translateX(-50%);
      width: 140%; height: 160px;
      background: radial-gradient(circle,
        rgba(196,176,255,.45) 0%,
        rgba(126,232,250,.35) 40%,
        rgba(255,157,226,.25) 60%,
        transparent 75%);
      filter: blur(60px);
      opacity: .8;
      transition: opacity .4s, transform .4s;
    }
    .profile-card:hover::before { opacity: 1; transform: translateX(-50%) scale(1.2); }
    .profile-card:hover {
      transform: translateY(-8px) scale(1.02);
      border-color: rgba(255,255,255,.22) !important;
      box-shadow: 0 30px 80px rgba(0,0,0,.45), 0 0 28px rgba(196,176,255,.12) !important;
    }

    /* step hover */
    .step-circle { transition: all .3s; }
    .step-wrap:hover .step-circle {
      border-color: #c4b0ff !important;
      box-shadow: 0 0 24px rgba(196,176,255,.3) !important;
      background: rgba(196,176,255,.08) !important;
      color: #c4b0ff !important;
    }

    /* buttons */
    .btn-primary {
      color: #0a0714;
      background: linear-gradient(135deg,#b49fff 0%,#7ee8fa 50%,#ff9de2 100%);
      border: 1px solid transparent;
      font-weight: 700;
      box-shadow: 0 0 24px rgba(180,140,255,.3);
      transition: filter .2s, box-shadow .2s, transform .2s;
    }
    .btn-primary:hover {
      filter: brightness(1.08);
      box-shadow: 0 0 40px rgba(180,140,255,.5);
      transform: translateY(-2px);
    }
    .btn-ghost {
      color: rgba(220,215,255,.55);
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.1);
      transition: color .2s, border-color .2s, background .2s;
    }
    .btn-ghost:hover { color: #f0eeff; border-color: rgba(255,255,255,.22); background: rgba(255,255,255,.07); }

    /* ring chart */
    .ring-fill {
      fill: none;
      stroke: url(#ringGrad1);
      stroke-width: 8;
      stroke-linecap: round;
      stroke-dasharray: 283;
      stroke-dashoffset: 57;
      filter: drop-shadow(0 0 6px rgba(196,176,255,.6));
    }

    input:focus { outline: none; border-color: #c4b0ff !important; box-shadow: 0 0 0 3px rgba(196,176,255,.2) !important; }
  `}</style>
);

/* ─── Reveal hook ─── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}



/* ─── Orb ─── */
function Orb({ size, top, left, right, bottom, duration, delay = 0, opacity, ring = false }: {
  size: number; top?: string; left?: string; right?: string; bottom?: string;
  duration: number; delay?: number; opacity: number; ring?: boolean;
}) {
  const base: React.CSSProperties = {
    width: size, height: size, top, left, right, bottom, opacity,
    animationDuration: `${duration}s`, animationDelay: `${delay}s`,
  };
  return ring
    ? <div className="orb-ring" style={base} />
    : <div className="orb" style={base} />;
}

/* ─── Skill bar ─── */
function Bar({ label, pct, from, to, color }: { label: string; pct: number; from: string; to: string; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs" style={{ color: "rgba(220,215,255,.45)" }}>
        <span>{label}</span><span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
        <div className="bar-fill h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${from},${to})` }} />
      </div>
    </div>
  );
}

/* ─── Avatar card ─── */
function ProfileCard({ seed, style, name, role, rating, work, badge }: {
  seed: string; style: string; name: string; role: string;
  rating: string; work: string; badge: string;
}) {
  return (
    <div className="profile-card flex flex-col items-center text-center gap-2.5 rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", minHeight: 280, boxShadow: "0 20px 60px rgba(0,0,0,.4),inset 0 0 20px rgba(255,255,255,.04)" }}>
      <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 80, height: 80, border: "2px solid rgba(255,255,255,.25)", background: "linear-gradient(140deg,rgba(196,176,255,.25),rgba(126,232,250,.15))", boxShadow: "0 8px 22px rgba(0,0,0,.3)" }}>
        <img src={`https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="font-bold text-base mt-1" style={{ color: "#f0eeff" }}>{name}</div>
      <div className="text-xs uppercase tracking-widest" style={{ color: "rgba(220,215,255,.45)" }}>{role}</div>
      <div className="text-sm font-semibold" style={{ color: "#ffd166" }}>{rating}</div>
      <div className="text-xs px-3 py-1.5 rounded-full" style={{ color: "rgba(220,215,255,.45)", border: "1px solid rgba(255,255,255,.15)" }}>{work}</div>
      <div className="text-xs px-2.5 py-1 rounded-xl" style={{ color: "#f0eeff", background: "rgba(255,255,255,.08)" }}>{badge}</div>
    </div>
  );
}

/* ─── Step ─── */
function Step({ emoji, name, desc }: { emoji: string; name: string; desc: string }) {
  return (
    <div className="step-wrap flex flex-col items-center text-center px-4">
      <div className="step-circle flex items-center justify-center rounded-full text-4xl mb-5 relative z-10"
        style={{ width: 92, height: 92, background: "#0d1020", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 0 30px rgba(196,176,255,.2)", fontSize: "2.4rem" }}>
        {emoji}
      </div>
      <div className="font-bold text-lg mb-2" style={{ color: "#f0eeff" }}>{name}</div>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(220,215,255,.45)" }}>{desc}</p>
    </div>
  );
}

/* ─── Page ─── */
export default function Page() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useReveal();


  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const muted = "rgba(220,215,255,.45)";
  const accent1 = "#c4b0ff";
  const accent2 = "#ff9de2";
  const accent3 = "#7ee8fa";
  const border  = "rgba(255,255,255,.08)";

const navLinks = [
  ["#hero","Home"],
  ["#features","Features"],
  ["#how","How It Works"]
];
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#080b12", color: "#f0eeff", fontFamily: "'Sora', system-ui, sans-serif" }}>
      <GlobalStyles />

      {/* ── Ambient background ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 15% 20%,rgba(90,60,180,.28),transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 45% at 85% 10%,rgba(60,140,200,.2),transparent 55%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 60% at 75% 85%,rgba(180,80,160,.18),transparent 55%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 35% at 10% 80%,rgba(40,100,190,.15),transparent 50%)" }} />
      </div>

      {/* ── Floating orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <Orb size={340} top="-80px"   right="8%"   duration={22}         opacity={0.45} />
        <Orb size={200} top="38%"     left="2%"    duration={18} delay={-6}  opacity={0.35} />
        <Orb size={120} bottom="12%"  left="45%"   duration={15} delay={-4}  opacity={0.3} />
        <Orb size={80}  top="14%"     left="42%"   duration={12} delay={-2}  opacity={0.4} />
        <Orb size={280} top="20%"     right="22%"  duration={28} delay={-10} opacity={0.25} ring />
        <Orb size={180} bottom="25%"  left="18%"   duration={20} delay={-7}  opacity={0.2}  ring />
        <Orb size={260} bottom="-60px" right="-40px" duration={25} delay={-12} opacity={0.28} />
      </div>

      {/* ══════════════ NAV ══════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-glass" : ""}`}>
        <div className="max-w-6xl mx-auto px-5 md:px-1 py-4 flex items-center justify-between gap-4">

          {/* Brand */}
          <a href="#" className="flex items-center gap-2.5 no-underline flex-shrink-0">
            <img src="/logo.png" alt="Resumate Bro" className="h-8 w-auto object-contain" />
            <span className="font-extrabold text-xl tracking-tight hidden sm:inline" style={{ color: "#f0eeff" }}>Resumate Bro</span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-10 list-none">
            {navLinks.map(([href, lbl]) => (
              <li key={lbl}>
                <Link href={href} className="text-sm no-underline transition-colors duration-200"
                  style={{ color: muted }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f0eeff")}
                  onMouseLeave={e => (e.currentTarget.style.color = muted)}>{lbl}</Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="btn-primary no-underline px-5 py-2 rounded-lg text-sm font-semibold inline-flex items-center">
              Sign In
            </Link>
            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-1 cursor-pointer border-none bg-transparent" aria-label="Menu">
              {[0,1,2].map(i => (
                <span key={i} className="block rounded" style={{ width: 20, height: 2, background: muted }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-4 px-6 pb-5 pt-2" style={{ borderTop: `1px solid ${border}`, background: "rgba(8,11,18,.92)", backdropFilter: "blur(14px)" }}>
            {navLinks.map(([href, lbl]) => (
              <a key={lbl} href={href} className="text-sm no-underline" style={{ color: muted }} onClick={() => setMenuOpen(false)}>{lbl}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section id="hero" className="relative z-10  flex items-center pt-20 pb-16 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Copy */}
            <div className="reveal flex flex-col items-start">
              {/* Pill */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 text-xs font-medium tracking-wide"
                style={{ background: "rgba(196,176,255,.08)", border: "1px solid rgba(196,176,255,.2)", color: accent1 }}>
                <span style={{ fontSize: "0.45rem", animation: "blink 2s ease infinite" }}>●</span>
                AI-Powered Career Intelligence
              </div>

              <h1 className="font-extrabold leading-tight tracking-tight mb-5" style={{ fontSize: "clamp(2.2rem,4vw,3.5rem)", letterSpacing: "-0.03em" }}>
                Transform Your Resume,<br />
                Unlock Your{" "}
                <span className="shimmer">Career Potential</span>
              </h1>

              <p className="mb-9 leading-relaxed font-light" style={{ color: muted, fontSize: "1.05rem", maxWidth: 440 }}>
                Upload your resume, get instant AI-powered skill analysis, and receive a personalised roadmap to your dream role — in seconds.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/sign-up" className="btn-primary no-underline px-8 py-3.5 rounded-xl text-base inline-flex items-center gap-2">
                  Get Started Free ↗
                </Link>
                <a href="#how" className="btn-ghost no-underline px-8 py-3.5 rounded-xl text-base inline-flex items-center gap-2">
                  See How It Works
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-10 mt-8 pt-6" style={{ borderTop: `1px solid ${border}` }}>
                {[["94%","Match Accuracy"],["50K+","Careers Shaped"],["3×","Faster Hiring"]].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div className="text-2xl font-extrabold" style={{ color: "#f0eeff" }}>{val}</div>
                    <div className="text-xs mt-1" style={{ color: muted }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card */}
            <div className="reveal hidden lg:block relative" style={{ transitionDelay: "0.15s" }}>
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient id="ringGrad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c4b0ff" />
                    <stop offset="50%" stopColor="#7ee8fa" />
                    <stop offset="100%" stopColor="#ff9de2" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Main card */}
              <div className="rounded-2xl p-6 relative" style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${border}`, backdropFilter: "blur(12px)" }}>
                {/* gradient overlay */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: "linear-gradient(135deg,rgba(196,176,255,.15),rgba(126,232,250,.08),transparent 60%)", zIndex: 0 }} />

                <div className="relative z-10 flex flex-col gap-5">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: accent1 }} />
                    <span className="text-sm font-bold">Resume Analysis</span>
                    <span className="ml-auto text-xs" style={{ color: muted }}>Live</span>
                  </div>

                  {/* Ring chart */}
                  <div className="flex justify-center">
                    <div className="relative" style={{ width: 120, height: 120 }}>
                      <svg viewBox="0 0 100 100" width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke={border} strokeWidth="8" />
                        <circle cx="50" cy="50" r="45" className="ring-fill" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-extrabold">80</div>
                        <div className="text-xs" style={{ color: muted }}>Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Skill bars */}
                  <div className="flex flex-col gap-3">
                    <Bar label="Python"             pct={92} from="#c4b0ff" to="#7ee8fa" color={accent1} />
                    <Bar label="Machine Learning"   pct={74} from="#7ee8fa" to="#b49fff" color={accent3} />
                    <Bar label="Data Visualization" pct={61} from="#ff9de2" to="#c4b0ff" color={accent2} />
                  </div>
                </div>
              </div>

              {/* Floating chip — top left */}
              <div className="float-y absolute -top-5 -left-8 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs whitespace-nowrap"
                style={{ background: "rgba(13,16,28,.92)", border: "1px solid rgba(196,176,255,.2)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
                <span className="text-lg">✅</span>
                <div>
                  <div style={{ color: muted }}>Skills Matched</div>
                  <div className="font-semibold" style={{ color: "#f0eeff" }}>18 of 22</div>
                </div>
              </div>

              {/* Floating chip — bottom right */}
              <div className="float-y-2 absolute -bottom-5 -right-8 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs whitespace-nowrap"
                style={{ background: "rgba(13,16,28,.92)", border: "1px solid rgba(196,176,255,.2)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
                <span className="text-lg">🎯</span>
                <div>
                  <div style={{ color: muted }}>Role Fit</div>
                  <div className="font-semibold" style={{ color: "#f0eeff" }}>Senior ML Eng</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES / PROFILES ══════════════ */}
      <section id="features" className="relative z-10 py-14 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto w-full">

          {/* Heading */}
          <div className="reveal mb-10">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent1 }}>Success Stories</div>
            <h2 className="font-extrabold tracking-tight mb-4" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", letterSpacing: "-0.02em" }}>
              Real People, Real Results
            </h2>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: muted }}>
              Professionals who've used Resumate Bro to land roles at top companies.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { seed:"Aisha",  style:"pixel-art",  name:"Aisha Mensah",  role:"Junior Dev → Senior Engineer",       rating:"⭐ 4.9", work:"Full Stack • React",         badge:"Fast Growth 🚀" },
              { seed:"James",  style:"bottts",      name:"James Kirtley", role:"Graphic Designer → UX Lead",         rating:"⭐ 4.8", work:"UX Design • Figma",          badge:"Top Performer" },
              { seed:"Keiko",  style:"adventurer",  name:"Keiko Tanaka",  role:"Data Analyst → Cloud Architect",     rating:"⭐ 4.7", work:"AWS • Data Pipelines",       badge:"Cloud Expert ☁️" },
              { seed:"Noah",   style:"micah",       name:"Noah Alvarez",  role:"Product Analyst → Product Manager",  rating:"⭐ 4.8", work:"Product Strategy • Agile",   badge:"Leadership ⭐" },
            ].map(p => <ProfileCard key={p.seed} {...p} />)}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section id="how" className="relative z-10 py-14 px-6 sm:px-10" style={{ background: "linear-gradient(180deg,transparent,rgba(13,18,32,.6) 30%,rgba(13,18,32,.6) 70%,transparent)" }}>
        <div className="max-w-6xl mx-auto w-full">

          {/* Heading */}
          <div className="reveal text-center mb-10">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent1 }}>The Process</div>
            <h2 className="font-extrabold tracking-tight mb-4" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", letterSpacing: "-0.02em" }}>
              Four Steps to Career Clarity
            </h2>
            <p className="text-sm" style={{ color: muted }}>Simple enough to start today. Powerful enough to transform your career.</p>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0">
            {/* Connector line (desktop only) */}
            <div className="hidden lg:block absolute" style={{ top: 46, left: "12.5%", right: "12.5%", height: 2, background: "linear-gradient(90deg,rgba(196,176,255,.5),rgba(126,232,250,.4),rgba(255,157,226,.3))", opacity: .5 }} />
            <Step emoji="📤" name="Upload Resume"           desc="Drop your PDF or Word doc. We support all formats and instantly parse the content." />
            <Step emoji="🧠" name="Analyse Skills"          desc="Our AI maps every skill, experience, and achievement to industry benchmarks." />
            <Step emoji="💡" name="Receive Recommendations" desc="Get a personalised action plan: roles to target, skills to build, courses to take." />
            <Step emoji="🚀" name="Track Progress"          desc="Watch your score and match rate improve as you execute your personalised plan." />
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section id="cta" className="relative z-10 py-14 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto w-full">
          <div className="reveal rounded-3xl text-center px-8 sm:px-16 py-14 relative overflow-hidden"
            style={{ border: "1px solid rgba(196,176,255,.15)", background: "radial-gradient(ellipse at 50% 0%,rgba(196,176,255,.09),transparent 70%),radial-gradient(ellipse at 100% 100%,rgba(126,232,250,.07),transparent 60%),#0d1020" }}>
            {/* Top line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(196,176,255,.5),rgba(126,232,250,.4),transparent)" }} />

            <h2 className="font-extrabold tracking-tight mb-4" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", letterSpacing: "-0.03em" }}>
              Start improving your<br /><span className="shimmer">career today.</span>
            </h2>
            <p className="mb-7 text-base" style={{ color: muted }}>
              Join 50,000+ professionals who've used Resumate Bro to land roles at top companies.
            </p>
            <div className="flex flex-wrap justify-center gap-3">

              <Link href="/sign-up" className="btn-primary no-underline px-9 md:px-9 py-3.5 rounded-xl md:text-base text-[15px] items-center gap-2">
                Create Free  <br className="block md:hidden" /> Account 
              </Link>
              <a href="#how" className="btn-ghost no-underline px-9 py-3.5 rounded-xl text-base inline-flex items-center gap-2">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="relative z-10 px-6 sm:px-10 pt-12 pb-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">

          {/* Top row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            {/* Brand col */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-extrabold text-lg mb-3" style={{ color: "#f0eeff" }}>Resumate Bro</h3>
              <p className="text-sm leading-relaxed" style={{ color: muted }}>AI career intelligence that turns your resume into a data-driven growth path.</p>
            </div>

            {[
              { title: "Product",  links: [["Features","#features"],["How It Works","#how"]] },
              { title: "Company",  links: [["About","#"],["Blog","#"],["Careers","#"]] },
              { title: "Support",  links: [["Help Center","#"],["Contact","#"],["Legal","#"]] },
            ].map(({ title, links }) => (
              <div key={title} className="flex flex-col gap-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#f0eeff" }}>{title}</h4>
                {links.map(([lbl, href]) => (
                  <a key={lbl} href={href} className="text-sm no-underline transition-colors duration-200" style={{ color: muted }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#f0eeff")}
                    onMouseLeave={e => (e.currentTarget.style.color = muted)}>{lbl}</a>
                ))}
              </div>
            ))}
          </div>



          {/* Bottom bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs" style={{ borderTop: `1px solid ${border}`, color: muted }}>
            <div>© {new Date().getFullYear()} Resumate Bro. All rights reserved.</div>
            <div className="flex gap-6 flex-wrap">
              {["Privacy Policy","Terms of Service","Site Map"].map(t => (
                <a key={t} href="#" className="no-underline transition-colors duration-200" style={{ color: muted }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f0eeff")}
                  onMouseLeave={e => (e.currentTarget.style.color = muted)}>{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}