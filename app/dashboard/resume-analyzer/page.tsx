import { ResumeAnalyzerView } from "@/components/resume-analyzer/ResumeAnalyzerView";

export default function ResumeAnalyzerPage() {
  return <ResumeAnalyzerView />;
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, UploadCloud, CheckCircle, Shield, Zap, Layout, 
  Type, Target, Lightbulb, TrendingUp, ArrowLeft, Download, 
  RefreshCw, FileText, X 
} from 'lucide-react';
import './index.css';

/* ==================== BACKGROUND COMPONENTS ==================== */

const MeshBackground: React.FC = () => <div id="scene" />;

const Orbs: React.FC = () => (
  <div className="orb-layer" aria-hidden="true">
    <div className="orb orb-1"></div>
    <div className="orb orb-2"></div>
    <div className="orb orb-3"></div>
    <div className="orb orb-4"></div>
    <div className="orb orb-5"></div>
    <div className="orb-ring orb-ring-large"></div>
    <div className="orb-ring orb-ring-small"></div>
  </div>
);

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    type Particle = {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
    };
    let particles: Particle[] = [];
    let animationFrameId: number;
    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const createParticles = (count = 50) => {
      const colors = ['#c4b0ff', '#7ee8fa', '#ff9de2', '#7c3aed'];
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        particles.forEach((o) => {
          const dx = p.x - o.x; const dy = p.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = p.color; ctx.globalAlpha = (1 - dist / 120) * p.opacity * 0.3;
            ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(o.x, o.y); ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    setupCanvas(); createParticles(); animate();
    window.addEventListener('resize', setupCanvas);
    return () => { window.removeEventListener('resize', setupCanvas); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas id="particleCanvas" ref={canvasRef} />;
};

/* ==================== LAYOUT COMPONENTS ==================== */

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-brand">
        <div className="logo-icon"><Sparkles size={16} fill="currentColor" /></div>
        <span>Resumate<span className="brand-accent">Bro</span></span>
      </div>
      <ul className="nav-links">
        <li><a href="#features" className="nav-link" onClick={() => scrollToSection('#features')}>Features</a></li>
        <li><a href="#how-it-works" className="nav-link" onClick={() => scrollToSection('#how-it-works')}>How It Works</a></li>
        <li><a href="#stats" className="nav-link" onClick={() => scrollToSection('#stats')}>Stats</a></li>
      </ul>
      <div className="nav-actions">
        <button className="btn-ghost">Sign In</button>
        <button className="btn-primary" onClick={() => scrollToSection('#uploadCard')}>Get Started</button>
      </div>
    </nav>
  );
};

/* ==================== HERO COMPONENTS ==================== */

const Features: React.FC = () => (
  <div className="features-list" id="features">
    <div className="feature-item">
      <div className="feature-icon-wrap icon-pink"><CheckCircle size={18} /></div>
      <div className="feature-text">
        <span className="feature-title">AI Resume Scoring & Skill Gap Analysis</span>
        <span className="feature-desc">Get an instant score with actionable insights on what to improve</span>
      </div>
    </div>
    <div className="feature-item">
      <div className="feature-icon-wrap icon-purple"><Shield size={18} /></div>
      <div className="feature-text">
        <span className="feature-title">Personalized Career Roadmap</span>
        <span className="feature-desc">AI-curated step-by-step plan tailored to your dream role</span>
      </div>
    </div>
    <div className="feature-item">
      <div className="feature-icon-wrap icon-blue"><Zap size={18} /></div>
      <div className="feature-text">
        <span className="feature-title">Real-Time Job Match Recommendations</span>
        <span className="feature-desc">Discover perfectly matched job listings updated in real-time</span>
      </div>
    </div>
  </div>
);

const Stats: React.FC = () => (
  <div className="stats-grid" id="stats">
    <div className="stat-card"><div className="stat-number">94%</div><div className="stat-label">Match Accuracy</div></div>
    <div className="stat-card"><div className="stat-number">50K+</div><div className="stat-label">Careers Unlocked</div></div>
    <div className="stat-card"><div className="stat-number">3×</div><div className="stat-label">Faster Interviews</div></div>
  </div>
);

const UploadCard: React.FC<{ onAnalyze: () => void }> = ({ onAnalyze }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processFile = (selectedFile: File) => {
    const validTypes = ['.pdf', '.docx', '.doc'];
    const extension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(extension)) { alert('Please upload a PDF or DOCX file'); return; }
    if (selectedFile.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
    setFile(selectedFile);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) { progress = 100; clearInterval(interval); }
      setUploadProgress(progress);
    }, 200);
  };
  return (
    <div className="upload-card" id="uploadCard">
      <div className="card-glow"></div>
      <div className="card-header"><h2 className="card-title">Analyze Your Resume</h2><p className="card-subtitle">Drop your resume and let AI do the magic</p></div>
      {!file ? (
        <div className={`drop-zone ${isDragOver ? 'drag-over' : ''}`} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]); }} role="button" tabIndex={0}>
          <div className="drop-icon-wrap">
            <UploadCloud size={44} className="drop-icon" stroke="url(#dropGrad)" />
            <svg width="0" height="0"><defs><linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c4b0ff"/><stop offset="50%" stopColor="#7ee8fa"/><stop offset="100%" stopColor="#ff9de2"/></linearGradient></defs></svg>
          </div>
          <p className="drop-title">Drag & Drop Your Resume</p><p className="drop-subtitle">or click to browse files</p>
          <div className="format-tags"><span className="format-tag">PDF</span><span className="format-tag">DOCX</span><span className="format-tag">DOC</span></div>
          <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files?.length) processFile(e.target.files[0]); }} accept=".pdf,.docx,.doc" hidden />
        </div>
      ) : (
        <div className="file-info">
          <div className="file-info-inner"><FileText size={16} color="var(--accent1)" /><span className="file-name-text">{file.name}</span><button className="remove-file" aria-label="Remove file" onClick={(e) => { e.stopPropagation(); setFile(null); setUploadProgress(0); }}> <X size={16} /> </button></div>
          {/* eslint-disable-next-line react/style-prop-object */}
          <div className="upload-progress"><div className="progress-bar" style={{ '--progress-width': `${uploadProgress}%` } as React.CSSProperties}></div></div>
        </div>
      )}
      <div className="divider"><span className="divider-line"></span><span className="divider-text">Quick Sign In</span><span className="divider-line"></span></div>
      <div className="social-login">
        <button className="social-btn"><img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="G" width="15" /> Google</button>
        <button className="social-btn"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GH" width="15" /> GitHub</button>
      </div>
      <button className="btn-analyze" onClick={() => file && uploadProgress === 100 && onAnalyze()} disabled={!file || uploadProgress < 100}><span>Analyze My Resume</span><Zap size={16} fill="currentColor" /></button>
      <p className="card-footer-text"><Shield size={11} /> Your data is 100% secure and never stored</p>
    </div>
  );
};

