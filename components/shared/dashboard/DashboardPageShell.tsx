import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardPageShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function DashboardPageShell({
  eyebrow,
  title,
  description,
  action,
  className,
  children,
}: DashboardPageShellProps) {
  return (

      <div className="flex w-full justify-center items-center">
    <div className={cn("flex flex-col  max-w-7xl w-full space-y-7 px-5 py-5 sm:px-7 sm:py-6 lg:px-10 lg:py-8 xl:px-12 2xl:px-14", className)}>

      {/* Hero header */}
      <header className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 sm:p-8 shadow-2xl shadow-black/40">
        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full bg-blue-600/8 blur-[80px]" />

        {/* Top shimmer line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            {eyebrow && (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                <Sparkles className="h-3 w-3 text-violet-400" />
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm text-white/40 sm:text-base leading-relaxed">{description}</p>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </header>

      <div className="space-y-7 ">{children}</div>
    </div>
    </div>
  );
}