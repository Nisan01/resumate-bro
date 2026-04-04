"use client";

import { useState, useRef } from "react";

// ── Orb component ──────────────────────────────────────────────────────────────
function Orb({
  size,
  top,
  left,
  right,
  bottom,
  duration,
  delay,
  opacity,
  ring = false,
}: {
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  duration: number;
  delay?: number;
  opacity: number;
  ring?: boolean;
}) {
  const pos: React.CSSProperties = {
    width: size,
    height: size,
    top,
    left,
    right,
    bottom,
    opacity,
    animationDuration: `${duration}s`,
    animationDelay: delay ? `${delay}s` : "0s",
    animationName: "drift",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  };

  if (ring) {
    return (
      <div
        className="absolute rounded-full"
        style={{
          ...pos,
          border: "1.5px solid transparent",
          background:
            "linear-gradient(#080b12,#080b12) padding-box, linear-gradient(135deg,rgba(196,176,255,0.6),rgba(126,232,250,0.6),rgba(255,157,226,0.6)) border-box",
        }}
      />
    );
  }

  return (
    <div
      className="absolute rounded-full"
      style={{
        ...pos,
        background:
          "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55) 0%, rgba(196,176,255,0.35) 15%, rgba(126,232,250,0.25) 35%, rgba(255,157,226,0.2) 55%, rgba(8,11,18,0.1) 75%, transparent 100%)",
        boxShadow:
          "inset 0 0 30px rgba(255,255,255,0.12), inset 2px 2px 12px rgba(255,255,255,0.25), 0 0 60px rgba(180,140,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    />
  );
}

// ── Toggle component ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="relative flex-shrink-0 ml-3 cursor-pointer">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div
        className="relative rounded-full transition-all duration-300"
        style={{
          width: 44,
          height: 24,
          background: checked
            ? "linear-gradient(135deg,#c4b0ff,#7ee8fa)"
            : "rgba(255,255,255,0.1)",
          border: checked ? "none" : "1px solid rgba(255,255,255,0.12)",
          boxShadow: checked ? "0 0 16px rgba(196,176,255,0.4)" : "none",
        }}
      >
        <div
          className="absolute rounded-full transition-all duration-300"
          style={{
            width: 18,
            height: 18,
            background: checked ? "#0a0714" : "rgba(255,255,255,0.5)",
            top: 3,
            left: checked ? 23 : 3,
          }}
        />
      </div>
    </label>
  );
}

// ── ToggleRow component ────────────────────────────────────────────────────────
function ToggleRow({
  title,
  desc,
  checked,
  onChange,
  last = false,
  first = false,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
  last?: boolean;
  first?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: first ? "0 0 14px" : last ? "14px 0 0" : "14px 0",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex-1">
        <div className="text-sm font-medium mb-0.5" style={{ color: "#f0eeff" }}>
          {title}
        </div>
        <div className="text-xs" style={{ color: "rgba(220,215,255,0.45)" }}>
          {desc}
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── SectionCard ────────────────────────────────────────────────────────────────
function SectionCard({
  id,
  icon,
  label,
  desc,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="rounded-2xl p-7"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        scrollMarginTop: 90,
      }}
    >
      <div
        className="flex items-center gap-2.5 mb-6 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(196,176,255,0.10)",
            border: "1px solid rgba(196,176,255,0.22)",
            color: "#c4b0ff",
          }}
        >
          {icon}
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight" style={{ color: "#f0eeff" }}>
            {label}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(220,215,255,0.45)" }}>
            {desc}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Input Field ────────────────────────────────────────────────────────────────
