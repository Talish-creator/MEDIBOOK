import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  Bell,
  CalendarCheck,
  CreditCard,
  FileHeart,
  FolderOpen,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Users,
} from "lucide-react";
import { PortalLayout, type PortalNavItem } from "@/components/layout/PortalLayout";

const items: PortalNavItem[] = [
  { label: "Dashboard", to: "/app", icon: <LayoutDashboard className="size-4" /> },
  { label: "Appointments", to: "/app/appointments", icon: <CalendarCheck className="size-4" /> },
  { label: "Prescriptions", to: "/app/prescriptions", icon: <FileHeart className="size-4" /> },
  { label: "Medical records", to: "/app/records", icon: <FolderOpen className="size-4" /> },
  { label: "Family members", to: "/app/family", icon: <Users className="size-4" /> },
  { label: "Messages", to: "/app/messages", icon: <MessageSquare className="size-4" /> },
  { label: "Payments", to: "/app/payments", icon: <CreditCard className="size-4" /> },
  { label: "Saved doctors", to: "/app/saved", icon: <Heart className="size-4" /> },
  { label: "Notifications", to: "/app/notifications", icon: <Bell className="size-4" /> },
];

export const Route = createFileRoute("/app")({
  component: () => (
    <PortalLayout role="patient" items={items}>
      <Outlet />
    </PortalLayout>
  ),
});
