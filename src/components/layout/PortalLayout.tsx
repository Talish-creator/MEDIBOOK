import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./SiteHeader";
import { MobileNav } from "./MobileNav";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export interface PortalNavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

export function PortalLayout({
  role,
  items,
  children,
}: {
  role: Role;
  items: PortalNavItem[];
  children: ReactNode;
}) {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) void navigate({ to: "/auth", search: { mode: "login", redirect: pathname } });
    else if (user.role !== role) {
      void navigate({
        to: user.role === "admin" ? "/admin" : user.role === "doctor" ? "/doctor" : "/app",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  if (!user || user.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">Checking your session…</p>
        </div>
      </div>
    );
  }

  const sidebar = (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.to || (item.to !== `/${role}` && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] max-w-xs p-6">
                <SheetTitle className="mb-6">
                  <Logo />
                </SheetTitle>
                {sidebar}
              </SheetContent>
            </Sheet>
            <Logo />
            <span className="hidden rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-soft-foreground capitalize sm:block">
              {role} portal
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/">Main site</Link>
            </Button>
            <Avatar className="size-8">
              <AvatarImage src={user.avatar} alt="" />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={logout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">{sidebar}</div>
        </aside>
        <main className="min-w-0 flex-1 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="surface-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
          {icon}
        </span>
      </div>
    </div>
  );
}