/* ==================== ANALYSIS COMPONENTS ==================== */

const BreakdownItem: React.FC<{ label: string; value: number; delay: number }> = ({ label, value, delay }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { const timer = setTimeout(() => setWidth(value), delay * 1000); return () => clearTimeout(timer); }, [value, delay]);
  return (
    <div className="breakdown-item">
      <span className="breakdown-label">{label}</span>
      {/* eslint-disable-next-line react/style-prop-object */}
      <div className="breakdown-bar"><div className="breakdown-fill" style={{ '--breakdown-width': `${width}%` } as React.CSSProperties}></div></div>
      <span className="breakdown-value">{value}%</span>
    </div>
  );
};

const ScoreSection: React.FC<{ score: number }> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    if (score > 0) {
      let cur = 0; const interval = setInterval(() => { cur += score / 50; if (cur >= score) { cur = score; clearInterval(interval); } setAnimatedScore(Math.round(cur)); }, 20);
      return () => clearInterval(interval);
    }
  }, [score]);
  return (
    <div className="score-section">
      <div className="score-card">
        <div className="score-circle">
          <svg className="score-svg" viewBox="0 0 260 260">
            <defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c4b0ff"/><stop offset="50%" stopColor="#7ee8fa"/><stop offset="100%" stopColor="#ff9de2"/></linearGradient></defs>
            <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
            <circle className="score-ring" cx="130" cy="130" r="120" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeDasharray={754} strokeDashoffset={754 * (1 - score / 100)} strokeLinecap="round" transform="rotate(-90 130 130)"/>
          </svg>
          <div className="score-content"><div className="score-number">{animatedScore}</div><div className="score-label">/ 100</div></div>
        </div>
        <div className="score-breakdown">
          <h3 className="breakdown-title">Score Breakdown</h3>
          <BreakdownItem label="Content Quality" value={78} delay={0.5} /><BreakdownItem label="Formatting" value={85} delay={0.7} /><BreakdownItem label="Skills Relevance" value={72} delay={0.9} /><BreakdownItem label="Experience Impact" value={65} delay={1.1} /><BreakdownItem label="ATS Optimization" value={90} delay={1.3} />
        </div>
      </div>
    </div>
  );
};

