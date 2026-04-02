import type { HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

const toneStyles: Record<StatusTone, string> = {
  success: "border-emerald-800 bg-emerald-200 text-emerald-950",
  info: "border-cyan-800 bg-cyan-200 text-cyan-950",
  warning: "border-amber-800 bg-amber-200 text-amber-950",
  danger: "border-rose-800 bg-rose-200 text-rose-950",
  neutral: "border-slate-700 bg-slate-200 text-slate-900",
};

const semanticToneLabel: Record<StatusTone, string> = {
  success: "success",
  info: "informational",
  warning: "warning",
  danger: "error",
  neutral: "neutral",
};

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
}

export function StatusBadge({ tone = "neutral", className, children, ...props }: StatusBadgeProps) {
  const semanticLabel = semanticToneLabel[tone];

  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-semibold", toneStyles[tone], className)}
      {...props}
      aria-label={props["aria-label"] ?? `${semanticLabel} status`}
    >
      <span className="sr-only">{semanticLabel} status: </span>
      {children}
    </Badge>
  );
}
