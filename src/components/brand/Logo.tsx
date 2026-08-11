import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105">
        <Activity className="size-5" strokeWidth={2.6} />
      </span>
      {!compact && (
        <span className="font-display text-[1.35rem] leading-none font-bold tracking-tight">
          Medi<span className="text-primary">Book</span>
        </span>
      )}
    </Link>
  );
}
