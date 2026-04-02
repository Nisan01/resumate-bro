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
    <div
      className={cn(
        "w-full space-y-7 px-5 py-5 sm:px-7 sm:py-6 lg:px-10 lg:py-8 xl:px-12 2xl:px-14",
        className,
      )}
    >
      <header className="relative overflow-hidden rounded-3xl border border-white/20 bg-linear-to-br from-slate-900/95 via-cyan-900/75 to-emerald-900/80 p-7 text-slate-100 shadow-2xl shadow-slate-950/45 sm:p-8">
        <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            {eyebrow ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-200">
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
              </p>
            ) : null}

            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
            <p className="max-w-2xl text-sm text-slate-200/90 sm:text-base">{description}</p>
          </div>

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>

      <div className="space-y-7">{children}</div>
    </div>
  );
}
