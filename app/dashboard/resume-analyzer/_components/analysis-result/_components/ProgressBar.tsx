import { useEffect, useRef } from "react";

type Props = {
  label: string;
  pct: number; // now 0–10 scale
  gradFrom: string;
  gradTo: string;
};

export default function ProgressBar({ label, pct, gradFrom, gradTo }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const bar = barRef.current;
    if (!wrap || !bar) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            // convert 0–10 → percentage
            const width = Math.min(Math.max(pct * 10, 0), 100);
            bar.style.width = width + "%";
          }, 350);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    io.observe(wrap);
    return () => io.disconnect();
  }, [pct]);
const safePct = Number(pct) || 0;
  return (
    <div ref={wrapRef} className="flex flex-col gap-1.5">
      {/* Label + Value */}
      <div className="flex justify-between text-[12px]">
        <span style={{ color: "rgba(220,215,255,0.60)" }}>{label}</span>
        <span className="font-semibold" style={{ color: "#c4b0ff" }}>
        {safePct.toFixed(1)}/10
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-[5px] rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          ref={barRef}
          className="prog-fill h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: 0,
            background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
          }}
        />
      </div>
    </div>
  );
}