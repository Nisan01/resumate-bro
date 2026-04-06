"use client";

import { useState, useRef, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { generateStylizedPdf } from "@/utils/pdf/createPdfStylized";
import { useRouter } from "next/navigation";
import AvatarSelector from "@/app/(auth)/_components/avatar"; // adjust import path as needed


interface ResumeStats {
  resumeCount: number;
  totalTokens: number;
}

function calculatePrice(tokens: number): number {
  const costPerThousand = 0.002;
  const price = (tokens / 1000) * costPerThousand;
  return parseFloat(price.toFixed(2));
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({
  open,
  onClose,
  children,
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-2xl p-7 w-11/12"
        style={{
          maxWidth: 420,
          background: "#0d1020",
          border: danger ? "1px solid rgba(255,107,107,0.30)" : "1px solid rgba(196,176,255,0.22)",
          animation: "fadeInUp 0.3s ease both",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────────────
function BtnGhost({
  children,
  onClick,
  sm,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  sm?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-xl font-semibold cursor-pointer transition-all duration-150 hover:bg-white/10 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        padding: sm ? "7px 14px" : "9px 16px",
        fontSize: sm ? 12 : 13,
        background: "rgba(255,255,255,0.05)",
        color: "#f0eeff",
        border: "1px solid rgba(255,255,255,0.085)",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function BtnDanger({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-xl font-semibold cursor-pointer transition-all duration-150 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        padding: "7px 14px",
        fontSize: 12,
        background: "rgba(255,107,107,0.12)",
        color: "#ff6b6b",
        border: "1px solid rgba(255,107,107,0.25)",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function BtnGrad({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-xl font-semibold cursor-pointer transition-all duration-150 hover:brightness-110 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        padding: "7px 14px",
        fontSize: 12,
        background: "linear-gradient(135deg,#c4b0ff 0%,#7ee8fa 50%,#ff9de2 100%)",
        color: "#0a0714",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

// ── Section Card ───────────────────────────────────────────────────────────────
function SectionCard({
  icon,
  label,
  desc,
  children,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: danger ? "rgba(255,60,60,0.03)" : "rgba(255,255,255,0.03)",
        border: danger ? "1px solid rgba(255,107,107,0.15)" : "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className="flex items-center gap-2.5 mb-5 pb-4"
        style={{ borderBottom: danger ? "1px solid rgba(255,107,107,0.09)" : "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: danger ? "rgba(255,107,107,0.10)" : "rgba(196,176,255,0.10)",
            border: danger ? "1px solid rgba(255,107,107,0.25)" : "1px solid rgba(196,176,255,0.22)",
            color: danger ? "#ff6b6b" : "#c4b0ff",
          }}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ color: "#f0eeff" }}>{label}</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(220,215,255,0.40)" }}>{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Data Row ───────────────────────────────────────────────────────────────────
function DataRow({
  title,
  desc,
  children,
  last = false,
  danger = false,
}: {
  title: string;
  desc?: string;
  children?: React.ReactNode;
  last?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between flex-wrap gap-3"
      style={{
        padding: last ? "14px 0 0" : "14px 0",
        borderBottom: last ? "none" : `1px solid ${danger ? "rgba(255,107,107,0.07)" : "rgba(255,255,255,0.04)"}`,
      }}
    >
      <div className="flex-1" style={{ minWidth: 200 }}>
        <div className="text-sm font-medium mb-0.5" style={{ color: danger ? "#ff6b6b" : "#f0eeff" }}>
          {title}
        </div>
        {desc && (
          <div className="text-xs leading-relaxed" style={{ color: "rgba(220,215,255,0.42)", maxWidth: 420 }}>
            {desc}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}


function UsageStatCard({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  const [dashOpacities, setDashOpacities] = useState<number[]>([]);

  useEffect(() => {
    const opacities = Array.from({ length: 8 }, () => 0.08 + Math.random() * 0.35);
    setDashOpacities(opacities);
  }, []);

  return (
    <div
      className="flex-1 rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: accent ? "rgba(126,232,250,0.05)" : "rgba(196,176,255,0.05)",
        border: accent ? "1px solid rgba(126,232,250,0.13)" : "1px solid rgba(196,176,255,0.13)",
        minWidth: 0,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: accent ? "rgba(126,232,250,0.12)" : "rgba(196,176,255,0.12)",
            color: accent ? "#7ee8fa" : "#c4b0ff",
          }}
        >
          {icon}
        </div>
        <span className="text-xs font-medium" style={{ color: "rgba(220,215,255,0.45)" }}>{label}</span>
      </div>

      <div>
        <div
          className="font-bold leading-none tracking-tight"
          style={{
            fontSize: 28,
            background: accent
              ? "linear-gradient(135deg,#7ee8fa,#c4b0ff)"
              : "linear-gradient(135deg,#c4b0ff,#ff9de2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {value}
        </div>
        <div className="mt-1.5 text-xs" style={{ color: "rgba(220,215,255,0.32)" }}>
          {sub}
        </div>
      </div>

      <div className="flex gap-1 mt-auto pt-1">
        {dashOpacities.length
          ? dashOpacities.map((o, i) => (
              <div
                key={i}
                className="rounded-full flex-1"
                style={{
                  height: 3,
                  background: accent
                    ? `rgba(126,232,250,${o})`
                    : `rgba(196,176,255,${o})`,
                }}
              />
            ))
          : Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-full flex-1" style={{ height: 3 }} />
            ))}
      </div>
    </div>
  );
}
// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="13"
      height="13"
      fill="none"
      viewBox="0 0 24 24"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AccountPage() {

  const { user, logout } = useUser();

  const [modals, setModals] = useState<Record<string, boolean>>({});
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState(false);

  // Avatar state
  const [avatarSrc, setAvatarSrc] = useState<string | null>(user?.avatarUrl ?? null);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [stats, setStats] = useState<ResumeStats>({ resumeCount: 0, totalTokens: 0 });
  const [loading, setLoading] = useState(false);

  const openModal = (key: string) => setModals((m) => ({ ...m, [key]: true }));
  const closeModal = (key: string) => setModals((m) => ({ ...m, [key]: false }));

  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/get-resume-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching resume stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // ── Export Data ──────────────────────────────────────────────────────────────
  const handleExportData = async () => {
    if (!user?.id) return toast.error("User not found.");
    setLoadingExport(true);
    try {
      const response = await fetch("/api/auth/export-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) throw new Error("Export failed");
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const res = await response.json();
        const safeName = (user?.name || user?.id || "user")
          .replace(/\s+/g, "_")
          .replace(/[^\w\-]/g, "");
        await generateStylizedPdf(res.data, `${safeName}_Report.pdf`);
      } else {
        throw new Error("Unexpected response format");
      }
      toast.success("Data exported successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setLoadingExport(false);
    }
  };

  // ── Avatar via AvatarSelector ────────────────────────────────────────────────
  const handleAvatarSelect = async (url: string) => {
    if (!user?.id) return;
    setLoadingAvatar(true);
    try {
      const res = await fetch("/api/auth/update-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url, userId: user.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setAvatarSrc(url);
      toast.success("Avatar updated successfully.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update avatar.");
    } finally {
      setLoadingAvatar(false);
    }
  };

  // ── Password ─────────────────────────────────────────────────────────────────
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!user?.id) return toast.error("User not found.");
    setLoadingPassword(true);
    try {
      const res = await fetch("/api/auth/update-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, userId: user.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      closeModal("password");
      toast.success("Password updated successfully.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update password.");
    } finally {
      setLoadingPassword(false);
    }
  };

  // ── Reset Data ───────────────────────────────────────────────────────────────
  const handleResetData = async () => {
    if (!user?.id) { toast.error("User not found."); return; }
    setLoadingReset(true);
    try {
      const response = await fetch("/api/reset-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) {
        let errorMsg = "Reset failed";
        try { const data = await response.json(); if (data?.message) errorMsg = data.message; } catch {}
        throw new Error(errorMsg);
      }
      closeModal("reset");
      toast.success("All data has been reset.");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset data.");
    } finally {
      setLoadingReset(false);
    }
  };

  // ── Delete Account ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!user?.id) { toast.error("User not found."); return; }
    if (deleteInput !== "DELETE") {
      setDeleteError(true);
      toast.error('You must type "DELETE" to confirm.');
      return;
    }
    setDeleteError(false);
    setLoadingDelete(true);
    try {
      const response = await fetch("/api/auth/remove-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) {
        let errorMsg = "Account deletion failed";
        try { const data = await response.json(); if (data?.message) errorMsg = data.message; } catch {}
        throw new Error(errorMsg);
      }
      closeModal("delete");
      toast.success("Account deleted successfully.");
      logout();
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account.");
    } finally {
      setLoadingDelete(false);
    }
  };

  const aiCost = calculatePrice(stats.totalTokens);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .account-page { animation: fadeInUp 0.45s ease both; }
      `}</style>

      {/* Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 15%, rgba(180,80,160,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 80% 15%, rgba(90,60,180,0.24) 0%, transparent 55%),
            radial-gradient(ellipse 50% 55% at 70% 90%, rgba(60,140,200,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 5%  75%, rgba(40,100,190,0.15) 0%, transparent 50%),
            #080b12
          `,
        }}
      />

      {/* AvatarSelector Dialog */}
      <AvatarSelector
        email={user?.email || "default"}
        isOpen={isAvatarSelectorOpen}
        onClose={() => setIsAvatarSelectorOpen(false)}
        onSelect={(url) => {
          handleAvatarSelect(url);
        }}
      />

      <div
        className="account-page relative z-10 max-w-6xl mx-auto px-5 pb-20"
        style={{ paddingTop: 36, fontFamily: "inherit" }}
      >
        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(196,176,255,0.10)",
              border: "1px solid rgba(196,176,255,0.22)",
              color: "#c4b0ff",
            }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h1
              className="font-bold tracking-tight"
              style={{
                fontSize: "clamp(24px,3vw,34px)",
                letterSpacing: "-0.04em",
                background: "linear-gradient(135deg,#c4b0ff 0%,#7ee8fa 50%,#ff9de2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Account
            </h1>
            <p className="text-xs font-light mt-0.5" style={{ color: "rgba(220,215,255,0.42)" }}>
              Profile, data &amp; security
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">

          {/* ── Profile + Plan ── */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 bg-green-900/30"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(40px)",
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-5">
              {/* Left: Avatar + Info */}
              <div className="flex gap-4">
                <div className="p-2 h-13 w-13 rounded bg-purple-400">
                  <Image
                    src={avatarSrc || user?.avatarUrl || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${user?.name || "User"}`}
                    alt={user?.name || "User"}
                    width={45}
                    height={45}
                    className="rounded-full object-cover transition-transform duration-300 ease-in-out hover:scale-180 hover:rotate-360 hover:shadow-lg hover:shadow-purple-500/30"
                  />
                </div>
                <div>
                  <div
                    className="font-bold tracking-tight"
                    style={{ fontSize: 25, color: "#f0eeff", letterSpacing: "-0.03em" }}
                  >
                    {user?.name ?? "—"}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(220,215,255,0.45)" }}>
                    {user?.email ?? "—"}
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 mt-1.5 rounded-full"
                    style={{
                      padding: "3px 10px",
                      background: "rgba(196,176,255,0.10)",
                      border: "1px solid rgba(196,176,255,0.20)",
                      fontSize: 11,
                      color: "#c4b0ff",
                      fontWeight: 500,
                    }}
                  >
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Resumate Bro
                  </div>
                </div>
              </div>

              {/* Right: Plan */}
              <div className="text-right flex-shrink-0">
                <div
                  className="text-xs font-semibold tracking-widest uppercase mb-1.5"
                  style={{ color: "rgba(220,215,255,0.45)" }}
                >
                  Current Plan
                </div>
                <div
                  className="font-extrabold leading-none"
                  style={{ fontSize: 32, color: "#f0eeff", letterSpacing: "-0.04em" }}
                >
                  FREE
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(220,215,255,0.35)" }}>forever</div>
                <div className="flex flex-col gap-1 mt-3 items-end">
                  {[
                    "Unlimited generations",
                    "Full AI analysis & ATS scoring",
                    "All premium templates",
                    "Priority support",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-1.5" style={{ fontSize: 12, color: "rgba(220,215,255,0.5)" }}>
                      <svg width="11" height="11" fill="none" stroke="#4ade80" strokeWidth="2.2" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Usage ── */}
          <SectionCard
            label="Usage This Month"
            desc="Your activity at a glance"
            icon={
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            }
          >
            <div className="flex gap-3 flex-wrap">
              <UsageStatCard
                icon={
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                }
                label="Resume Generations"
                value={loading ? "—" : String(stats.resumeCount)}
                sub="resumes generated total"
              />
              <UsageStatCard
                accent
                icon={
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                }
                label="AI Credits Used"
                value={loading ? "—" : `$${aiCost}`}
                sub={loading ? "calculating…" : `${(stats.totalTokens / 1000).toFixed(1)}K tokens consumed`}
              />
            </div>
          </SectionCard>

          {/* ── Data & Privacy ── */}
          <SectionCard
            label="Data & Privacy"
            desc="Download your complete account archive"
            icon={
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            }
          >
            <DataRow
              last
              title="Export All Data"
              desc="Download a ZIP containing your resumes, analyses, projects, skills, roadmap progress, practice sessions, account info and all settings."
            >
              <BtnGhost sm onClick={handleExportData} disabled={loadingExport}>
                {loadingExport ? (
                  <Spinner />
                ) : (
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                {loadingExport ? "Exporting…" : "Export ZIP"}
              </BtnGhost>
            </DataRow>
          </SectionCard>

          {/* ── Security ── */}
          <SectionCard
            label="Security"
            desc="Password and avatar"
            icon={
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          >
            <DataRow
              title="Profile Avatar"
              desc="Update your profile picture. Choose from our avatar gallery — shown in the dashboard and on exported resumes."
            >
              <BtnGhost sm onClick={() => setIsAvatarSelectorOpen(true)} disabled={loadingAvatar}>
                {loadingAvatar ? (
                  <Spinner />
                ) : (
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                )}
                {loadingAvatar ? "Saving…" : "Change Avatar"}
              </BtnGhost>
            </DataRow>
            <DataRow last title="Password" desc="Last changed 3 months ago.">
              <BtnGhost sm onClick={() => openModal("password")}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Change
              </BtnGhost>
            </DataRow>
          </SectionCard>

          {/* ── Danger Zone ── */}
          <SectionCard
            danger
            label="Danger Zone"
            desc="Irreversible actions — proceed with caution"
            icon={
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
          >
            <DataRow
              danger
              title="Reset All Data"
              desc="Permanently delete all your resumes, analyses, projects, skills data, and templates. Your account stays active."
            >
              <BtnDanger onClick={() => openModal("reset")}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                </svg>
                Reset Data
              </BtnDanger>
            </DataRow>
            <DataRow
              danger
              last
              title="Delete Account"
              desc="Permanently delete your Resumate account, cancel your subscription, and erase all associated data. This cannot be undone."
            >
              <BtnDanger onClick={() => openModal("delete")}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete Account
              </BtnDanger>
            </DataRow>
          </SectionCard>

        </div>
      </div>

      {/* ── Modal: Password ── */}
      <Modal open={!!modals.password} onClose={() => closeModal("password")}>
        <div className="text-base font-bold mb-1.5" style={{ color: "#f0eeff" }}>
          Change Password
        </div>
        <p className="text-xs mb-5" style={{ color: "rgba(220,215,255,0.45)" }}>
          Choose a strong password with at least 8 characters.
        </p>
        <div className="flex flex-col gap-3 mb-5">
          {[
            { label: "Current Password", value: currentPassword, set: setCurrentPassword },
            { label: "New Password", value: newPassword, set: setNewPassword },
            { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "rgba(220,215,255,0.5)" }}>
                {label}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full text-sm rounded-xl outline-none px-3.5 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.085)",
                  color: "#f0eeff",
                  fontFamily: "inherit",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <BtnGhost sm onClick={() => closeModal("password")}>Cancel</BtnGhost>
          <BtnGrad onClick={handlePasswordUpdate} disabled={loadingPassword}>
            {loadingPassword && <Spinner />}
            {loadingPassword ? "Updating…" : "Update Password"}
          </BtnGrad>
        </div>
      </Modal>

      {/* ── Modal: Reset ── */}
      <Modal open={!!modals.reset} onClose={() => closeModal("reset")} danger>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.30)", color: "#ff6b6b" }}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
          </svg>
        </div>
        <div className="text-base font-bold mb-1.5" style={{ color: "#f0eeff" }}>Reset All Data?</div>
        <p className="text-xs leading-relaxed mb-6" style={{ color: "rgba(220,215,255,0.45)" }}>
          This will permanently delete all your resumes, analyses, projects, skills data, and templates. Your
          account and subscription will remain active.{" "}
          <strong style={{ color: "#f0eeff" }}>This cannot be undone.</strong>
        </p>
        <div className="flex gap-2 justify-end">
          <BtnGhost sm onClick={() => closeModal("reset")}>Cancel</BtnGhost>
          <BtnDanger onClick={handleResetData} disabled={loadingReset}>
            {loadingReset && <Spinner />}
            {loadingReset ? "Resetting…" : "Reset Data"}
          </BtnDanger>
        </div>
      </Modal>

      {/* ── Modal: Delete ── */}
      <Modal open={!!modals.delete} onClose={() => closeModal("delete")} danger>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.30)", color: "#ff6b6b" }}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="text-base font-bold mb-1.5" style={{ color: "#f0eeff" }}>Delete Your Account?</div>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(220,215,255,0.45)" }}>
          This will permanently delete your account, all resumes, analyses, projects and cancel your
          subscription. <strong style={{ color: "#f0eeff" }}>No way to recover this data.</strong>
          <br /><br />
          Type <strong style={{ color: "#ff6b6b" }}>DELETE</strong> to confirm.
        </p>
        <input
          type="text"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="w-full text-sm rounded-xl outline-none px-3.5 py-2.5 mb-5 transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: deleteError ? "1px solid #ff6b6b" : "1px solid rgba(255,255,255,0.085)",
            color: "#f0eeff",
            fontFamily: "inherit",
            boxShadow: deleteError ? "0 0 0 3px rgba(255,107,107,0.12)" : "none",
          }}
        />
        <div className="flex gap-2 justify-end">
          <BtnGhost sm onClick={() => closeModal("delete")}>Cancel</BtnGhost>
          <BtnDanger onClick={handleDelete} disabled={loadingDelete}>
            {loadingDelete && <Spinner />}
            {loadingDelete ? "Deleting…" : "Yes, Delete My Account"}
          </BtnDanger>
        </div>
      </Modal>

      {/* Hidden file input (kept for potential future use) */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => {}} />
    </>
  );
}