function InputField({
  label,
  type,
  defaultValue,
  icon,
  onInput,
}: {
  label: string;
  type: string;
  defaultValue: string;
  icon: React.ReactNode;
  onInput: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-medium tracking-wide"
        style={{ color: "rgba(220,215,255,0.55)" }}
      >
        {label}
      </label>
      <div className="relative" style={{ maxWidth: 360 }}>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="14"
          height="14"
          fill="none"
          stroke="rgba(220,215,255,0.45)"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
        <input
          type={type}
          defaultValue={defaultValue}
          onInput={onInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full text-sm rounded-xl outline-none pl-9 pr-3.5 py-2.5 transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: focused
              ? "1px solid rgba(196,176,255,0.22)"
              : "1px solid rgba(255,255,255,0.085)",
            color: "#f0eeff",
            fontFamily: "inherit",
            boxShadow: focused ? "0 0 0 3px rgba(196,176,255,0.08)" : "none",
          }}
        />
      </div>
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Settings saved successfully");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState("#c4b0ff");
  const [avatarHovered, setAvatarHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [autoSave, setAutoSave] = useState(true);
  const [versionHistory, setVersionHistory] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [grammarCheck, setGrammarCheck] = useState(true);
  const [atsScore, setAtsScore] = useState(true);
  const [keywordOpt, setKeywordOpt] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [improvementTips, setImprovementTips] = useState(true);
  const [jobMatch, setJobMatch] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const mark = () => setDirty(true);
  const wrapToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    setter(!val);
    mark();
  };

  const showToastMsg = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 3200);
  };

  const saveChanges = () => {
    setDirty(false);
    showToastMsg("Settings saved successfully");
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target?.result as string);
      mark();
    };
    reader.readAsDataURL(file);
  };

  const scrollToSection = (id: string, el: EventTarget & Element) => {
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("nav-active"));
    el.classList.add("nav-active");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const accentSwatches = [
    { grad: "linear-gradient(135deg,#c4b0ff,#7ee8fa)", val: "#c4b0ff" },
    { grad: "linear-gradient(135deg,#7ee8fa,#60c3ee)", val: "#7ee8fa" },
    { grad: "linear-gradient(135deg,#ff9de2,#ff6fa8)", val: "#ff9de2" },
    { grad: "linear-gradient(135deg,#4ade80,#22d3ee)", val: "#4ade80" },
  ];

  const navItems = [
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: "resume",
      label: "Resume Prefs",
      icon: (
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      id: "analysis",
      label: "Analysis",
      icon: (
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: "theme",
      label: "Theme",
      icon: (
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ── Keyframe & global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Soria:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'Soria', sans-serif; }

        @keyframes drift {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); }
          25%  { transform: translateY(-30px) translateX(20px) rotate(90deg); }
          50%  { transform: translateY(-15px) translateX(-15px) rotate(180deg); }
          75%  { transform: translateY(-40px) translateX(10px) rotate(270deg); }
          100% { transform: translateY(0) translateX(0) rotate(360deg); }
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

        .settings-anim {
          animation: fadeInUp 0.5s ease both;
        }

        .nav-item {
          transition: all 0.18s ease;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .nav-active {
          background: rgba(196,176,255,0.10) !important;
          border-color: rgba(196,176,255,0.22) !important;
          color: #c4b0ff !important;
        }

        input[type=color] {
          border: none;
          outline: none;
          background: transparent;
          cursor: pointer;
          width: 150%;
          height: 150%;
          transform: translate(-17%, -17%);
        }

        select option {
          background: #0d1020;
          color: #f0eeff;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(196,176,255,0.2); border-radius: 3px; }
      `}</style>

      {/* ── Scene background ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 15% 20%, rgba(90,60,180,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 85% 10%, rgba(60,140,200,0.2) 0%, transparent 55%),
            radial-gradient(ellipse 50% 60% at 75% 85%, rgba(180,80,160,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 10% 80%, rgba(40,100,190,0.15) 0%, transparent 50%),
            #080b12
          `,
        }}
      />

      {/* ── Orb layer ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Orb size={340} top="-80px" right="8%"           duration={22}        opacity={0.45} />
        <Orb size={200} top="38%"  left="2%"             duration={18} delay={-6}  opacity={0.35} />
        <Orb size={120} bottom="12%" left="45%"          duration={15} delay={-4}  opacity={0.3}  />
        <Orb size={80}  top="14%"  left="42%"            duration={12} delay={-2}  opacity={0.4}  />
        <Orb size={280} top="20%"  right="22%"           duration={28} delay={-10} opacity={0.25} ring />
        <Orb size={180} bottom="25%" left="18%"          duration={20} delay={-7}  opacity={0.2}  ring />
        <Orb size={260} bottom="-60px" right="-40px"     duration={25} delay={-12} opacity={0.28} />
      </div>

      {/* ── Page content ── */}
      <div
        className="relative z-10 max-w-5xl mx-auto settings-anim px-6 pb-20"
        style={{ paddingTop: 40, fontFamily: "'Soria', sans-serif" }}
      >
        {/* Header */}
        <div className="mb-9">
          <div className="flex items-center gap-3 mb-1.5">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <h1
              className="font-bold tracking-tight"
              style={{ fontSize: "clamp(26px,3vw,38px)", color: "#f0eeff", letterSpacing: "-0.03em" }}
            >
              Settings
            </h1>
          </div>
          <p className="text-sm font-light" style={{ color: "rgba(220,215,255,0.45)" }}>
            Manage your profile, preferences, and account configuration.
          </p>
        </div>

        {/* Layout grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "220px 1fr" }}>

          {/* ── Sidebar ── */}
          <aside
            className="rounded-2xl p-2.5 self-start"
            style={{
              position: "sticky",
              top: 82,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
            }}
          >
            {navItems.map((item) => (
              <div
                key={item.id}
                className="nav-item flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium mb-0.5"
                style={{ color: "rgba(220,215,255,0.55)" }}
                onClick={(e) => scrollToSection(item.id, e.currentTarget)}
              >
                <span className="opacity-70 flex-shrink-0">{item.icon}</span>
                {item.label}
              </div>
            ))}

            <div
              className="my-2 mx-1 h-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />

            <div
              className="nav-item flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium"
              style={{ color: "rgba(220,215,255,0.55)" }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="opacity-70">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Account
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="flex flex-col gap-5">

            {/* ── Profile ── */}
            <SectionCard
              id="profile"
              label="Profile Settings"
              desc="Your public identity on Resumate Bro"
              icon={
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            >
              {/* Avatar row */}
              <div className="flex items-center gap-6 flex-wrap mb-7">
                <div
                  className="relative flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer overflow-hidden transition-transform duration-200"
                  style={{
                    width: 72,
                    height: 72,
                    background: avatarSrc
                      ? "transparent"
                      : "linear-gradient(135deg,#c4b0ff,#7ee8fa,#ff9de2)",
                    border: "2px solid rgba(255,255,255,0.1)",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#0a0714",
                    transform: avatarHovered ? "scale(1.02)" : "scale(1)",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={() => setAvatarHovered(true)}
                  onMouseLeave={() => setAvatarHovered(false)}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    "A"
                  )}
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
                    style={{
                      background: "rgba(0,0,0,0.45)",
                      opacity: avatarHovered ? 1 : 0,
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatar}
                />

                <div className="flex-1 min-w-44">
                  <div className="text-sm font-semibold mb-1" style={{ color: "#f0eeff" }}>
                    @alexjohnson
                  </div>
                  <div className="text-xs" style={{ color: "rgba(220,215,255,0.45)" }}>
                    Click the avatar to upload a new photo · JPG, PNG, GIF up to 5MB
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-white/5"
                      style={{
                        background: "transparent",
                        color: "#c4b0ff",
                        border: "1px solid rgba(196,176,255,0.22)",
                        fontFamily: "inherit",
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Photo
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-white/10"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#f0eeff",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontFamily: "inherit",
                      }}
                      onClick={() => { setAvatarSrc(null); mark(); }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Field grid */}
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <InputField
                  label="Username"
                  type="text"
                  defaultValue="alexjohnson"
                  onInput={mark}
                  icon={
                    <>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </>
                  }
                />
                <InputField
                  label="Email Address"
                  type="email"
                  defaultValue="alex@example.com"
                  onInput={mark}
                  icon={
                    <>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </>
                  }
                />
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-150 hover:bg-white/10"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "#f0eeff",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "inherit",
                  }}
                  onClick={() => setShowPwModal(true)}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Change Password
                </button>
              </div>
            </SectionCard>

            {/* ── Resume Preferences ── */}
            <SectionCard
              id="resume"
              label="Resume Preferences"
              desc="Default export settings and template options"
              icon={
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
            >
              <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {[
                  { label: "Default Export Format", opts: ["PDF", "DOCX", "Plain Text"] },
                  { label: "Resume Template", opts: ["Executive Pro", "Modern Minimal", "Creative Edge", "Classic Clean", "Tech Focused"] },
                ].map(({ label, opts }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium tracking-wide" style={{ color: "rgba(220,215,255,0.55)" }}>
                      {label}
                    </label>
                    <div className="relative" style={{ maxWidth: 280 }}>
                      <select
                        onChange={mark}
                        className="w-full text-sm rounded-xl outline-none px-3.5 py-2.5 appearance-none pr-8 transition-all duration-200"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.085)",
                          color: "#f0eeff",
                          fontFamily: "inherit",
                        }}
                      >
                        {opts.map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <div
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          borderLeft: "4px solid transparent",
                          borderRight: "4px solid transparent",
                          borderTop: "5px solid rgba(220,215,255,0.45)",
                          width: 0,
                          height: 0,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <ToggleRow title="Auto-Save Drafts" desc="Automatically save your resume every 30 seconds" checked={autoSave} onChange={() => wrapToggle(setAutoSave, autoSave)} first />
              <ToggleRow title="Version History" desc="Keep track of all resume versions automatically" checked={versionHistory} onChange={() => wrapToggle(setVersionHistory, versionHistory)} last />
            </SectionCard>

            {/* ── Analysis ── */}
            <SectionCard
              id="analysis"
              label="Analysis Settings"
              desc="Control how AI analyzes your resume"
              icon={
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            >
              <ToggleRow title="AI Suggestions" desc="Get real-time AI-powered improvement suggestions" checked={aiSuggestions} onChange={() => wrapToggle(setAiSuggestions, aiSuggestions)} first />
              <ToggleRow title="Grammar Check" desc="Automatically detect and highlight grammar issues" checked={grammarCheck} onChange={() => wrapToggle(setGrammarCheck, grammarCheck)} />
              <ToggleRow title="ATS Compatibility Score" desc="Analyze your resume for applicant tracking system compatibility" checked={atsScore} onChange={() => wrapToggle(setAtsScore, atsScore)} />
              <ToggleRow title="Keyword Optimization" desc="Suggest relevant keywords based on job descriptions" checked={keywordOpt} onChange={() => wrapToggle(setKeywordOpt, keywordOpt)} last />
            </SectionCard>

            {/* ── Notifications ── */}
            <SectionCard
              id="notifications"
              label="Notifications"
              desc="Choose what updates you want to receive"
              icon={
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              }
            >
              <ToggleRow title="Email Alerts" desc="Receive important account and activity alerts via email" checked={emailAlerts} onChange={() => wrapToggle(setEmailAlerts, emailAlerts)} first />
              <ToggleRow title="Resume Improvement Tips" desc="Weekly curated tips to improve your resume quality" checked={improvementTips} onChange={() => wrapToggle(setImprovementTips, improvementTips)} />
              <ToggleRow title="Job Match Alerts" desc="Get notified when jobs matching your profile are posted" checked={jobMatch} onChange={() => wrapToggle(setJobMatch, jobMatch)} />
              <ToggleRow title="Product Updates" desc="Be the first to know about new features" checked={productUpdates} onChange={() => wrapToggle(setProductUpdates, productUpdates)} last />
            </SectionCard>

            {/* ── Theme ── */}
            <SectionCard
              id="theme"
              label="Theme"
              desc="Personalize your Resumate Bro experience"
              icon={
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              }
            >
              <ToggleRow
                title="Dark Mode"
                desc="Use the dark futuristic interface (currently active)"
                checked={darkMode}
                onChange={() => wrapToggle(setDarkMode, darkMode)}
                first
                last
              />

              <div className="pt-4">
                <div
                  className="text-xs font-medium tracking-wide mb-3"
                  style={{ color: "rgba(220,215,255,0.55)" }}
                >
                  Accent Color
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {accentSwatches.map((s) => (
                    <button
                      key={s.val}
                      onClick={() => { setAccentColor(s.val); mark(); }}
                      className="rounded-full transition-all duration-200 cursor-pointer"
                      style={{
                        width: 30,
                        height: 30,
                        background: s.grad,
                        border: accentColor === s.val ? "2px solid white" : "2px solid transparent",
                        transform: accentColor === s.val ? "scale(1.15)" : "scale(1)",
                        boxShadow: accentColor === s.val ? "0 0 12px rgba(255,255,255,0.3)" : "none",
                      }}
                    />
                  ))}
                  <div
                    className="rounded-full overflow-hidden"
                    style={{
                      width: 30,
                      height: 30,
                      border: "2px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => { setAccentColor(e.target.value); mark(); }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

          </div>
        </div>
      </div>

      {/* ── Save bar ── */}
      <div
        className="fixed left-1/2 flex items-center gap-3 rounded-xl px-4 py-3 z-50 transition-all duration-300"
        style={{
          top: 20,
          transform: dirty ? "translate(-50%, 0)" : "translate(-50%, -80px)",
          opacity: dirty ? 1 : 0,
          pointerEvents: dirty ? "auto" : "none",
          background: "#1a1a1a",
          boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
        }}
      >
        <svg width="15" height="15" fill="none" stroke="#c4b0ff" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="text-sm" style={{ color: "#f0eeff" }}>
          Unsaved changes — save to apply
        </span>
        <button
          className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-white/10"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#f0eeff",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "inherit",
          }}
          onClick={() => setDirty(false)}
        >
          Discard
        </button>
        <button
          className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          style={{
            background: "linear-gradient(135deg,#c4b0ff 0%,#7ee8fa 50%,#ff9de2 100%)",
            color: "#0a0714",
            boxShadow: "0 4px 28px rgba(196,176,255,0.30)",
            fontFamily: "inherit",
          }}
          onClick={saveChanges}
        >
          Save Changes
        </button>
      </div>

      {/* ── Toast ── */}
      <div
        className="fixed flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-sm z-50 transition-all duration-300"
        style={{
          top: "50%",
          left: "50%",
          transform: toast
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.9)",
          opacity: toast ? 1 : 0,
          pointerEvents: "none",
          background: "rgba(13,16,32,0.96)",
          border: "1px solid rgba(74,222,128,0.3)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
          color: "#f0eeff",
        }}
      >
        <svg width="15" height="15" fill="none" stroke="#4ade80" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {toastMsg}
      </div>

      {/* ── Delete modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
        >
          <div
            className="rounded-2xl p-8 w-11/12 max-w-sm"
            style={{ background: "#0d1020", border: "1px solid rgba(255,107,107,0.3)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(255,107,107,0.12)",
                border: "1px solid rgba(255,107,107,0.3)",
                color: "#ff6b6b",
              }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="text-lg font-bold mb-2" style={{ color: "#f0eeff" }}>Delete Account?</div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(220,215,255,0.45)" }}>
              This will permanently delete your account, all your resumes, analytics data, and subscription. This action{" "}
              <strong style={{ color: "#f0eeff" }}>cannot be undone.</strong>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-white/10 transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#f0eeff",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "inherit",
                }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150"
                style={{
                  background: "rgba(255,107,107,0.12)",
                  color: "#ff6b6b",
                  border: "1px solid rgba(255,107,107,0.25)",
                  fontFamily: "inherit",
                }}
                onClick={() => setShowDeleteModal(false)}
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Password modal ── */}
      {showPwModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPwModal(false); }}
        >
          <div
            className="rounded-2xl p-8 w-11/12 max-w-sm"
            style={{ background: "#0d1020", border: "1px solid rgba(196,176,255,0.22)" }}
          >
            <div className="text-lg font-bold mb-1" style={{ color: "#f0eeff" }}>Change Password</div>
            <p className="text-xs mb-5" style={{ color: "rgba(220,215,255,0.45)" }}>
              Choose a strong password with at least 8 characters.
            </p>
            <div className="flex flex-col gap-3.5 mb-5">
              {["Current Password", "New Password", "Confirm New Password"].map((ph) => (
                <input
                  key={ph}
                  type="password"
                  placeholder={ph}
                  className="w-full text-sm rounded-xl outline-none px-3.5 py-2.5 transition-all duration-200 focus:border-purple-400/30"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.085)",
                    color: "#f0eeff",
                    fontFamily: "inherit",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-white/10 transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#f0eeff",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "inherit",
                }}
                onClick={() => setShowPwModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                style={{
                  background: "linear-gradient(135deg,#c4b0ff 0%,#7ee8fa 50%,#ff9de2 100%)",
                  color: "#0a0714",
                  fontFamily: "inherit",
                }}
                onClick={() => {
                  setShowPwModal(false);
                  showToastMsg("Password updated successfully");
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
