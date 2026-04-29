"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";




const GlobalStyles = () => (
  <style>{`
    html { scroll-behavior: smooth; }

    @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
    @keyframes drift {
      0%   { transform: translateY(0)     translateX(0)     rotate(0deg);   }
      25%  { transform: translateY(-30px) translateX(20px)  rotate(90deg);  }
      50%  { transform: translateY(-15px) translateX(-15px) rotate(180deg); }
      75%  { transform: translateY(-40px) translateX(10px)  rotate(270deg); }
      100% { transform: translateY(0)     translateX(0)     rotate(360deg); }
    }
    @keyframes floatY {
      0%,100% { transform: translateY(0);   }
      50%     { transform: translateY(-8px); }
    }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.3} }

    .shimmer {
      background: linear-gradient(100deg,#c4b0ff 0%,#7ee8fa 50%,#ff9de2 100%);
      background-size: 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 5s linear infinite;
    }
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
    }
    .orb-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid transparent;
      background:
        linear-gradient(#080b12,#080b12) padding-box,
        linear-gradient(135deg,rgba(196,176,255,.6),rgba(126,232,250,.6),rgba(255,157,226,.6)) border-box;
      animation: drift linear infinite;
    }
    .float-chip { animation: floatY 4s ease-in-out infinite; }
    .float-chip-2 { animation: floatY 4s ease-in-out infinite; animation-delay: -2s; }

    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity .7s ease, transform .7s ease;
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    .skill-bar-fill { transition: width 1.2s ease; }

    .feature-card {
      position: relative;
      overflow: hidden;
      transition: transform .3s, border-color .3s, box-shadow .3s;
    }
    .feature-card::before {
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
      opacity: .9;
      transition: all .4s ease;
    }
    .feature-card:hover::before { opacity: 1; transform: translateX(-50%) scale(1.2); }
    .feature-card:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: rgba(255,255,255,.25) !important;
      box-shadow: 0 30px 80px rgba(0,0,0,.45), 0 0 30px rgba(196,176,255,.15) !important;
    }

    .step-num { transition: all .3s; }
    .step:hover .step-num {
      border-color: #c4b0ff !important;
      box-shadow: 0 0 24px rgba(196,176,255,.3) !important;
      background: rgba(196,176,255,.08) !important;
      color: #c4b0ff !important;
    }

    .btn-primary {
      color: #0a0714;
      background: linear-gradient(135deg,#b49fff 0%,#7ee8fa 50%,#ff9de2 100%);
      border: 1px solid transparent;
      font-weight: 600;
      box-shadow: 0 0 24px rgba(180,140,255,.3);
      transition: all .2s;
    }
    .btn-primary:hover {
      filter: brightness(1.08);
      box-shadow: 0 0 36px rgba(180,140,255,.5);
      transform: translateY(-2px);
    }
    .btn-ghost {
      color: rgba(220,215,255,.45);
      background: transparent;
      border: 1px solid rgba(255,255,255,.08);
      transition: all .2s;
    }
    .btn-ghost:hover { color: #f0eeff; border-color: rgba(255,255,255,.2); }

    .ring-fill {
      fill: none;
      stroke: url(#ringGrad1);
      stroke-width: 8;
      stroke-linecap: round;
      stroke-dasharray: 283;
      stroke-dashoffset: 57;
      filter: drop-shadow(0 0 6px rgba(196,176,255,.6));
    }

    input:focus {
      border-color: #c4b0ff !important;
      box-shadow: 0 0 0 3px rgba(196,176,255,.2) !important;
      outline: none;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translate(-50%, -80px); }
      to   { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
  `}</style>
);


function useRevealObserver() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}


function Orb({
  size, top, left, right, bottom, duration, delay, opacity, ring = false,
}: {
  size: number; top?: string; left?: string; right?: string; bottom?: string;
  duration: number; delay?: number; opacity: number; ring?: boolean;
}) {
  const pos: React.CSSProperties = {
    width: size, height: size, top, left, right, bottom, opacity,
    animationDuration: `${duration}s`,
    animationDelay: delay ? `${delay}s` : "0s",
    animationName: "drift",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    position: "absolute",
    borderRadius: "50%",
  };
  if (ring) {
    return (
      <div style={{
        ...pos,
        border: "1.5px solid transparent",
        background: "linear-gradient(#080b12,#080b12) padding-box, linear-gradient(135deg,rgba(196,176,255,0.6),rgba(126,232,250,0.6),rgba(255,157,226,0.6)) border-box",
      }} />
    );
  }
  return (
    <div style={{
      ...pos,
      background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55) 0%, rgba(196,176,255,0.35) 15%, rgba(126,232,250,0.25) 35%, rgba(255,157,226,0.2) 55%, rgba(8,11,18,0.1) 75%, transparent 100%)",
      boxShadow: "inset 0 0 30px rgba(255,255,255,0.12), inset 2px 2px 12px rgba(255,255,255,0.25), 0 0 60px rgba(180,140,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
    }} />
  );
}


