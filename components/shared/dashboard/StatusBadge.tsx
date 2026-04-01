import type { HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

const toneStyles: Record<StatusTone, string> = {
  success: "border-emerald-300/55 bg-emerald-500/24 text-emerald-50",
  info: "border-cyan-300/55 bg-cyan-500/24 text-cyan-50",
  warning: "border-amber-300/55 bg-amber-500/24 text-amber-50",
  danger: "border-rose-300/55 bg-rose-500/24 text-rose-50",
  neutral: "border-slate-300/45 bg-slate-500/24 text-slate-100",
};

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
}

export function StatusBadge({ tone = "neutral", className, children, ...props }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-semibold", toneStyles[tone], className)}
      {...props}
    >
      {children}
    </Badge>
  );
}
