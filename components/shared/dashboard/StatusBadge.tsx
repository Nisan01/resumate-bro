import type { HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

const toneStyles: Record<StatusTone, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  info:    "border-sky-500/30 bg-sky-500/10 text-sky-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger:  "border-rose-500/30 bg-rose-500/10 text-rose-300",
  neutral: "border-white/10 bg-white/5 text-white/50",
};

const dotStyles: Record<StatusTone, string> = {
  success: "bg-emerald-400",
  info:    "bg-sky-400",
  warning: "bg-amber-400",
  danger:  "bg-rose-400",
  neutral: "bg-white/30",
};

const semanticLabel: Record<StatusTone, string> = {
  success: "success", info: "informational", warning: "warning", danger: "error", neutral: "neutral",
};

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
}

export function StatusBadge({ tone = "neutral", className, children, ...props }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        toneStyles[tone],
        className,
      )}
      {...props}
      aria-label={props["aria-label"] ?? `${semanticLabel[tone]} status`}
    >
      <span className={cn("inline-block w-1.5 h-1.5 rounded-full shrink-0", dotStyles[tone])} aria-hidden />
      <span className="sr-only">{semanticLabel[tone]} status: </span>
      {children}
    </Badge>
  );
}