import { LoaderIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export function SpinnerV2({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <Spinner className={cn(className)} />
    </div>
  )
}