
"use client";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvatarCard {
  seed: string;
  avatarStyle: string;
  name: string;
  role: string;
  salary: string;
  time: string;
  skills: string;
  score: string;
  colorClass: string;
}

interface Step {
  emoji: string;
  name: string;
  desc: string;
  delay: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const avatarCards: AvatarCard[] = [
  {
    seed: "Aisha+Mensah",
    avatarStyle: "pixel-art",
    name: "Aisha Mensah",
    role: "Junior Dev → Senior Engineer",
    salary: "+40%",
    time: "3 mo",
    skills: "12",
    score: "94",
    colorClass: "fc-green",
  },
  {
    seed: "James+Kirtley",
    avatarStyle: "bottts",
    name: "James Kirtley",
    role: "Graphic Designer → UX Lead",
    salary: "+55%",
    time: "5 mo",
    skills: "8",
    score: "91",
    colorClass: "fc-blue",
  },
  {
    seed: "Keiko+Tanaka",
    avatarStyle: "adventurer",
    name: "Keiko Tanaka",
    role: "Data Analyst → Cloud Architect",
    salary: "+70%",
    time: "8 mo",
    skills: "15",
    score: "97",
    colorClass: "fc-coral",
  },
  {
    seed: "Noah+Alvarez",
    avatarStyle: "micah",
    name: "Noah Alvarez",
    role: "Product Analyst → Product Manager",
    salary: "+62%",
    time: "4 mo",
    skills: "11",
    score: "93",
    colorClass: "fc-purple",
  },
];

const steps: Step[] = [
  {
    emoji: "📤",
    name: "Upload Resume",
    desc: "Drop your PDF or Word doc. We support all formats and instantly parse the content.",
    delay: "0s",
  },
  {
    emoji: "🧠",
    name: "Analyze Skills",
    desc: "Our AI maps every skill, experience, and achievement to industry benchmarks.",
    delay: "0.1s",
  },
  {
    emoji: "💡",
    name: "Receive Recommendations",
    desc: "Get a personalized action plan: roles to target, skills to build, courses to take.",
    delay: "0.2s",
  },
  {
    emoji: "🚀",
    name: "Track Progress",
    desc: "Watch your score and match rate improve as you execute your personalized plan.",
    delay: "0.3s",
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrbLayer() {
  return (
    <div className="orb-layer" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div
        className="orb-ring"
        style={{ width: 280, height: 280, top: "20%", right: "22%", animationDuration: "28s", animationDelay: "-10s", opacity: 0.3 }}
      />
      <div
        className="orb-ring"
        style={{ width: 180, height: 180, bottom: "25%", left: "18%", animationDuration: "20s", animationDelay: "-7s", opacity: 0.25 }}
      />
      <div
        className="orb"
        style={{ width: 260, height: 260, bottom: -60, right: -40, animationDuration: "25s", animationDelay: "-12s", opacity: 0.35 }}
      />
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav id="navbar" className={scrolled ? "scrolled" : ""}>
      <div className="container">
        <div className="nav-inner">
          <a href="#" className="logo">
            <span className="logo-dot" />
            Resumate Bro
          </a>
          <ul className={`nav-links${mobileOpen ? " mobile-open" : ""}`}>
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How It Works</a></li>
            <li><a href="#cta">Pricing</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
          <div className="nav-cta">
            <a href="/sign-in" className="btn btn-ghost">Login</a>
            <a href="/sign-up" className="btn btn-primary">Sign Up</a>
          </div>
          <button
            className="hamburger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual reveal" style={{ transitionDelay: "0.15s" }}>
      <div style={{ position: "relative", padding: "20px 30px 20px 20px" }}>
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="ringGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b0ff" />
              <stop offset="50%" stopColor="#7ee8fa" />
              <stop offset="100%" stopColor="#ff9de2" />
            </linearGradient>
          </defs>
        </svg>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-dot" style={{ background: "var(--accent1)" }} />
            <span className="card-title-text">Resume Analysis</span>
            <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--muted)" }}>Live</span>
          </div>

          <div className="score-ring-wrap">
            <div className="score-ring">
              <svg viewBox="0 0 100 100" width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                <circle className="ring-bg" cx="50" cy="50" r="45" />
                <circle className="ring-fill" cx="50" cy="50" r="45" />
              </svg>
              <div className="score-label">
                <div className="score-num">80</div>
                <div className="score-pct">Score</div>
              </div>
            </div>
          </div>

          <div className="skill-bars">
            {[
              { label: "Python", pct: 92, fill: "fill-green", color: "var(--accent1)" },
              { label: "Machine Learning", pct: 74, fill: "fill-blue", color: "var(--accent3)" },
              { label: "Data Visualization", pct: 61, fill: "fill-coral", color: "var(--accent2)" },
            ].map(({ label, pct, fill, color }) => (
              <div className="skill-bar-row" key={label}>
                <div className="skill-bar-label">
                  <span>{label}</span>
                  <span style={{ color }}>{pct}%</span>
                </div>
                <div className="skill-bar-track">
                  <div className={`skill-bar-fill ${fill}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="float-chip chip-1">
          <span className="chip-icon">✅</span>
          <div>
            <div className="chip-label">Skills Matched</div>
            <div className="chip-val">18 of 22</div>
          </div>
        </div>
        <div className="float-chip chip-2">
          <span className="chip-icon">🎯</span>
          <div>
            <div className="chip-label">Role Fit</div>
            <div className="chip-val">Senior ML Eng</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content reveal">
            <div className="hero-badge">AI-Powered Career Intelligence</div>
            <h1 className="hero-title">
              Transform Your Resume,<br />
              Unlock Your <span className="highlight">Career Potential</span>
            </h1>
            <p className="hero-sub">
              Upload your resume, get instant AI-powered skill analysis, and receive a personalized
              roadmap to your dream role — in seconds.
            </p>
            <div className="hero-actions">
              <a href="#" className="btn btn-primary btn-lg">Get Started Free ↗</a>
              <a href="#how" className="btn btn-ghost btn-lg">See How It Works</a>
            </div>
            <div className="hero-stats">
              {[
                { val: "94%", label: "Match Accuracy" },
                { val: "50K+", label: "Careers Shaped" },
                { val: "3×", label: "Faster Hiring" },
              ].map(({ val, label }) => (
                <div className="stat-item" key={label}>
                  <div className="stat-val">{val}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-tag">What We Offer</div>
          <h2 className="section-title">
            Everything You Need to<br />Land Your Next Role
          </h2>
          <p className="section-sub">
            Intelligent tools that work together to turn your resume into a career accelerator.
          </p>
        </div>
        <div className="features-grid">
          {avatarCards.map((card, i) => (
            <div
              key={card.name}
              className={`feature-card avatar-card ${card.colorClass} reveal`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="avatar-image">
                <img
                  src={`https://api.dicebear.com/6.x/${card.avatarStyle}/svg?seed=${card.seed}`}
                  alt={card.name}
                />
              </div>
              <div className="avatar-name">{card.name}</div>
              <div className="avatar-role">{card.role}</div>
              <div className="avatar-stats">
                {[
                  { val: card.salary, label: "Salary Boost" },
                  { val: card.time, label: "Time to Role" },
                  { val: card.skills, label: "Skills Added" },
                  { val: card.score, label: "Resume Score" },
                ].map(({ val, label }) => (
                  <div className="avatar-stat" key={label}>
                    <div className="val">{val}</div>
                    <div className="label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how">
      <div className="container">
        <div
          className="section-header reveal"
          style={{ textAlign: "center", alignItems: "center", display: "flex", flexDirection: "column" }}
        >
          <div className="section-tag">The Process</div>
          <h2 className="section-title">Four Steps to Career Clarity</h2>
          <p className="section-sub" style={{ textAlign: "center" }}>
            Simple enough to start today. Powerful enough to transform your career.
          </p>
        </div>
        <div className="steps-track">
          {steps.map((step) => (
            <div className="step reveal" key={step.name} style={{ transitionDelay: step.delay }}>
              <div className="step-num">
                <span className="step-emoji">{step.emoji}</span>
              </div>
              <div className="step-name">{step.name}</div>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="cta">
      <div className="container">
        <div className="cta-box reveal">
          <h2 className="cta-title">
            Start improving your<br />
            <span className="highlight">career today.</span>
          </h2>
          <p className="cta-sub">
            Join 50,000+ professionals who've used Resumate Bro to land roles at top companies.
          </p>
          <div className="cta-actions">
            <a href="#" className="btn btn-primary btn-lg">Create Free Account ↗</a>
            <a href="#" className="btn btn-ghost btn-lg">View Demo</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // handle subscription
  };

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Resumate Bro</h3>
          <p>AI career intelligence that turns your resume into a data-driven growth path.</p>
        </div>
        <div className="footer-column">
          <h4>Product</h4>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#cta">Pricing</a>
        </div>
        <div className="footer-column">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Careers</a>
        </div>
        <div className="footer-column">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Contact</a>
          <a href="#">Legal</a>
        </div>
      </div>

      <div className="footer-subscribe">
        <h4>Stay on top of job market trends</h4>
        <form className="subscribe-form" onSubmit={handleSubscribe} aria-label="Signup for newsletter">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Subscribe</button>
        </form>
        <p>Get career tips, resume tricks, and AI insights once a week.</p>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} Resumate Bro. All rights reserved.</div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Site Map</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Soria:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #080b12;
    --bg2:       #0d1020;
    --bg3:       #111827;
    --surface:   rgba(255,255,255,0.04);
    --border:    rgba(255,255,255,0.08);
    --text:      #f0eeff;
    --muted:     rgba(220,215,255,0.45);
    --accent1:   #c4b0ff;
    --accent2:   #ff9de2;
    --accent3:   #7ee8fa;
    --glow1:     rgba(196,176,255,0.15);
    --glow2:     rgba(126,232,250,0.12);
    --font-head: 'Soria', sans-serif;
    --font-body: 'Soria', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
    overflow-x: hidden;
  }

  body::before {
    content: ''; position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 15% 20%, rgba(90,60,180,0.28) 0%, transparent 60%),
      radial-gradient(ellipse 55% 45% at 85% 10%, rgba(60,140,200,0.2)  0%, transparent 55%),
      radial-gradient(ellipse 50% 60% at 75% 85%, rgba(180,80,160,0.18) 0%, transparent 55%),
      radial-gradient(ellipse 40% 35% at 10% 80%, rgba(40,100,190,0.15) 0%, transparent 50%);
    pointer-events: none; z-index: 0;
  }

  body::after {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none; opacity: .5; z-index: 0;
  }

  .orb-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }

  .orb {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%,
      rgba(255,255,255,0.55) 0%, rgba(196,176,255,0.35) 15%,
      rgba(126,232,250,0.25) 35%, rgba(255,157,226,0.2) 55%,
      rgba(8,11,18,0.1) 75%, transparent 100%);
    box-shadow: inset 0 0 30px rgba(255,255,255,0.12), inset 2px 2px 12px rgba(255,255,255,0.25), 0 0 60px rgba(180,140,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    animation: drift linear infinite;
  }
  .orb::after {
    content: ''; position: absolute; top: 12%; left: 18%; width: 30%; height: 18%;
    background: rgba(255,255,255,0.35); border-radius: 50%;
    filter: blur(6px); transform: rotate(-30deg);
  }
  .orb-ring {
    position: absolute; border-radius: 50%;
    border: 1.5px solid transparent;
    background: linear-gradient(var(--bg), var(--bg)) padding-box,
                linear-gradient(135deg, rgba(196,176,255,0.6), rgba(126,232,250,0.6), rgba(255,157,226,0.6)) border-box;
    animation: drift linear infinite;
  }
  .orb-1 { width: 340px; height: 340px; top: -80px; right: 8%; animation-duration: 22s; opacity: .55; }
  .orb-2 { width: 200px; height: 200px; top: 38%; left: 2%; animation-duration: 18s; animation-delay: -6s; opacity: .45; }
  .orb-3 { width: 120px; height: 120px; bottom: 12%; left: 45%; animation-duration: 15s; animation-delay: -4s; opacity: .4; }
  .orb-4 { width: 80px;  height: 80px;  top: 14%; left: 42%; animation-duration: 12s; animation-delay: -2s; opacity: .5; }

  @keyframes drift {
    0%   { transform: translateY(0)    translateX(0)    rotate(0deg);   }
    25%  { transform: translateY(-30px) translateX(20px) rotate(90deg);  }
    50%  { transform: translateY(-15px) translateX(-15px) rotate(180deg);}
    75%  { transform: translateY(-40px) translateX(10px) rotate(270deg); }
    100% { transform: translateY(0)    translateX(0)    rotate(360deg); }
  }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 18px 0;
    border-bottom: 1px solid transparent;
    transition: background 0.4s, border-color 0.4s, backdrop-filter 0.4s;
  }
  nav.scrolled {
    background: rgba(8,12,20,0.82);
    backdrop-filter: blur(18px);
    border-color: var(--border);
  }
  .nav-inner { display: flex; align-items: center; gap: 32px; flex-wrap: nowrap; }

  .logo {
    font-family: var(--font-head); font-size: 1.35rem; font-weight: 800;
    letter-spacing: -0.02em; color: var(--text); text-decoration: none;
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  }
  .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent1); box-shadow: 0 0 10px rgba(196,176,255,0.6); }

  .nav-links { display: flex; gap: 28px; list-style: none; margin-left: auto; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 0.9rem; font-weight: 400; letter-spacing: 0.01em; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }

  .nav-cta { display: flex; gap: 10px; flex-shrink: 0; }

  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--font-body); font-weight: 500; font-size: 0.875rem;
    border-radius: 8px; cursor: pointer; text-decoration: none;
    transition: all 0.2s; white-space: nowrap; border: none;
  }
  .btn-ghost {
    padding: 9px 18px; color: var(--muted);
    background: transparent; border: 1px solid var(--border);
  }
  .btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
  .btn-primary {
    padding: 9px 20px; color: #0a0714;
    background: linear-gradient(135deg, #b49fff 0%, #7ee8fa 50%, #ff9de2 100%);
    border: 1px solid transparent; font-weight: 600;
    box-shadow: 0 0 24px rgba(180,140,255,0.3);
  }
  .btn-primary:hover { filter: brightness(1.08); box-shadow: 0 0 36px rgba(180,140,255,0.5); transform: translateY(-2px); }
  .btn-lg { padding: 14px 32px; font-size: 1rem; border-radius: 10px; }

  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
  .hamburger span { width: 22px; height: 2px; background: var(--muted); border-radius: 2px; transition: all 0.3s; }

  #hero { min-height: 100vh; display: flex; align-items: center; padding: 80px 0; }
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(196,176,255,0.08); border: 1px solid rgba(196,176,255,0.2);
    border-radius: 100px; padding: 6px 14px; font-size: 0.78rem;
    color: var(--accent1); font-weight: 500; letter-spacing: 0.04em; margin-bottom: 24px;
  }
  .hero-badge::before { content: '●'; font-size: 0.5rem; animation: blink 2s ease infinite; }

  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.3;} }

  .hero-title {
    font-family: var(--font-head); font-size: clamp(2.2rem, 4vw, 3.4rem);
    font-weight: 800; line-height: 1.12; letter-spacing: -0.03em; margin-bottom: 20px;
  }
  .hero-title .highlight, .highlight {
    background: linear-gradient(100deg, #c4b0ff 0%, #7ee8fa 50%, #ff9de2 100%);
    background-size: 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; animation: shimmer 5s linear infinite;
  }
  @keyframes shimmer { 0%{background-position:0%;} 100%{background-position:200%;} }

  .hero-sub { color: var(--muted); font-size: 1.05rem; font-weight: 300; line-height: 1.7; margin-bottom: 36px; max-width: 440px; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .hero-stats { margin-top: 48px; display: flex; gap: 36px; }
  .stat-val { font-family: var(--font-head); font-size: 1.6rem; font-weight: 800; color: var(--text); }
  .stat-label { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }

  .hero-visual { position: relative; }
  .dashboard-card {
    background: rgba(255,255,255,0.04); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px; backdrop-filter: blur(12px); position: relative;
  }
  .dashboard-card::before {
    content: ''; position: absolute; inset: -1px; border-radius: 17px;
    background: linear-gradient(135deg, rgba(196,176,255,0.2), rgba(126,232,250,0.1), transparent 60%);
    z-index: -1;
  }
  .card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .card-dot { width: 10px; height: 10px; border-radius: 50%; }
  .card-title-text { font-family: var(--font-head); font-size: 0.9rem; font-weight: 700; }

  .score-ring-wrap { display: flex; justify-content: center; margin-bottom: 20px; }
  .score-ring { position: relative; width: 120px; height: 120px; }
  .ring-bg { fill: none; stroke: var(--border); stroke-width: 8; }
  .ring-fill {
    fill: none; stroke: url(#ringGrad1); stroke-width: 8; stroke-linecap: round;
    stroke-dasharray: 283; stroke-dashoffset: 57; transition: stroke-dashoffset 1.5s ease;
    filter: drop-shadow(0 0 6px rgba(196,176,255,0.6));
  }
  .score-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
  .score-num { font-family: var(--font-head); font-size: 1.5rem; font-weight: 800; }
  .score-pct { font-size: 0.7rem; color: var(--muted); }

  .skill-bars { display: flex; flex-direction: column; gap: 10px; }
  .skill-bar-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--muted); margin-bottom: 5px; }
  .skill-bar-track { height: 5px; background: var(--border); border-radius: 10px; overflow: hidden; }
  .skill-bar-fill { height: 100%; border-radius: 10px; transition: width 1.2s ease; }
  .fill-green { background: linear-gradient(90deg, #c4b0ff, #7ee8fa); box-shadow: 0 0 8px rgba(196,176,255,0.4); }
  .fill-blue  { background: linear-gradient(90deg, #7ee8fa, #b49fff); box-shadow: 0 0 8px rgba(126,232,250,0.4); }
  .fill-coral { background: linear-gradient(90deg, #ff9de2, #c4b0ff); box-shadow: 0 0 8px rgba(255,157,226,0.4); }

  .float-chip {
    position: absolute; background: rgba(13,16,28,0.9);
    border: 1px solid rgba(196,176,255,0.2); border-radius: 12px; padding: 10px 14px;
    font-size: 0.78rem; backdrop-filter: blur(12px); display: flex; align-items: center;
    gap: 8px; white-space: nowrap; box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(196,176,255,0.06);
  }
  .chip-icon { font-size: 1.1rem; }
  .chip-label { color: var(--muted); }
  .chip-val { color: var(--text); font-weight: 600; }
  .chip-1 { top: -18px; left: -30px; animation: floatY 4s ease-in-out infinite; }
  .chip-2 { bottom: 30px; right: -30px; animation: floatY 4s ease-in-out infinite; animation-delay: -2s; }
  @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

  #features { padding: 100px 0; }
  .section-tag { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent1); margin-bottom: 12px; }
  .section-title { font-family: var(--font-head); font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 14px; }
  .section-sub { color: var(--muted); font-size: 1rem; max-width: 480px; }
  .section-header { margin-bottom: 60px; }

  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }

  .feature-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
    padding: 24px; position: relative; overflow: hidden;
    transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
    cursor: default; min-height: 260px; display: grid; grid-template-rows: auto 1fr auto; gap: 14px;
  }
  .feature-card::after {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at top left, var(--card-glow, transparent), transparent 58%);
    pointer-events: none; opacity: 0; transition: opacity 0.4s;
  }
  .feature-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.2); box-shadow: 0 24px 70px rgba(0,0,0,0.35); }
  .feature-card:hover::after { opacity: 1; }

  .avatar-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 22px 18px; min-height: 320px; }
  .avatar-image {
    width: 82px; height: 82px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3); display: grid; place-items: center;
    background: linear-gradient(140deg, rgba(196,176,255,0.25), rgba(126,232,250,0.15));
    box-shadow: 0 8px 22px rgba(0,0,0,0.35); margin: 0 auto; overflow: hidden;
  }
  .avatar-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .avatar-name { font-family: var(--font-head); font-size: 1.05rem; font-weight: 700; color: var(--text); margin-top: 4px; }
  .avatar-role { font-size: 0.82rem; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }

