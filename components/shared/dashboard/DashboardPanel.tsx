import type { HTMLAttributes, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardPanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function DashboardPanel({
  title,
  description,
  action,
  className,
  children,
  ...props
}: DashboardPanelProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/18 bg-linear-to-br from-slate-950/72 via-slate-900/56 to-cyan-950/38 text-slate-100 backdrop-blur-xl shadow-[0_18px_40px_rgba(8,15,30,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/28 hover:shadow-[0_22px_44px_rgba(8,15,30,0.55)]",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/55 to-transparent opacity-70" />

      {title || description || action ? (
        <CardHeader className="px-7 pb-5 pt-7 sm:px-8 sm:pt-8">
          <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <CardTitle className="text-lg text-slate-100">{title}</CardTitle> : null}
            {description ? <CardDescription className="text-sm text-slate-200/90">{description}</CardDescription> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </CardHeader>
      ) : null}

      <CardContent
        className={cn(
          "space-y-5 px-7 pb-7 sm:px-8 sm:pb-8",
          title || description || action ? "pt-0" : "pt-7 sm:pt-8",
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
