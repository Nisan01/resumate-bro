import { cn } from "@/lib/utils";

type ProgressTone = "emerald" | "cyan" | "amber" | "rose";

const barStyles: Record<ProgressTone, string> = {
  emerald: "bg-gradient-to-r from-emerald-300 to-emerald-400",
  cyan: "bg-gradient-to-r from-cyan-300 to-cyan-400",
  amber: "bg-gradient-to-r from-amber-300 to-amber-400",
  rose: "bg-gradient-to-r from-rose-300 to-rose-400",
};

interface ProgressMeterProps {
  label: string;
  value: number;
  note?: string;
  tone?: ProgressTone;
}

export function ProgressMeter({ label, value, note, tone = "emerald" }: ProgressMeterProps) {
  const boundedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-200">{label}</span>
        <span className="font-medium text-slate-100">{boundedValue}%</span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-slate-200/12">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barStyles[tone])}
          role="progressbar"
          aria-label={`${label} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={boundedValue}
          style={{ width: `${boundedValue}%` }}
        />
      </div>

      {note ? <p className="text-xs text-slate-200/90">{note}</p> : null}
    </div>
  );
}
