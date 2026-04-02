import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "teal" | "amber" | "sky" | "rose";

const toneStyles: Record<
  MetricTone,
  {
    card: string;
    badge: string;
    helper: string;
    glow: string;
    icon: string;
  }
> = {
  teal: {
    card: "border-teal-300/30 bg-gradient-to-br from-teal-400/42 via-cyan-500/24 to-slate-950/80",
    badge: "border-teal-200/55 bg-slate-950/44 text-teal-100",
    helper: "text-slate-100/92",
    glow: "bg-teal-300/26",
    icon: "border-teal-200/45 bg-slate-950/40 text-teal-100",
  },
  amber: {
    card: "border-amber-300/30 bg-gradient-to-br from-amber-400/44 via-orange-500/24 to-slate-950/80",
    badge: "border-amber-200/55 bg-slate-950/44 text-amber-100",
    helper: "text-slate-100/92",
    glow: "bg-amber-300/26",
    icon: "border-amber-200/45 bg-slate-950/40 text-amber-100",
  },
  sky: {
    card: "border-sky-300/30 bg-gradient-to-br from-sky-400/44 via-blue-500/24 to-slate-950/80",
    badge: "border-sky-200/55 bg-slate-950/44 text-sky-100",
    helper: "text-slate-100/92",
    glow: "bg-sky-300/26",
    icon: "border-sky-200/45 bg-slate-950/40 text-sky-100",
  },
  rose: {
    card: "border-rose-300/30 bg-gradient-to-br from-rose-400/40 via-fuchsia-500/24 to-slate-950/80",
    badge: "border-rose-200/55 bg-slate-950/44 text-rose-100",
    helper: "text-slate-100/92",
    glow: "bg-rose-300/26",
    icon: "border-rose-200/45 bg-slate-950/40 text-rose-100",
  },
};

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  helperText?: string;
  tone?: MetricTone;
  icon?: ReactNode;
}

export function MetricCard({
  label,
  value,
  change,
  helperText,
  tone = "teal",
  icon,
}: MetricCardProps) {
  const style = toneStyles[tone];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border text-slate-50 backdrop-blur-xl shadow-[0_16px_34px_rgba(8,15,30,0.38)] ring-1 ring-white/8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(8,15,30,0.52)]",
        style.card,
      )}
    >
      <span className={cn("pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl", style.glow)} />
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/65 to-transparent opacity-70" />

      <CardContent className="relative p-6 sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-100">{label}</p>
          {icon ? (
            <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl border", style.icon)}>{icon}</div>
          ) : null}
        </div>

        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", style.badge)}>{change}</span>
          <p className={cn("text-xs", style.helper)}>{helperText}</p>
        </div>
      </CardContent>
    </Card>
  );
}
