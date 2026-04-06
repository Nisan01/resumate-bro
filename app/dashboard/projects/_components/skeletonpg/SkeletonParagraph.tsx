import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisSkeleton() {
  return (
    <div className="animate-[fadeUp_0.5s_ease_both] mt-6 rounded-[22px] border border-green-500/30 bg-white/[0.025] w-full backdrop-blur-[15px] overflow-hidden p-8">
      
      {/* Title */}
      <Skeleton className="h-5 w-48 mb-6 bg-white/10" />

      {/* Paragraph block */}
      <div className="space-y-3 mb-8">
        <Skeleton className="h-3 w-full bg-white/10" />
        <Skeleton className="h-3 w-[95%] bg-white/10" />
        <Skeleton className="h-3 w-[90%] bg-white/10" />
        <Skeleton className="h-3 w-[85%] bg-white/10" />
      </div>

      {/* Section */}
      <Skeleton className="h-4 w-32 mb-4 bg-white/10" />

      <div className="space-y-3 mb-8">
        <Skeleton className="h-3 w-full bg-white/10" />
        <Skeleton className="h-3 w-[92%] bg-white/10" />
        <Skeleton className="h-3 w-[88%] bg-white/10" />
      </div>

      {/* Bullet-like rows */}
      <div className="space-y-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="h-3 w-3 rounded-full mt-1 bg-white/10" />
            <Skeleton className="h-3 w-[85%] bg-white/10" />
          </div>
        ))}
      </div>

      {/* Final paragraph */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-full bg-white/10" />
        <Skeleton className="h-3 w-[93%] bg-white/10" />
        <Skeleton className="h-3 w-[80%] bg-white/10" />
      </div>
    </div>
  );
}