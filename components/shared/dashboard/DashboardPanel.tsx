import type { HTMLAttributes, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardPanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function DashboardPanel({ title, description, action, className, children, ...props }: DashboardPanelProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-white backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/15 hover:shadow-[0_22px_48px_rgba(0,0,0,0.5)]",
        className,
      )}
      {...props}
    >
      {/* Top shimmer */}
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {/* Corner glow */}
      <span className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-violet-500/8 blur-2xl group-hover:bg-violet-500/12 transition-colors duration-500" />

      {(title || description || action) && (
        <CardHeader className="px-7 pb-5 pt-7 sm:px-8 sm:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {title && <CardTitle className="text-base font-bold text-white tracking-tight">{title}</CardTitle>}
              {description && <CardDescription className="text-sm text-white/35">{description}</CardDescription>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("space-y-5 px-7 pb-7 sm:px-8 sm:pb-8", title || description || action ? "pt-0" : "pt-7 sm:pt-8")}>
        {children}
      </CardContent>
    </Card>
  );
}