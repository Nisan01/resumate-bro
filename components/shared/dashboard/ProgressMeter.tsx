import { cn } from "@/lib/utils";

type ProgressTone = "emerald" | "cyan" | "amber" | "rose";

const barStyles: Record<ProgressTone, { bar: string; glow: string }> = {
  emerald: { bar: "bg-gradient-to-r from-emerald-600 to-emerald-400", glow: "shadow-emerald-500/40" },
  cyan:    { bar: "bg-gradient-to-r from-cyan-600 to-cyan-400",    glow: "shadow-cyan-500/40" },
  amber:   { bar: "bg-gradient-to-r from-amber-600 to-amber-400",  glow: "shadow-amber-500/40" },
  rose:    { bar: "bg-gradient-to-r from-rose-600 to-rose-400",    glow: "shadow-rose-500/40" },
};

interface ProgressMeterProps {
  label: string;
  value: number;
  note?: string;
  tone?: ProgressTone;
}

export function ProgressMeter({ label, value, note, tone = "emerald" }: ProgressMeterProps) {
  const bounded = Math.max(0, Math.min(100, Math.round(value)));
  const style = barStyles[tone];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-sm text-white/50 font-medium">{label}</span>
        <span className="text-sm font-bold text-white tabular-nums">{bounded}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out shadow-sm", style.bar, style.glow)}
          role="progressbar"
          aria-label={`${label} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={bounded}
          style={{ width: `${bounded}%` }}
        />
      </div>

      {note && <p className="text-[11px] text-white/25 leading-relaxed">{note}</p>}
    </div>
  );
}