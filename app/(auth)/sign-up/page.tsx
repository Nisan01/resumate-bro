"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {  toast } from "react-toastify";
import { motion } from "framer-motion";
import AvatarSelector from "../_components/avatar";
import Link from "next/link";

export default function SignUpPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatarUrl: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } else {
      toast.error("Failed to create account.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080b12] text-[#f0eeff] overflow-x-hidden font-['Soria',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* Mesh Gradient Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
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

      {/* Grain Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glassmorphic Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {[
          { width: 340, height: 340, top: -80, right: "8%", duration: 22, opacity: 0.55, delay: 0 },
          { width: 200, height: 200, top: "38%", left: "2%", duration: 18, opacity: 0.45, delay: -6 },
          { width: 120, height: 120, bottom: "12%", left: "45%", duration: 15, opacity: 0.4, delay: -4 },
          { width: 80, height: 80, top: "14%", left: "42%", duration: 12, opacity: 0.5, delay: -2 },
          { width: 260, height: 260, bottom: -60, right: -40, duration: 25, opacity: 0.35, delay: -12 },
        ].map((orb, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full"
            style={{
              width: orb.width,
              height: orb.height,
              top: orb.top,
              bottom: orb.bottom,
              left: orb.left,
              right: orb.right,
              background: `radial-gradient(circle at 35% 35%, 
                rgba(255,255,255,0.55) 0%,
                rgba(196,176,255,0.35) 15%,
                rgba(126,232,250,0.25) 35%,
                rgba(255,157,226,0.2) 55%,
                rgba(8,11,18,0.1) 75%,
                transparent 100%)`,
              boxShadow: `inset 0 0 30px rgba(255,255,255,0.12), 
                         inset 2px 2px 12px rgba(255,255,255,0.25), 
                         0 0 60px rgba(180,140,255,0.08)`,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            animate={{
              y: [0, -30, -15, -40, 0],
              x: [0, 20, -15, 10, 0],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "linear",
              delay: orb.delay,
            }}
          />
        ))}

        {/* Orb Rings */}
        <motion.div
          className="absolute rounded-full border-[1.5px] border-transparent"
          style={{
            width: 280,
            height: 280,
            top: "20%",
            right: "22%",
            background: `linear-gradient(#080b12, #080b12) padding-box,
                        linear-gradient(135deg, rgba(196,176,255,0.6), rgba(126,232,250,0.6), rgba(255,157,226,0.6)) border-box`,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -40, -20, -50, 0],
            x: [0, 30, -15, 20, 0],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute rounded-full border-[1.5px] border-transparent"
          style={{
            width: 180,
            height: 180,
            bottom: "25%",
            left: "18%",
            background: `linear-gradient(#080b12, #080b12) padding-box,
                        linear-gradient(135deg, rgba(196,176,255,0.6), rgba(126,232,250,0.6), rgba(255,157,226,0.6)) border-box`,
            opacity: 0.25,
          }}
          animate={{
            y: [0, -30, -15, -40, 0],
            x: [0, 20, -15, 10, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen overflow-x-hidden overflow-y-hidden">
        {/* LEFT SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-14 py-12 lg:py-12"
        >
          <div className="max-w-2xl w-full">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hidden sm:flex items-center gap-3 mb-10"
            >
              <div className="flex -space-x-2">
                {["A", "J", "K"].map((letter, idx) => (
                  <motion.div
                    key={letter}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2 + idx * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 12,
                    }}
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                      idx === 0
                        ? "from-[#c4b0ff] to-[#7ee8fa]"
                        : idx === 1
                        ? "from-[#7ee8fa] to-[#c4b0ff]"
                        : "from-[#ff9de2] to-[#c4b0ff]"
                    } flex items-center justify-center text-sm font-bold text-[#0a0714] border-2 border-white/10`}
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
              <span className="text-base text-white/45">
                Join <strong className="text-white font-semibold">12,400+</strong> professionals worldwide
              </span>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 bg-[rgba(196,176,255,0.08)] border border-[rgba(196,176,255,0.2)] rounded-full px-5 py-2 mb-8 cursor-pointer"
            >
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-2 h-2 rounded-full bg-[#c4b0ff] shadow-[0_0_8px_rgba(196,176,255,0.6)]"
              />
              <span className="text-sm font-medium text-[#c4b0ff] tracking-wide">
                Join Resumate Today
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-[-0.03em] mb-6"
            >
              Start Building{" "}
              <br />
              <motion.span
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] bg-clip-text text-transparent inline-block"
                style={{ backgroundSize: "200% auto" }}
              >
                Your Future
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-base sm:text-lg leading-relaxed text-white/45 mb-10 max-w-xl"
            >
              Create AI-powered resumes, get matched with jobs, and prepare for
              interviews — all in one platform built for your success.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 mb-14"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 sm:px-7 py-3 rounded-lg bg-[rgba(196,176,255,0.1)] border border-[rgba(196,176,255,0.25)] text-[#c4b0ff] text-sm sm:text-base font-medium hover:bg-[rgba(196,176,255,0.18)] hover:border-[rgba(196,176,255,0.45)] transition-all"
              >
                <motion.svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 2, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </motion.svg>
                Watch Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 sm:px-7 py-3 rounded-lg border border-white/10 bg-transparent text-white/45 text-sm sm:text-base font-medium hover:text-white hover:border-white/20 transition-all group"
              >
                Explore Features
                <motion.svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </motion.svg>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <div className="flex gap-8 sm:gap-12 pt-8 border-t border-white/10">
              {[
                { value: "48k+", label: "Users Joined" },
                { value: "92%", label: "Success Rate" },
                { value: "5.0★", label: "User Rating" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/45 mt-1.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT SECTION - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 15,
            delay: 0.2,
          }}
          className="w-full lg:w-[500px] flex items-center justify-center px-6 sm:px-8 py-12 lg:py-12"
        >
          <div className="w-full max-w-[400px]">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center gap-3 mb-5"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] flex items-center justify-center text-lg sm:text-xl text-[#0a0714] shadow-[0_4px_16px_rgba(196,176,255,0.36)]"
              >
                ✦
              </motion.div>
              <span className="font-bold text-lg sm:text-xl tracking-[-0.02em]">Resumate</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
              className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] mb-2"
            >
              Create account
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="text-sm sm:text-base text-white/45 mb-8"
            >
              Start your journey for free
            </motion.p>

            {/* Social Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg border border-white/10 bg-white/5 text-white/45 text-xs sm:text-sm font-medium transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                  <path fill="#34a853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777l-4.04 3.116C3.196 21.303 7.265 24 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                  <path fill="#4a90e2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                  <path fill="#fbbc05" d="M5.277 14.314a7.12 7.12 0 0 1-.376-2.313c0-.793.143-1.56.376-2.236L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.021Z" />
                </svg>
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg border border-white/10 bg-white/5 text-white/45 text-xs sm:text-sm font-medium transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 text-xs sm:text-sm text-white/30 mb-6"
            >
              <div className="flex-1 h-px bg-white/10" />
              <span>or continue with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Full name with avatar */}
              <div>
                <label className="block text-xs sm:text-sm text-white/45 mb-2 font-medium tracking-wide">
                  Full name
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 group-focus-within:text-[#c4b0ff] transition-colors"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <motion.input
                      whileFocus={{
                        scale: 1.02,
                        borderColor: "rgba(196,176,255,0.48)",
                        boxShadow: "0 0 0 3px rgba(196,176,255,0.09)",
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }}
                      type="text"
                      placeholder="John Doe"
                      required
                      className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-lg bg-white/5 border border-white/10 outline-none text-sm sm:text-base placeholder:text-white/30 transition-all"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  
                  {/* Avatar button */}
                  <motion.button
                    type="button"
                    onClick={() => setIsAvatarOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {form.avatarUrl ? (
                      <img
                        src={form.avatarUrl}
                        className="w-full h-full rounded-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </motion.button>
                </div>
                <span className="text-[11px] w-full flex justify-end sm:text-xs text-white/30 mt-1.5 block">
                  {form.avatarUrl ? "Click to change avatar" : "Pick an avatar"}
                </span>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm text-white/45 mb-2 font-medium tracking-wide">
                  Email address
                </label>
                <div className="relative group">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 group-focus-within:text-[#c4b0ff] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <motion.input
                    whileFocus={{
                      scale: 1.02,
                      borderColor: "rgba(196,176,255,0.48)",
                      boxShadow: "0 0 0 3px rgba(196,176,255,0.09)",
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-lg bg-white/5 border border-white/10 outline-none text-sm sm:text-base placeholder:text-white/30 transition-all"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm text-white/45 mb-2 font-medium tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 group-focus-within:text-[#c4b0ff] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <motion.input
                    whileFocus={{
                      scale: 1.02,
                      borderColor: "rgba(196,176,255,0.48)",
                      boxShadow: "0 0 0 3px rgba(196,176,255,0.09)",
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 sm:py-3.5 rounded-lg bg-white/5 border border-white/10 outline-none text-sm sm:text-base placeholder:text-white/30 transition-all"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/70 transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      {showPw ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </motion.button>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-3.5 rounded-lg font-bold text-sm sm:text-base text-[#0a0714] bg-gradient-to-r from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] shadow-[0_4px_28px_rgba(196,176,255,0.30)] hover:shadow-[0_8px_36px_rgba(196,176,255,0.45)] transition-all duration-200 relative overflow-hidden group mt-6"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                Create Account
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs sm:text-sm text-white/45 mt-6"
            >
              Already have an account?{" "}
              <motion.span
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Link
                  href="/sign-in"
                  className="text-[#c4b0ff] font-medium hover:text-[#7ee8fa] transition-colors"
                >
                  Sign in
                </Link>
              </motion.span>
            </motion.p>
          </div>
        </motion.div>
      </div>

      <AvatarSelector
        email={form.email || "default"}
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        onSelect={(url) => setForm({ ...form, avatarUrl: url })}
      />
    </div>
  );
}