function AvatarCard({ seed, style, name, role, rating, work, badge }: {
  seed: string; style: string; name: string; role: string;
  rating: string; work: string; badge: string;
}) {
  return (
    <div
      className="feature-card"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "28px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
        minHeight: 280,
        boxShadow: "0 20px 60px rgba(0,0,0,.5),inset 0 0 20px rgba(255,255,255,.05)",
      }}
    >
      <div style={{
        width: 82, height: 82, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,.3)",
        overflow: "hidden",
        background: "linear-gradient(140deg,rgba(196,176,255,.25),rgba(126,232,250,.15))",
        boxShadow: "0 8px 22px rgba(0,0,0,.35)",
      }}>
        <img src={`https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={name} />
      </div>
      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f0eeff", marginTop: 4 }}>{name}</div>
      <div style={{ fontSize: "0.82rem", color: "rgba(220,215,255,.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{role}</div>
      <div style={{ fontSize: "0.9rem", color: "#ffd166", fontWeight: 600 }}>{rating}</div>
      <div style={{ fontSize: "0.8rem", color: "rgba(220,215,255,.45)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 20, padding: "6px 12px" }}>{work}</div>
      <div style={{ fontSize: "0.7rem", color: "#f0eeff", background: "rgba(255,255,255,.08)", borderRadius: 12, padding: "5px 10px" }}>{badge}</div>
    </div>
  );
}


function SkillBar({ label, pct, gradFrom, gradTo, valColor }: {
  label: string; pct: number; gradFrom: string; gradTo: string; valColor: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "rgba(220,215,255,.45)" }}>
        <span>{label}</span><span style={{ color: valColor }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,.08)", borderRadius: 10, overflow: "hidden" }}>
        <div className="skill-bar-fill" style={{
          height: "100%", borderRadius: 10, width: `${pct}%`,
          background: `linear-gradient(90deg,${gradFrom},${gradTo})`,
        }} />
      </div>
    </div>
  );
}


function Step({ emoji, name, desc }: { emoji: string; name: string; desc: string }) {
  return (
    <div className="step" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 16px", position: "relative" }}>
      <div className="step-num" style={{
        width: 95, height: 95, borderRadius: "50%",
        background: "#0d1020",
        border: "1px solid rgba(255,255,255,.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2.6rem", marginBottom: 20, position: "relative", zIndex: 1,
        boxShadow: "0 0 30px rgba(196,176,255,.25)",
      }}>
        {emoji}
      </div>
      <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 8 }}>{name}</div>
      <p style={{ color: "rgba(220,215,255,.45)", fontSize: "0.82rem", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}




export default function Page() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useRevealObserver();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const S = {
    bg: "#080b12",
    text: "#f0eeff",
    muted: "rgba(220,215,255,.45)",
    surface: "rgba(255,255,255,.04)",
    border: "rgba(255,255,255,.08)",
    accent1: "#c4b0ff",
    accent2: "#ff9de2",
    accent3: "#7ee8fa",
  };

  return (
    <div style={{ background: S.bg, color: S.text, fontFamily: "system-ui,sans-serif", fontSize: 16, lineHeight: 1.6, minHeight: "100vh", overflowX: "hidden", position: "relative" }}>
      <GlobalStyles />

      
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 15% 20%,rgba(90,60,180,.28),transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 45% at 85% 10%,rgba(60,140,200,.2),transparent 55%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 75% 85%,rgba(180,80,160,.18),transparent 55%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 35% at 10% 80%,rgba(40,100,190,.15),transparent 50%)" }} />
      </div>

      
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: .5, zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E")`,
      }} />

      
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} aria-hidden>
        <Orb size={340} top="-80px"   right="8%"            duration={22}         opacity={0.45} />
        <Orb size={200} top="38%"     left="2%"             duration={18} delay={-6}  opacity={0.35} />
        <Orb size={120} bottom="12%"  left="45%"            duration={15} delay={-4}  opacity={0.3}  />
        <Orb size={80}  top="14%"     left="42%"            duration={12} delay={-2}  opacity={0.4}  />
        <Orb size={280} top="20%"     right="22%"           duration={28} delay={-10} opacity={0.25} ring />
        <Orb size={180} bottom="25%"  left="18%"            duration={20} delay={-7}  opacity={0.2}  ring />
        <Orb size={260} bottom="-60px" right="-40px"        duration={25} delay={-12} opacity={0.28} />
      </div>

      
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        padding: "18px 0",
        backdropFilter: "blur(12px)",
        background: "transparent",
        borderBottom: "1px solid transparent",
        transition: "background .4s, border-color .4s",
      }}>
        <div style={{ maxWidth: 1250, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center" }}>

            <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: S.text, fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
      <img src="/logo.png" alt="Resumate Bro" style={{ height: 36, width: "auto", objectFit: "contain" }} />
      Resumate Bro
    </a>

            <ul style={{ display: "flex", justifyContent: "center", gap: 60, listStyle: "none", margin: 0, padding: 0 }} className="nav-links-desktop">
              {[["#features","Features"],["#how","How It Works"],["#","Contact"]].map(([href,lbl]) => (
                <li key={lbl}><a href={href} style={{ color: S.muted, textDecoration: "none", fontSize: "0.9rem", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = S.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = S.muted)}>{lbl}</a></li>
              ))}
            </ul>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link href="/sign-in" className="btn btn-primary" style={{ padding: "9px 20px", borderRadius: 8, fontSize: "0.875rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Sign In</Link>
           
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 4 }} className="hamburger-btn">
                {[0,1,2].map(i => <span key={i} style={{ width: 22, height: 2, background: S.muted, borderRadius: 2, display: "block" }} />)}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 0", borderTop: `1px solid ${S.border}`, marginTop: 12 }}>
              {[["#features","Features"],["#how","How It Works"],["#","Contact"]].map(([href,lbl]) => (
                <a key={lbl} href={href} style={{ color: S.muted, textDecoration: "none" }} onClick={() => setMenuOpen(false)}>{lbl}</a>
              ))}
            </div>
          )}
        </div>
      </nav>

      
      <section id="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 0 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1250, margin: "0 auto", padding: "0 40px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

            
            <div className="reveal" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
                background: "rgba(196,176,255,.08)", border: "1px solid rgba(196,176,255,.2)",
                borderRadius: 100, padding: "6px 14px", fontSize: "0.78rem", color: S.accent1,
                fontWeight: 500, letterSpacing: "0.04em", marginBottom: 24,
              }}>
                <span style={{ fontSize: "0.5rem", animation: "blink 2s ease infinite" }}>●</span>
                AI-Powered Career Intelligence
              </div>

              <h1 style={{ fontSize: "clamp(2.2rem,4vw,3.4rem)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: 20 }}>
                Transform Your Resume,<br />
                Unlock Your <span className="shimmer">Career Potential</span>
              </h1>

              <p style={{ color: S.muted, fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
                Upload your resume, get instant AI-powered skill analysis, and receive a personalized roadmap to your dream role — in seconds.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/sign-up" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: "1rem", borderRadius: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>Get Started Free ↗</Link>
                <a href="#how" className="btn btn-ghost" style={{ padding: "14px 32px", fontSize: "1rem", borderRadius: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>See How It Works</a>
              </div>

              <div style={{ marginTop: 48, display: "flex", gap: 36 }}>
                {[["94%","Match Accuracy"],["50K+","Careers Shaped"],["3×","Faster Hiring"]].map(([val,lbl]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{val}</div>
                    <div style={{ fontSize: "0.78rem", color: S.muted, marginTop: 2 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="reveal" style={{ transitionDelay: "0.15s", position: "relative", padding: "20px 30px 20px 20px" }}>
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient id="ringGrad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c4b0ff" />
                    <stop offset="50%" stopColor="#7ee8fa" />
                    <stop offset="100%" stopColor="#ff9de2" />
                  </linearGradient>
                </defs>
              </svg>

              <div style={{
                background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16,
                padding: 24, backdropFilter: "blur(12px)", position: "relative",
              }}>
                
                <div style={{ position: "absolute", inset: -1, borderRadius: 17, background: "linear-gradient(135deg,rgba(196,176,255,.2),rgba(126,232,250,.1),transparent 60%)", zIndex: -1 }} />

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: S.accent1 }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>Resume Analysis</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: S.muted }}>Live</span>
                </div>

                
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ position: "relative", width: 120, height: 120 }}>
                    <svg viewBox="0 0 100 100" width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="50" cy="50" r="45" fill="none" stroke={S.border} strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" className="ring-fill" />
                    </svg>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>80</div>
                      <div style={{ fontSize: "0.7rem", color: S.muted }}>Score</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <SkillBar label="Python"            pct={92} gradFrom="#c4b0ff" gradTo="#7ee8fa" valColor={S.accent1} />
                  <SkillBar label="Machine Learning"  pct={74} gradFrom="#7ee8fa" gradTo="#b49fff" valColor={S.accent3} />
                  <SkillBar label="Data Visualization" pct={61} gradFrom="#ff9de2" gradTo="#c4b0ff" valColor={S.accent2} />
                </div>
              </div>

              
              <div className="float-chip" style={{
                position: "absolute", top: -18, left: -30,
                background: "rgba(13,16,28,.9)", border: "1px solid rgba(196,176,255,.2)",
                borderRadius: 12, padding: "10px 14px", fontSize: "0.78rem",
                backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 8px 32px rgba(0,0,0,.4)", whiteSpace: "nowrap",
              }}>
                <span style={{ fontSize: "1.1rem" }}>✅</span>
                <div>
                  <div style={{ color: S.muted }}>Skills Matched</div>
                  <div style={{ color: S.text, fontWeight: 600 }}>18 of 22</div>
                </div>
              </div>

              <div className="float-chip-2" style={{
                position: "absolute", bottom: 30, right: -30,
                background: "rgba(13,16,28,.9)", border: "1px solid rgba(196,176,255,.2)",
                borderRadius: 12, padding: "10px 14px", fontSize: "0.78rem",
                backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 8px 32px rgba(0,0,0,.4)", whiteSpace: "nowrap",
              }}>
                <span style={{ fontSize: "1.1rem" }}>🎯</span>
                <div>
                  <div style={{ color: S.muted }}>Role Fit</div>
                  <div style={{ color: S.text, fontWeight: 600 }}>Senior ML Eng</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      
      <section id="features" style={{ padding: "100px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1250, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 60 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: S.accent1, marginBottom: 12 }}>What We Offer</div>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 14 }}>Everything You Need to<br />Land Your Next Role</h2>
            <p style={{ color: S.muted, fontSize: "1rem", maxWidth: 480 }}>Intelligent tools that work together to turn your resume into a career accelerator.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, justifyContent: "center" }}>
            {[
              { seed:"Aisha",  style:"pixel-art",  name:"Aisha Mensah",  role:"Junior Dev → Senior Engineer",       rating:"⭐ 4.9", work:"Full Stack • React",         badge:"Fast Growth 🚀" },
              { seed:"James",  style:"bottts",      name:"James Kirtley", role:"Graphic Designer → UX Lead",         rating:"⭐ 4.8", work:"UX Design • Figma",          badge:"Top Performer" },
              { seed:"Keiko",  style:"adventurer",  name:"Keiko Tanaka",  role:"Data Analyst → Cloud Architect",     rating:"⭐ 4.7", work:"AWS • Data Pipelines",       badge:"Cloud Expert ☁️" },
              { seed:"Noah",   style:"micah",       name:"Noah Alvarez",  role:"Product Analyst → Product Manager",  rating:"⭐ 4.8", work:"Product Strategy • Agile",   badge:"Leadership ⭐" },
            ].map(p => <AvatarCard key={p.seed} {...p} />)}
          </div>
        </div>
      </section>

      
      <section id="how" style={{ padding: "100px 0", background: "linear-gradient(180deg,transparent,rgba(13,18,32,.6) 30%,rgba(13,18,32,.6) 70%,transparent)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1250, margin: "0 auto", padding: "0 40px" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: S.accent1, marginBottom: 12 }}>The Process</div>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 14 }}>Four Steps to Career Clarity</h2>
            <p style={{ color: S.muted, fontSize: "1rem" }}>Simple enough to start today. Powerful enough to transform your career.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, position: "relative" }}>
            
            <div style={{ position: "absolute", top: 48, left: "12.5%", right: "12.5%", height: 2, background: "linear-gradient(90deg,rgba(196,176,255,.5),rgba(126,232,250,.4),rgba(255,157,226,.3))", opacity: .5 }} />
            <Step emoji="📤" name="Upload Resume"          desc="Drop your PDF or Word doc. We support all formats and instantly parse the content." />
            <Step emoji="🧠" name="Analyze Skills"         desc="Our AI maps every skill, experience, and achievement to industry benchmarks." />
            <Step emoji="💡" name="Receive Recommendations" desc="Get a personalized action plan: roles to target, skills to build, courses to take." />
            <Step emoji="🚀" name="Track Progress"         desc="Watch your score and match rate improve as you execute your personalized plan." />
          </div>
        </div>
      </section>

      
      <section id="cta" style={{ padding: "100px 0", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1250, margin: "0 auto", padding: "0 40px" }}>
          <div className="reveal" style={{
            borderRadius: 24, padding: "72px 48px", textAlign: "center", position: "relative", overflow: "hidden",
            border: "1px solid rgba(196,176,255,.15)",
            background: "radial-gradient(ellipse at 50% 0%,rgba(196,176,255,.08),transparent 70%),radial-gradient(ellipse at 100% 100%,rgba(126,232,250,.06),transparent 60%),#0d1020",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(196,176,255,.5),rgba(126,232,250,.4),transparent)" }} />
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 14 }}>
              Start improving your<br /><span className="shimmer">career today.</span>
            </h2>
            <p style={{ color: S.muted, fontSize: "1rem", marginBottom: 36 }}>Join 50,000+ professionals who&apos;ve used Resumate Bro to land roles at top companies.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/sign-up" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: "1rem", borderRadius: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>Create Account</Link>
            </div>
          </div>
        </div>
      </section>

      
      <footer style={{ padding: "48px 40px 20px", borderTop: `1px solid ${S.border}`, display: "flex", flexDirection: "column", gap: 26, position: "relative", zIndex: 1 }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 28, maxWidth: 1180, margin: "0 auto", width: "100%" }}>
          <div style={{ maxWidth: 320 }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 8 }}>Resumate Bro</h3>
            <p style={{ color: S.muted, fontSize: "0.9rem", lineHeight: 1.5 }}>AI career intelligence that turns your resume into a data-driven growth path.</p>
          </div>
          {[
            { title: "Product",  links: [["Features","#features"],["How It Works","#how"]] },
            { title: "Company",  links: [["About","#"],["Blog","#"],["Careers","#"]] },
            { title: "Support",  links: [["Help Center","#"],["Contact","#"],["Legal","#"]] },
          ].map(({ title, links }) => (
            <div key={title} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
              <h4 style={{ fontSize: "0.79rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{title}</h4>
              {links.map(([lbl,href]) => (
                <a key={lbl} href={href} style={{ color: S.muted, textDecoration: "none", fontSize: "0.88rem", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = S.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = S.muted)}>{lbl}</a>
              ))}
            </div>
          ))}
        </div>

        
        <div style={{
          maxWidth: 1180, margin: "0 auto", width: "100%",
          border: "1px solid rgba(255,255,255,.12)", background: S.surface,
          padding: "18px 20px", borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Stay on top of job market trends</h4>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", width: "min(100%,520px)" }}>
            <input type="email" placeholder="Enter your email" style={{
              flex: 1, minWidth: 200, background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)", color: S.text,
              padding: "10px 12px", borderRadius: 8,
            }} />
            <button className="btn btn-primary" style={{ padding: "9px 18px", borderRadius: 8, fontSize: "0.875rem", cursor: "pointer" }}>Subscribe</button>
          </div>
          <p style={{ color: S.muted, fontSize: "0.85rem" }}>Get career tips, resume tricks, and AI insights once a week.</p>
        </div>

        
        <div style={{
          maxWidth: 1180, margin: "0 auto", width: "100%",
          borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
          color: S.muted, fontSize: "0.84rem",
        }}>
          <div>Resumate Bro. All rights reserved.</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["Privacy Policy","Terms of Service","Site Map"].map(t => (
              <a key={t} href="#" style={{ color: S.muted, textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = S.text)}
                onMouseLeave={e => (e.currentTarget.style.color = S.muted)}>{t}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
