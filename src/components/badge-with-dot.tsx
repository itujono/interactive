import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeWithDotProps {
  kind?: "success" | "warning" | "error" | "default";
  className?: string;
}

export default function BadgeWithDot({ kind = "default", className }: BadgeWithDotProps) {

  const dotClassName = cn("size-1.5 rounded-full", {
    "bg-emerald-500": kind === "success",
    "bg-amber-500": kind === "warning",
    "bg-red-500": kind === "error",
    "bg-gray-500": kind === "default",
  });

  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={dotClassName} aria-hidden="true"></span>
      Badge
    </Badge>
  );
}
