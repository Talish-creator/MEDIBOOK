import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { PortalLayout, type PortalNavItem } from "@/components/layout/PortalLayout";

const items: PortalNavItem[] = [
  { label: "Dashboard", to: "/admin", icon: <LayoutDashboard className="size-4" /> },
];

export const Route = createFileRoute("/admin")({
  component: () => (
    <PortalLayout role="admin" items={items}>
      <Outlet />
    </PortalLayout>
  ),
});
