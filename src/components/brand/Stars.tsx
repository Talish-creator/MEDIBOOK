import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const px = size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-3.5";
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            px,
            i <= Math.round(value) ? "fill-warning text-warning" : "text-muted-foreground/35",
          )}
        />
      ))}
    </span>
  );
}
