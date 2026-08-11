import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, MessageSquare, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", to: "/", icon: Home },
  { label: "Search", to: "/doctors", icon: Search },
  { label: "Appointments", to: "/app/appointments", icon: CalendarDays },
  { label: "Messages", to: "/app/messages", icon: MessageSquare },
  { label: "Profile", to: "/app", icon: User },
] as const;

/** Mobile-only bottom navigation — the app-like primary navigation on phones. */
export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname === item.to;
          return (
            <li key={item.label}>
              <Link
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[0.68rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
