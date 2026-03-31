"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();
  const { login } = useUser();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch {
      toast.error("Invalid credentials");
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col lg:flex-row bg-[#080b12] text-white overflow-hidden">
      <ToastContainer />

      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[50%] h-[60%] top-[10%] left-[0%] bg-purple-700/25 blur-[140px] rounded-full" />
        <div className="absolute w-[40%] h-[50%] top-[0%] right-[10%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute w-[40%] h-[50%] bottom-[0%] left-[20%] bg-indigo-600/20 blur-[120px] rounded-full" />
      </div>

      {/* ORBS */}
      <div className="absolute inset-0 z-0">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/10 backdrop-blur-md"
            style={{
              width: i === 1 ? 340 : i === 2 ? 200 : i === 3 ? 120 : 80,
              height: i === 1 ? 340 : i === 2 ? 200 : i === 3 ? 120 : 80,
              top: i === 1 ? -80 : i === 2 ? "40%" : i === 3 ? "auto" : "15%",
              bottom: i === 3 ? "10%" : "auto",
              left: i === 2 ? "2%" : i === 4 ? "40%" : "auto",
              right: i === 1 ? "8%" : "auto",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(196,176,255,0.12), rgba(126,232,250,0.08), transparent)",
            }}
            animate={{
              y: [0, -30, -10, -40, 0],
              x: [0, 20, -10, 10, 0],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: 20 - i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* LEFT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-0 z-10">
        <div className="max-w-lg text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs sm:text-sm text-white/70 mb-8">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            AI-Powered Career Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
            Unlock Your{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              True Potential
            </span>
          </h1>

          <p className="text-white/50 mb-8 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed">
            Craft compelling resumes, discover opportunities tailored to your
            skills, and navigate your career journey with intelligent guidance
            at every step.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white/80 hover:bg-white/10 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Demo
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-sm font-medium">
              Explore Features
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center lg:justify-start gap-8 sm:gap-12 mt-10 border-t border-white/10 pt-6">
            <div>
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                48k+
              </p>
              <p className="text-xs text-white/40 mt-0.5">Resumes Created</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                92%
              </p>
              <p className="text-xs text-white/40 mt-0.5">Interview Rate</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                5.0★
              </p>
              <p className="text-xs text-white/40 mt-0.5">User Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[480px] flex items-center justify-center px-6 sm:px-10 py-10 lg:py-0 z-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 via-cyan-400 to-pink-400 flex items-center justify-center text-black font-bold text-lg">
              ✦
            </div>
            <span className="font-bold text-lg">Resumate</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-center lg:text-left">
            Welcome back
          </h2>
          <p className="text-sm text-white/50 mb-7 text-center lg:text-left">
            Sign in to continue your journey
          </p>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/30 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            or continue with email
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                Email address
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400/60 outline-none text-sm placeholder:text-white/25 transition-colors"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400/60 outline-none text-sm placeholder:text-white/25 transition-colors"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-white/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border border-white/20 bg-white/5 accent-purple-400"
                />
                Remember me
              </label>
              <a href="#" className="text-white/50 hover:text-purple-400 transition-colors text-xs">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300 hover:opacity-90 transition-opacity mt-2"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}