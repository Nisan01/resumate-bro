import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type RoadmapTheme = "amber" | "violet" | "lime";

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  align: "top" | "bottom";
  theme: RoadmapTheme;
}

const themeClasses: Record<
  RoadmapTheme,
  {
    card: string;
    pinBorder: string;
    line: string;
    chip: string;
  }
> = {
  amber: {
    card: "from-[#9a7a1b] via-[#665219] to-[#2d313a]",
    pinBorder: "border-amber-400",
    line: "from-white/30 to-white/5",
    chip: "bg-amber-300/25 text-amber-100",
  },
  violet: {
    card: "from-[#6b42be] via-[#4c3a8b] to-[#2c3250]",
    pinBorder: "border-violet-400",
    line: "from-white/30 to-white/5",
    chip: "bg-violet-300/25 text-violet-100",
  },
  lime: {
    card: "from-[#7f9440] via-[#617432] to-[#2a3a2f]",
    pinBorder: "border-lime-300",
    line: "from-white/30 to-white/5",
    chip: "bg-lime-300/25 text-lime-100",
  },
};

function MapPin({
  id,
  theme,
  direction,
  className,
  style,
}: {
  id: string;
  theme: RoadmapTheme;
  direction: "up" | "down";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn("w-14", className)} style={style}>
      {direction === "up" ? (
        <div
          className={cn(
            "-mb-1.5 mx-auto h-3.5 w-3.5 rotate-45 border-l-4 border-t-4 bg-slate-100",
            themeClasses[theme].pinBorder,
          )}
        />
      ) : null}

      <div
        className={cn(
          "mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 bg-slate-100 text-[1.95rem] font-semibold leading-none text-slate-500 shadow-lg shadow-slate-950/45",
          themeClasses[theme].pinBorder,
        )}
      >
        {id}
      </div>

      {direction === "down" ? (
        <div
          className={cn(
            "-mt-1.5 mx-auto h-3.5 w-3.5 rotate-45 border-b-4 border-r-4 bg-slate-100",
            themeClasses[theme].pinBorder,
          )}
        />
      ) : null}
    </div>
  );
}

interface RoadmapWaveTimelineProps {
  steps: RoadmapStep[];
}

export function RoadmapWaveTimeline({ steps }: RoadmapWaveTimelineProps) {
  const normalizedSteps = steps.length > 0 ? steps : [];
  const stepWidth = normalizedSteps.length > 0 ? 100 / normalizedSteps.length : 0;
  const desktopTrackLines = Array.from({ length: normalizedSteps.length + 1 }, (_, index) => index * stepWidth);

  
  const positionedSteps = normalizedSteps.map((step, index) => ({
    ...step,
    left: index * stepWidth,
  }));

  const desktopPins: Array<{
    id: string;
    left: number;
    top: number;
    theme: RoadmapTheme;
    direction: "up" | "down";
  }> = positionedSteps.map((step, index) => ({
    id: step.id,
    left: index * stepWidth + stepWidth * 0.6,
    top: step.align === "top" ? 328 : 72,
    theme: step.theme,
    direction: step.align === "top" ? "up" : "down",
  }));

  return (
    <section className="rounded-[2rem] border border-white/18 bg-linear-to-br from-[#2b294b]/85 via-[#1f2f52]/80 to-[#18243f]/90 p-4 shadow-[0_18px_45px_rgba(10,12,28,0.55)] sm:p-6 xl:p-7">
      <div className="hidden min-h-110 lg:block">
        <div className="relative mx-auto min-h-110 min-w-5xl overflow-hidden rounded-[1.65rem] border border-white/15 bg-linear-to-b from-[#202e44] via-[#1c243c] to-[#111a2f]">
          <div className="absolute -left-28 top-18 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute right-6 top-2 h-72 w-72 rounded-full bg-violet-300/12 blur-3xl" />
          <div className="absolute -bottom-14 right-20 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />

          {desktopTrackLines.map((line, index) => (
            <span
              key={`line-${line}`}
              className={cn(
                "absolute top-0 h-full w-px bg-linear-to-b from-white/28 to-white/5",
                index === 0 || index === desktopTrackLines.length - 1 ? "opacity-90" : "opacity-75",
              )}
              style={{ left: `${line}%` }}
            />
          ))}

          <svg
            className="pointer-events-none absolute left-0 top-33 h-58 w-full"
            viewBox="0 0 1200 360"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M-40 180 C80 30, 230 330, 380 180"
              fill="none"
              stroke="#f6b60a"
              strokeWidth="86"
              strokeLinecap="round"
            />
            <path
              d="M332 180 C480 30, 620 330, 768 180"
              fill="none"
              stroke="#9f4ef6"
              strokeWidth="86"
              strokeLinecap="round"
            />
            <path
              d="M710 180 C860 30, 1000 330, 1160 180"
              fill="none"
              stroke="#c9db3f"
              strokeWidth="86"
              strokeLinecap="round"
            />

            <path
              d="M-40 180 C80 30, 230 330, 380 180 M332 180 C480 30, 620 330, 768 180 M710 180 C860 30, 1000 330, 1160 180"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="2"
            />
          </svg>

          {positionedSteps.map((step) => (
            <article
              key={step.id}
              className={cn(
                "absolute flex border border-white/22 bg-linear-to-b px-4 py-5 text-left backdrop-blur-[1px]",
                themeClasses[step.theme].card,
                step.align === "top"
                  ? "top-4 h-62.5 items-start rounded-t-2xl"
                  : "bottom-4 h-62.5 items-end rounded-b-2xl",
              )}
              style={{ left: `${step.left}%`, width: `${stepWidth}%` }}
            >
              {step.align === "top" ? (
                <span className="pointer-events-none absolute -bottom-12 left-1/2 h-20 w-[145%] -translate-x-1/2 rounded-full bg-[#1b2438]" />
              ) : (
                <span className="pointer-events-none absolute -top-12 left-1/2 h-20 w-[145%] -translate-x-1/2 rounded-full bg-[#1b2438]" />
              )}

              <div className="relative space-y-3">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/75">PHASE {step.id}</p>
                <h3 className="text-[1.06rem] leading-[1.3] font-semibold text-white/95">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/88">{step.description}</p>
              </div>
            </article>
          ))}

          {desktopPins.map((pin) => (
            <MapPin
              key={pin.id}
              id={pin.id}
              theme={pin.theme}
              direction={pin.direction}
              className="absolute -translate-x-1/2"
              style={{ left: `${pin.left}%`, top: `${pin.top}px` }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 lg:hidden">
        {normalizedSteps.map((step, index) => (
          <article key={step.id} className="relative pl-16">
            {index !== normalizedSteps.length - 1 ? (
              <span className="absolute left-7 top-12 h-[calc(100%+1rem)] w-px bg-white/25" />
            ) : null}

            <MapPin id={step.id} theme={step.theme} direction="down" className="absolute left-0 top-0" />

            <div
              className={cn(
                "rounded-2xl border border-white/20 bg-linear-to-br p-4 shadow-lg shadow-slate-950/45",
                themeClasses[step.theme].card,
              )}
            >
              <p
                className={cn(
                  "inline-flex rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                  themeClasses[step.theme].chip,
                )}
              >
                Phase {step.id}
              </p>
              <h3 className="mt-3 text-base leading-snug font-semibold text-white/95">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed font-medium text-white/90">{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}