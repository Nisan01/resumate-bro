import { Skeleton } from "@/components/ui/skeleton";

export function ProjectSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 p-[22px] bg-white/[0.035]">
      
      {/* Emoji */}
      <Skeleton className="h-8 w-8 rounded-lg mb-4 bg-white/10" />

      {/* Title */}
      <Skeleton className="h-4 w-3/4 mb-2 bg-white/10" />

      {/* Description */}
      <Skeleton className="h-3 w-full mb-1.5 bg-white/10" />
      <Skeleton className="h-3 w-5/6 mb-4 bg-white/10" />

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-5 w-12 rounded-full bg-white/10" />
        <Skeleton className="h-5 w-10 rounded-full bg-white/10" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
        <Skeleton className="h-2 w-16 rounded-full bg-white/10" />
      </div>
    </div>
  );
}