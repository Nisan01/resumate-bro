import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "teal" | "amber" | "sky" | "rose";

const toneStyles: Record<MetricTone, { border: string; orb: string; badge: string; valuColor: string; iconRing: string }> = {
  teal: {
    border: "border-teal-500/20 hover:border-teal-500/35",
    orb: "bg-teal-500/15",
    badge: "bg-teal-500/10 border-teal-500/25 text-teal-300",
    valuColor: "text-teal-100",
    iconRing: "border-teal-500/25 bg-teal-500/10 text-teal-300",
  },
  amber: {
    border: "border-amber-500/20 hover:border-amber-500/35",
    orb: "bg-amber-500/15",
    badge: "bg-amber-500/10 border-amber-500/25 text-amber-300",
    valuColor: "text-amber-100",
    iconRing: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  },
  sky: {
    border: "border-sky-500/20 hover:border-sky-500/35",
    orb: "bg-sky-500/15",
    badge: "bg-sky-500/10 border-sky-500/25 text-sky-300",
    valuColor: "text-sky-100",
    iconRing: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  },
  rose: {
    border: "border-rose-500/20 hover:border-rose-500/35",
    orb: "bg-rose-500/15",
    badge: "bg-rose-500/10 border-rose-500/25 text-rose-300",
    valuColor: "text-rose-100",
    iconRing: "border-rose-500/25 bg-rose-500/10 text-rose-300",
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

export function MetricCard({ label, value, change, helperText, tone = "teal", icon }: MetricCardProps) {
  const style = toneStyles[tone];

  return (
    <Card className={cn(
      "group relative overflow-hidden rounded-2xl border bg-white/[0.03] text-white backdrop-blur-xl shadow-[0_16px_34px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(0,0,0,0.45)]",
      style.border,
    )}>
      {/* Orb */}
      <span className={cn("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-150", style.orb)} />
      {/* Shimmer */}
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <CardContent className="relative p-6 sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">{label}</p>
          {icon && (
            <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl border", style.iconRing)}>
              {icon}
            </div>
          )}
        </div>

        <p className={cn("text-3xl font-bold tracking-tight tabular-nums", style.valuColor)}>{value}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold", style.badge)}>{change}</span>
          {helperText && <p className="text-[11px] text-white/30">{helperText}</p>}
        </div>
      </CardContent>
    </Card>
  );
}