  .avatar-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; width: 100%; margin-top: 10px; }
  .avatar-stat { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 8px; line-height: 1.2; }
  .avatar-stat .val { color: var(--text); font-weight: 700; font-size: 1rem; }
  .avatar-stat .label { color: var(--muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 3px; }

  .fc-green { --card-glow: rgba(196,176,255,0.1); }
  .fc-blue  { --card-glow: rgba(126,232,250,0.1); }
  .fc-coral { --card-glow: rgba(255,157,226,0.1); }
  .fc-purple{ --card-glow: rgba(196,176,255,0.1); }

  #how { padding: 100px 0; background: linear-gradient(180deg, transparent, rgba(13,18,32,0.6) 30%, rgba(13,18,32,0.6) 70%, transparent); }
  .steps-track { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
  .steps-track::before {
    content: ''; position: absolute; top: 34px;
    left: calc(12.5% + 16px); right: calc(12.5% + 16px); height: 1px;
    background: linear-gradient(90deg, rgba(196,176,255,0.5), rgba(126,232,250,0.4), rgba(255,157,226,0.3));
    opacity: 0.4;
  }
  .step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 16px; position: relative; }
  .step-num {
    width: 68px; height: 68px; border-radius: 50%; border: 1px solid var(--border);
    background: var(--bg2); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-head); font-size: 1.4rem; font-weight: 800; margin-bottom: 20px;
    position: relative; z-index: 1; transition: all 0.3s;
  }
  .step:hover .step-num { border-color: var(--accent1); box-shadow: 0 0 24px rgba(196,176,255,0.3); background: rgba(196,176,255,0.08); color: var(--accent1); }
  .step-emoji { font-size: 1.6rem; }
  .step-name { font-family: var(--font-head); font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; }
  .step-desc { color: var(--muted); font-size: 0.82rem; line-height: 1.6; }

  #cta { padding: 100px 0; }
  .cta-box {
    border-radius: 24px; padding: 72px 48px; text-align: center; position: relative; overflow: hidden;
    border: 1px solid rgba(196,176,255,0.15);
    background: radial-gradient(ellipse at 50% 0%, rgba(196,176,255,0.08) 0%, transparent 70%),
                radial-gradient(ellipse at 100% 100%, rgba(126,232,250,0.06) 0%, transparent 60%),
                var(--bg2);
  }
  .cta-box::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(196,176,255,0.5), rgba(126,232,250,0.4), transparent);
  }
  .cta-title { font-family: var(--font-head); font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 14px; }
  .cta-sub { color: var(--muted); font-size: 1rem; margin-bottom: 36px; }
  .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  footer { padding: 48px 0 20px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 26px; position: relative; z-index: 1; }
  .footer-inner { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 28px; width: 100%; max-width: 1180px; margin: 0 auto; }
  .footer-brand { max-width: 320px; }
  .footer-brand h3 { font-family: var(--font-head); font-size: 1.05rem; font-weight: 800; margin-bottom: 8px; color: var(--text); }
  .footer-brand p { color: var(--muted); font-size: 0.9rem; line-height: 1.5; }
  .footer-column { min-width: 140px; display: flex; flex-direction: column; gap: 8px; }
  .footer-column h4 { font-size: 0.79rem; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .footer-column a, .footer-links a { display: block; color: var(--muted); text-decoration: none; font-size: 0.88rem; transition: color 0.2s ease; }
  .footer-column a:hover, .footer-links a:hover { color: var(--text); }
  .footer-links { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; justify-content: center; }

  .footer-subscribe {
    width: 100%; max-width: 1180px; margin: 0 auto 22px;
    border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04);
    padding: 18px 20px; border-radius: 14px; display: flex;
    align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  }
  .footer-subscribe h4 { font-size: 0.95rem; font-weight: 700; color: var(--text); margin: 0; }
  .subscribe-form { display: flex; width: min(100%, 520px); gap: 10px; flex-wrap: wrap; align-items: center; }
  .subscribe-form input { flex: 1; min-width: 200px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: var(--text); padding: 10px 12px; border-radius: 8px; outline: none; font-family: var(--font-body); }
  .subscribe-form input:focus { border-color: var(--accent1); box-shadow: 0 0 0 3px rgba(196,176,255,0.2); }

  .footer-bottom {
    width: 100%; max-width: 1180px; margin: 0 auto;
    border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
    color: var(--muted); font-size: 0.84rem;
  }

  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  @media (max-width: 860px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .hero-visual { display: none; }
    .steps-track { grid-template-columns: 1fr 1fr; gap: 36px; }
    .steps-track::before { display: none; }
  }
  @media (max-width: 640px) {
    .nav-links { display: none; }
    .nav-links.mobile-open {
      display: flex; flex-direction: column; position: absolute;
      top: 70px; left: 0; right: 0; background: rgba(8,12,20,0.97);
      padding: 20px 24px; gap: 16px; backdrop-filter: blur(20px); z-index: 99;
    }
    .hamburger { display: flex; margin-left: auto; }
    .nav-cta .btn-ghost { display: none; }
    .steps-track { grid-template-columns: 1fr; }
    .cta-box { padding: 48px 24px; }
    footer { flex-direction: column; text-align: center; }
    .footer-links { justify-content: center; }
  }
`;

// ─── Root Component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  useScrollReveal();

  return (
    <>
      <style>{styles}</style>
      <OrbLayer />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
