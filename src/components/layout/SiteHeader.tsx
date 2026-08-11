import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun, LayoutDashboard, LogOut, Bell } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Find Doctors", to: "/doctors" },
  { label: "Specialties", to: "/specialties" },
  { label: "Hospitals & Clinics", to: "/clinics" },
  { label: "Online Consultation", to: "/online-consultation" },
  { label: "Health Articles", to: "/articles" },
  { label: "Offers", to: "/offers" },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useStore();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={className}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function SiteHeader() {
  const { user, logout, notifications } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read && n.userId === user?.id).length;
  const home = user?.role === "admin" ? "/admin" : user?.role === "doctor" ? "/doctor" : "/app";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="hidden min-w-0 items-center justify-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith(item.to) && "bg-accent text-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle className="hidden sm:inline-flex" />
          {user ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative hidden sm:inline-flex"
              >
                <Link to="/app/notifications" aria-label="Notifications">
                  <Bell className="size-4" />
                  {unread > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 size-4 justify-center rounded-full p-0 text-[0.6rem]">
                      {unread}
                    </Badge>
                  )}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 transition-colors hover:bg-accent">
                    <Avatar className="size-7">
                      <AvatarImage src={user.avatar} alt="" />
                      <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-24 truncate text-sm font-medium sm:block">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild>
                    <Link to={home}>
                      <LayoutDashboard className="size-4" /> My dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth" search={{ mode: "login" }}>
                  Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Sign Up
                </Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-6">
              <SheetTitle className="mb-6">
                <Logo />
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                <ThemeToggle className="self-start" />
                {user ? (
                  <>
                    <Button asChild>
                      <Link to={home}>My dashboard</Link>
                    </Button>
                    <Button variant="outline" onClick={logout}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild>
                      <Link to="/auth" search={{ mode: "signup" }}>
                        Create account
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/auth" search={{ mode: "login" }}>
                        Login
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
