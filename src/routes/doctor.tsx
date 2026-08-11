import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { PortalLayout, type PortalNavItem } from "@/components/layout/PortalLayout";

const items: PortalNavItem[] = [
  { label: "Dashboard", to: "/doctor", icon: <LayoutDashboard className="size-4" /> },
];

export const Route = createFileRoute("/doctor")({
  component: () => (
    <PortalLayout role="doctor" items={items}>
      <Outlet />
    </PortalLayout>
  ),
});