const AnalysisGrid: React.FC = () => {
  const data = [
    { title: 'Clarity & Structure', score: '8.5/10', feedback: 'Good organization and hierarchy. Consider more concise formatting.', icon: <Layout size={22} /> },
    { title: 'ATS Compatibility', score: '8/10', feedback: 'Excellent ATS-friendly format. Add more standard keywords.', icon: <CheckCircle size={22} /> },
    { title: 'Grammar & Language', score: '9/10', feedback: 'Professional tone. Minor improvements in consistency.', icon: <Type size={22} /> },
    { title: 'Industry Relevance', score: '7.5/10', feedback: 'Good alignment. Add more industry-specific keywords.', icon: <Zap size={22} /> },
    { title: 'Achievement Impact', score: '8/10', feedback: 'Strong metrics. Use more quantifiable results.', icon: <Target size={22} /> },
  ];
  return (
    <div className="analysis-grid">
      {data.map((item, idx) => (
        <div key={idx} className="analysis-card">
          <div className="analysis-icon">{item.icon}</div>
          <h3 className="analysis-title">{item.title}</h3><p className="analysis-score">{item.score}</p><p className="analysis-feedback">{item.feedback}</p>
        </div>
      ))}
    </div>
  );
};

const Improvements: React.FC = () => {
  const [activeTab, setActiveTab] = useState('header');
  const content: Record<string, React.ReactElement> = {
    header: <div className="improvement-item"><div className="improvement-header"><span className="improvement-tag weak">Weak</span><h4>Professional Summary</h4></div><p className="improvement-current"><strong>Current:</strong> Experienced professional...</p><p className="improvement-suggestion"><strong>Suggested:</strong> Results-driven professional with 5+ years...</p></div>,
    skills: <div className="improvement-item"><div className="improvement-header"><span className="improvement-tag needs-work">Needs Work</span><h4>Technical Skills Organization</h4></div><p className="improvement-current"><strong>Current:</strong> Skills listed without categorization...</p><p className="improvement-suggestion"><strong>Suggested:</strong> Organize skills by category (Languages, Frameworks, Tools)...</p></div>,
    experience: <div className="improvement-item"><div className="improvement-header"><span className="improvement-tag weak">Weak</span><h4>Bullet Point Format</h4></div><p className="improvement-current"><strong>Current:</strong> "Worked on various projects..."</p><p className="improvement-suggestion"><strong>Suggested:</strong> "Led development of microservices architecture..."</p><p className="improvement-hint">💡 Use the STAR method: Situation, Task, Action, Result.</p></div>,
    projects: <div className="improvement-item"><div className="improvement-header"><span className="improvement-tag warning">Add More</span><h4>Projects Section</h4></div><p className="improvement-suggestion">Add 2–3 featured projects with measurable impact and tech stack.</p></div>,
    education: <div className="improvement-item"><div className="improvement-header"><span className="improvement-tag good">Good</span><h4>Education Section</h4></div><p className="improvement-suggestion">Your education formatting is solid. Consider adding relevant coursework.</p></div>,
  };
  return (
    <section className="improvements-section">
      <h2 className="section-heading">Improvement <span className="gradient-text">Suggestions</span></h2>
      <div className="improvement-tabs">{['header','skills','experience','projects','education'].map(t => <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}</div>
      <div className="tab-content active">{content[activeTab]}</div>
    </section>
  );
};

const CareerPaths: React.FC = () => (
  <section className="career-section">
    <h2 className="section-heading">Suggested <span className="gradient-text">Career Paths</span></h2>
    <div className="career-grid">
      {[ {r:1, t:'Senior Software Engineer', w:'Strong technical background.', i:['Tech Giants','Startups'] }, {r:2, t:'Full-Stack Developer', w:'Expertise across front-end/back-end.', i:['SaaS','E-commerce'] }, {r:3, t:'DevOps Architect', w:'Infrastructure knowledge is strong.', i:['Enterprise','FinTech'] } ].map(c => (
        <div key={c.r} className="career-card"><div className="career-rank">{c.r}</div><h3 className="career-title">{c.t}</h3><p className="career-why"><strong>Why:</strong> {c.w}</p><div className="career-industries">{c.i.map(ind => <span key={ind} className="industry-tag">{ind}</span>)}</div></div>
      ))}
    </div>
  </section>
);

const Roadmap: React.FC = () => (
  <section className="roadmap-section">
    <h2 className="section-heading">Your 6-Month <span className="gradient-text">Career Roadmap</span></h2>
    <div className="roadmap-timeline">
      {[ {t:'Month 1–2', i:[{ic:'📚', t:'Skills', d:['System Design','Microservices']},{ic:'🛠️', t:'Tools', d:['Docker','K8s']}]}, {t:'Month 3–4', i:[{ic:'🏅', t:'Certs', d:['AWS Solutions Architect']},{ic:'💻', t:'Projects', d:['Microservices App']}]}, {t:'Month 5–6', i:[{ic:'🎯', t:'Action', d:['Open Source','Job Hunt']}]} ].map((step, idx) => (
        <div key={idx} className="roadmap-month"><div className="month-header"><div className="month-dot"></div><h3>{step.t}</h3></div><div className="month-content">{step.i.map((item, iidx) => (<div key={iidx} className="roadmap-item"><span className="roadmap-icon">{item.ic}</span><div><h4>{item.t}</h4><ul>{item.d.map((d, didx) => <li key={didx}>{d}</li>)}</ul></div></div>))}</div></div>
      ))}
    </div>
  </section>
);

const Keywords: React.FC = () => (
  <section className="keywords-section">
    <h2 className="section-heading">ATS-Optimized <span className="gradient-text">Keywords</span></h2><p className="keywords-subtitle">Add these keywords to improve your ATS ranking:</p>
    <div className="keywords-grid">{['Full Stack','System Design','Cloud','Microservices','K8s','DevOps','AWS','Docker','Leadership','Agile','Python','React'].map((kw, idx) => <div key={idx} className="keyword-tag">{kw}</div>)}</div>
  </section>
);

/* ==================== FOOTER COMPONENTS ==================== */

const HowItWorks: React.FC = () => (
  <section className="how-it-works" id="how-it-works">
    <div className="section-container">
      <div className="section-badge">Simple Process</div><h2 className="section-heading">How It <span className="gradient-text">Works</span></h2><p className="section-subtext">Get your career analysis in three simple steps</p>
      <div className="steps-grid">
        <div className="step-card"><div className="step-number">01</div><div className="step-icon-wrap"><UploadCloud size={26} /></div><h3 className="step-title">Upload Resume</h3><p className="step-desc">Drag & drop your PDF/DOCX file</p></div>
        <div className="step-connector"><div className="connector-line"></div><div className="connector-dot"></div></div>
        <div className="step-card"><div className="step-number">02</div><div className="step-icon-wrap"><Lightbulb size={26} /></div><h3 className="step-title">AI Analysis</h3><p className="step-desc">Our AI engine scans and scores your resume</p></div>
        <div className="step-connector"><div className="connector-line"></div><div className="connector-dot"></div></div>
        <div className="step-card"><div className="step-number">03</div><div className="step-icon-wrap"><TrendingUp size={26} /></div><h3 className="step-title">Get Roadmap</h3><p className="step-desc">Receive a personalized plan</p></div>
      </div>
    </div>
  </section>
);

/* ==================== MAIN APP ==================== */

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => setTotalScore(82), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing]);

  return (
    <div className="app-container">
      <MeshBackground /><Orbs /><ParticleBackground /><Navbar />
      {!isAnalyzing ? (
        <>
          <main className="hero-section">
            <div className="hero-container">
              <section className="left-panel"><div className="badge-pill"><span className="badge-dot"></span>AI Career Intelligence</div><h1 className="hero-heading">Unlock Your<br/><span className="gradient-text">Career Potential</span><br/>with AI</h1><p className="hero-subtext">Upload your resume and let our engine analyze your skills.</p><Features /><Stats /></section>
              <section className="right-panel"><UploadCard onAnalyze={() => setIsAnalyzing(true)} /></section>
            </div>
          </main>
          <HowItWorks />
        </>
      ) : (
        <section className="analysis-section">
          <div className="section-container">
            <button className="back-button" onClick={() => setIsAnalyzing(false)}><ArrowLeft size={18} /> Back</button>
            <ScoreSection score={totalScore} />
            <h2 className="section-heading">Resume <span className="gradient-text">Analysis</span></h2><AnalysisGrid /><Improvements />
            <h2 className="section-heading">Missing <span className="gradient-text">Elements</span></h2>
            <div className="missing-grid">
              <div className="missing-card">📊 <h4>Metrics</h4><p>Add numbers.</p></div>
              <div className="missing-card">💼 <h4>Certs</h4><p>Add industry certs.</p></div>
              <div className="missing-card">🔗 <h4>Portfolio</h4><p>Include links.</p></div>
            </div>
            <CareerPaths /><Roadmap /><Keywords />
            <div className="action-buttons">
              <button className="btn-primary" onClick={() => alert('Downloading report...')}> <Download size={16} /> Download</button>
              <button className="btn-ghost" onClick={() => setIsAnalyzing(false)}><RefreshCw size={16} /> New Analysis</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default App;