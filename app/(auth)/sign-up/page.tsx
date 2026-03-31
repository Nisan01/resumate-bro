"use client";
import { useState } from "react";
import AvatarSelector from "../_components/avatar";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatarUrl: "",
  });
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {

    e.preventDefault();
    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Account created successfully!",{
        position: "bottom-right"
      });
        setForm({ name: "", email: "", password: "", avatarUrl: "" });
        router.push("/sign-in");
    } else {
      toast.error("Failed to create account.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0c0c10] p-4">

      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#111115] px-8 py-10 shadow-2xl">

          {/* Avatar preview / placeholder */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAvatarOpen(true)}
              className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
            >
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt="Selected avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <svg className="h-7 w-7 text-white/20 transition-colors group-hover:text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {/* Edit ring on hover */}
              <div className="absolute inset-0 rounded-full ring-0 ring-white/20 transition-all duration-200 group-hover:ring-2" />
              {/* Edit badge */}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1a1a20] text-white/50 transition-colors group-hover:text-white/80">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M7 1.5L8.5 3 3.5 8H2V6.5L7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            <span className="text-[11px] tracking-widest text-white/25 uppercase font-medium">
              {form.avatarUrl ? "tap to change" : "choose avatar"}
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white/90">
              Create account
            </h1>
            <p className="mt-1.5 text-sm text-white/35">
              Already have one?{" "}
              <a href="/sign-in" className="text-white/60 underline underline-offset-2 hover:text-white/90 transition-colors">
                Sign in
              </a>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-3">
            <input
              type="text"
              placeholder="Full name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="block w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all duration-150 focus:border-white/20 focus:bg-white/[0.07] focus:ring-0"
            />
            <input
              type="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="block w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all duration-150 focus:border-white/20 focus:bg-white/[0.07] focus:ring-0"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="block w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 pr-11 text-sm text-white/80 placeholder-white/20 outline-none transition-all duration-150 focus:border-white/20 focus:bg-white/[0.07] focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-[#0c0c10] transition-all duration-150 hover:bg-white/90 active:scale-[0.98]"
              >
                Create account
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-[11px] text-white/20 leading-relaxed">
            By signing up you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Terms</a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <AvatarSelector
        email={form.email || "default-seed"}
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        onSelect={(avatarUrl) => {
          setForm({ ...form, avatarUrl });
          console.log("Selected Avatar URL:", avatarUrl);
        }}
      />
    </main>
  );
}