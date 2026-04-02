
"use client";
import { useEffect, useState } from "react";
import "./styles/landing.css";
import Link from 'next/link'
import OrbLayer from "./Orb/Orb";


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
            <Link href="/sign-in" className="btn btn-ghost">Login</Link>
            <Link href="/sign-up" className="btn btn-primary">Sign Up</Link>
    
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
        <div>© 2024 Resumate Bro. All rights reserved.</div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Site Map</a>
        </div>
      </div>
    </footer>
  );
}





export default function LandingPage() {
  useScrollReveal();

  return (
    <>
    <div className="landing-root">
      <OrbLayer />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
    </>
  );
}
