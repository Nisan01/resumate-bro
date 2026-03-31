"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import { useUser } from "@/context/UserContext";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();
  const { login } = useUser(); 

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(form); 
      toast.success("Logged in successfully!", { position: "bottom-right" });
      router.push("/");
    } catch {
      toast.error("Invalid credentials");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <ToastContainer />
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm border border-zinc-200">
        <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900">Sign In</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <input type="email" placeholder="Email Address" required className="block w-full rounded-md border border-zinc-300 px-3 py-2"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" required className="block w-full rounded-md border border-zinc-300 px-3 py-2"
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="w-full rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition">
            Login
          </button>
        </form>
        <p className="text-center text-sm text-zinc-600">
          Don't have an account? <Link href="/sign-up" className="font-semibold text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}