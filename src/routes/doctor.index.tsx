import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Award,
  Bell,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  Filter,
  Heart,
  HelpCircle,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, ref, specialtyName } from "@/lib/store";
import type { Appointment, Doctor } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor/")({
  head: () => ({
    meta: [
      { title: "Doctor dashboard — MediBook" },
      {
        name: "description",
        content: "Your practice at a glance: today's schedule, patients and earnings.",
      },
      { property: "og:title", content: "Doctor dashboard — MediBook" },
      {
        property: "og:description",
        content: "Your practice at a glance: today's schedule, patients and earnings.",
      },
    ],
  }),
  component: DoctorDashboardPage,
});

function DoctorDashboardPage() {
  const { user, appointments = [], messages = [], reviews = [], setAppointmentStatus } = useStore();

  const [availabilityStatus, setAvailabilityStatus] = useState<
    "Available" | "Busy" | "Away" | "Offline"
  >("Available");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Determine current doctor identity (Default to doc-3 Dr. Sarah Ahmed if not logged in as doctor)
  const doctorId = user?.role === "doctor" ? user.linkedId : "doc-3";
  const doctor = useMemo(() => {
    return ref.doctors.find((d) => d.id === doctorId) ?? ref.doctors[2]!;
  }, [doctorId]);

  // Dynamic Greeting based on time of day
  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Today's Formatted Date string
  const todayFormattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  // Doctor's Appointments
  const doctorAppointments = useMemo(() => {
    return (appointments || []).filter((a) => a && a.doctorId === doctor.id);
  }, [appointments, doctor.id]);

  // Today's Appointments (or fallback demo appointments for doc-3)
  const todaysAppointments = useMemo(() => {
    return doctorAppointments.filter((a) => a.date === "2026-08-11" || a.date.includes("2026-08"));
  }, [doctorAppointments]);

  // Filtered Appointments list
  const filteredTodaysAppointments = useMemo(() => {
    let list = todaysAppointments;
    if (selectedFilter === "confirmed") list = list.filter((a) => a.status === "confirmed");
    if (selectedFilter === "pending")
      list = list.filter((a) => a.status === "upcoming" || a.status === "rescheduled");
    if (selectedFilter === "completed") list = list.filter((a) => a.status === "completed");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.forName.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q),
      );
    }
    return list;
  }, [todaysAppointments, selectedFilter, searchQuery]);

  // Next Upcoming Appointment Callout
  const nextAppointment = useMemo(() => {
    return (
      todaysAppointments.find((a) => a.status === "confirmed" || a.status === "upcoming") ??
      todaysAppointments[0] ??
      null
    );
  }, [todaysAppointments]);

  // Doctor Reviews
  const doctorReviews = useMemo(() => {
    return (reviews || []).filter((r) => r && r.doctorId === doctor.id);
  }, [reviews, doctor.id]);

  // KPI Statistics
  const stats = useMemo(() => {
    const todaysCount = todaysAppointments.length || 12;
    const todaysPatients = new Set(todaysAppointments.map((a) => a.patientId)).size || 9;
    const todaysEarnings =
      todaysAppointments.reduce((acc, curr) => acc + (curr.fee || 150), 0) || 1850;
    const totalPatients = doctor.patientsTreated || 1284;
    const pendingCount = doctorAppointments.filter((a) => a.status === "upcoming").length || 4;
    const rating = doctor.rating || 4.9;

    return {
      todaysCount,
      todaysPatients,
      todaysEarnings,
      totalPatients,
      pendingCount,
      rating,
    };
  }, [todaysAppointments, doctorAppointments, doctor]);

  const handleStatusChange = (aptId: string, newStatus: Appointment["status"]) => {
    setAppointmentStatus(aptId, newStatus);
    toast.success(`Updated appointment status to ${newStatus}`);
  };

  return (
    <div className="space-y-8">
      {/* 1. WELCOME & HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>{todayFormattedDate}</span>
            <span>·</span>
            <span>Doctor Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            {greetingTime}, {doctor.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Here's what's happening with your practice today.
          </p>
        </div>

        {/* Availability Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="surface-panel p-2.5 px-4 rounded-2xl flex items-center gap-2 border border-border bg-card">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full animate-pulse",
                availabilityStatus === "Available"
                  ? "bg-emerald-500"
                  : availabilityStatus === "Busy"
                    ? "bg-amber-500"
                    : availabilityStatus === "Away"
                      ? "bg-blue-500"
                      : "bg-muted-foreground",
              )}
            />
            <select
              value={availabilityStatus}
              onChange={(e) => {
                const val = e.target.value as typeof availabilityStatus;
                setAvailabilityStatus(val);
                toast.success(`Availability set to ${val}`);
              }}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="Available">Available for appointments</option>
              <option value="Busy">Busy (In consultation)</option>
              <option value="Away">Away from clinic</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY KPI CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Today's appointments",
            val: stats.todaysCount,
            sub: "+3 from yesterday",
            icon: CalendarCheck,
            color: "text-primary",
          },
          {
            label: "Today's patients",
            val: stats.todaysPatients,
            sub: "9 consultations",
            icon: Users,
            color: "text-blue-600",
          },
          {
            label: "Today's earnings",
            val: `SAR ${stats.todaysEarnings.toLocaleString()}`,
            sub: "+12.4% vs avg",
            icon: DollarSign,
            color: "text-emerald-600",
          },
          {
            label: "Total patients",
            val: stats.totalPatients.toLocaleString(),
            sub: "Active patients",
            icon: UserCheck,
            color: "text-purple-600",
          },
          {
            label: "Pending requests",
            val: stats.pendingCount,
            sub: "Requires action",
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Average rating",
            val: `${stats.rating} ★`,
            sub: `${doctor.reviewCount || 428} reviews`,
            icon: Star,
            color: "text-amber-500",
          },
        ].map((kpi) => {
          const IconComp = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="surface-panel p-4 rounded-3xl space-y-2 border border-border"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold truncate">{kpi.label}</span>
                <IconComp className={cn("h-4 w-4 shrink-0", kpi.color)} />
              </div>
              <p className="text-xl font-bold text-foreground tracking-tight">{kpi.val}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 3. NEXT APPOINTMENT & QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Appointment Prominent Callout (7 cols) */}
        <div className="lg:col-span-7 surface-panel p-6 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary-soft/30 to-card space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1 rounded-full">
              Next Appointment
            </Badge>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Clock className="h-4 w-4 animate-spin-slow" />
              <span>Starts in 42 minutes · 11:30 AM</span>
            </div>
          </div>

          {nextAppointment ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-lg">
                  {nextAppointment.forName.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground">{nextAppointment.forName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {nextAppointment.reason} ·{" "}
                    <span className="font-semibold text-foreground capitalize">
                      {nextAppointment.type.replace("-", " ")}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Fee: SAR {nextAppointment.fee} · Paid online
                  </p>
                </div>
              </div>

              <div className="flex gap-2 self-end sm:self-center">
                {nextAppointment.type !== "in-clinic" ? (
                  <Link
                    to="/app/consult/$appointmentId"
                    params={{ appointmentId: nextAppointment.id }}
                    className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 gap-2"
                  >
                    <Video className="h-4 w-4" />
                    <span>Start Consultation</span>
                  </Link>
                ) : (
                  <Button
                    onClick={() => toast.success(`Opened details for ${nextAppointment.forName}`)}
                    className="rounded-2xl px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground shadow-xs"
                  >
                    Open Appointment
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No upcoming appointments right now.</p>
          )}
        </div>

        {/* Quick Actions (5 cols) */}
        <div className="lg:col-span-5 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <h3 className="font-bold text-sm text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <Button
              variant="outline"
              onClick={() => toast.info("Opening Add Appointment Modal")}
              className="rounded-2xl h-11 justify-start gap-2 text-xs font-semibold"
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>+ Add appointment</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info("Navigating to Calendar")}
              className="rounded-2xl h-11 justify-start gap-2 text-xs font-semibold"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>View calendar</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info("Opening Add Patient Modal")}
              className="rounded-2xl h-11 justify-start gap-2 text-xs font-semibold"
            >
              <UserPlus className="h-4 w-4 text-purple-600" />
              <span>Add patient</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info("Navigating to Prescriptions")}
              className="rounded-2xl h-11 justify-start gap-2 text-xs font-semibold"
            >
              <FileCheck className="h-4 w-4 text-emerald-600" />
              <span>Write prescription</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. TODAY'S SCHEDULE & SEARCH LIST */}
      <div className="surface-panel p-6 rounded-3xl border border-border space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground">Today's Schedule & Appointments</h3>
            <p className="text-xs text-muted-foreground">
              Review, accept, or start consultations for your scheduled patients today.
            </p>
          </div>

          {/* Search & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name or ID..."
                className="h-10 pl-9 pr-8 text-xs rounded-xl border-border bg-card"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-secondary/80 p-1 border border-border">
              {["all", "confirmed", "pending", "completed"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedFilter(tab)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[11px] font-bold capitalize transition-all",
                    selectedFilter === tab
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Table / Cards */}
        {filteredTodaysAppointments.length > 0 ? (
          <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-card">
            {filteredTodaysAppointments.map((apt, i) => {
              const times = [
                "09:00 AM",
                "10:30 AM",
                "11:30 AM",
                "01:00 PM",
                "04:30 PM",
                "06:00 PM",
              ];
              const displayTime = apt.time ? apt.time : times[i % times.length]!;

              return (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center h-12 w-16 rounded-xl bg-secondary text-center shrink-0 border border-border">
                      <span className="text-xs font-bold text-foreground">{displayTime}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-foreground">{apt.forName}</h4>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {apt.type}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-[10px] font-bold border-none",
                            apt.status === "confirmed"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : apt.status === "completed"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-amber-500/10 text-amber-600",
                          )}
                        >
                          {apt.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Reason: <span className="font-medium text-foreground">{apt.reason}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Fee: SAR {apt.fee} · {apt.paymentStatus}
                      </p>
                    </div>
                  </div>

                  {/* Contextual Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {apt.status === "upcoming" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(apt.id, "confirmed")}
                          className="rounded-xl text-xs font-bold bg-primary text-primary-foreground h-9 px-3"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(apt.id, "cancelled")}
                          className="rounded-xl text-xs font-semibold h-9 px-3 text-red-600 hover:bg-red-50"
                        >
                          Decline
                        </Button>
                      </>
                    ) : apt.status === "confirmed" ? (
                      <>
                        {apt.type !== "in-clinic" ? (
                          <Button
                            asChild
                            size="sm"
                            className="rounded-xl text-xs font-bold bg-primary text-primary-foreground h-9 px-3 gap-1"
                          >
                            <Link
                              to="/app/consult/$appointmentId"
                              params={{ appointmentId: apt.id }}
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>Start</span>
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(apt.id, "completed")}
                            className="rounded-xl text-xs font-semibold h-9 px-3"
                          >
                            Complete Visit
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info(`Viewing record for ${apt.forName}`)}
                        className="rounded-xl text-xs font-semibold h-9 px-3"
                      >
                        View Record
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2 border border-border rounded-2xl bg-card">
            <CalendarCheck className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="font-bold text-foreground text-sm">No appointments found</p>
            <p>No appointments match your search criteria for today.</p>
          </div>
        )}
      </div>

      {/* 5. PRACTICE ANALYTICS & EARNINGS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Appointment Activity Chart (7 cols) */}
        <div className="lg:col-span-7 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">Appointment Activity (7 Days)</h3>
              <p className="text-xs text-muted-foreground">Weekly distribution of consultations</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              This Week
            </Badge>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {[
              { day: "Mon", completed: 8, upcoming: 4, cancelled: 1 },
              { day: "Tue", completed: 10, upcoming: 2, cancelled: 0 },
              { day: "Wed", completed: 6, upcoming: 5, cancelled: 1 },
              { day: "Thu", completed: 9, upcoming: 3, cancelled: 0 },
              { day: "Fri", completed: 7, upcoming: 4, cancelled: 1 },
              { day: "Sat", completed: 4, upcoming: 2, cancelled: 0 },
              { day: "Sun", completed: 5, upcoming: 3, cancelled: 0 },
            ].map((bar) => {
              const max = 15;
              const compHeight = Math.round((bar.completed / max) * 120);
              const upHeight = Math.round((bar.upcoming / max) * 120);

              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full max-w-[28px] bg-secondary rounded-xl overflow-hidden flex flex-col justify-end h-32 p-0.5 space-y-0.5">
                    <div
                      style={{ height: `${upHeight}px` }}
                      className="w-full bg-blue-500/40 rounded-t-sm transition-all"
                    />
                    <div
                      style={{ height: `${compHeight}px` }}
                      className="w-full bg-primary rounded-sm transition-all"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">{bar.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-[11px] font-medium border-t border-border pt-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500/60" />
              <span>Upcoming</span>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown (5 cols) */}
        <div className="lg:col-span-5 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">Monthly Earnings Overview</h3>
              <p className="text-xs text-muted-foreground">SAR 42,850 total revenue</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 font-bold border-none text-[10px]">
              +12.4% vs last mo
            </Badge>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">In-Clinic Consultations</span>
                <span className="font-bold text-foreground">SAR 28,400 (66%)</span>
              </div>
              <Progress value={66} className="h-2 bg-secondary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Online Consultations</span>
                <span className="font-bold text-foreground">SAR 11,250 (26%)</span>
              </div>
              <Progress value={26} className="h-2 bg-secondary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Other Medical Services</span>
                <span className="font-bold text-foreground">SAR 3,200 (8%)</span>
              </div>
              <Progress value={8} className="h-2 bg-secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* 6. RECENT MESSAGES, REVIEWS & DOCTOR PROFILE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Patient Messages (4 cols) */}
        <div className="lg:col-span-4 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Recent Messages</h3>
            <Badge variant="outline" className="text-[10px]">
              3 Unread
            </Badge>
          </div>

          <div className="space-y-3">
            {[
              {
                name: "Fatima Ahmed",
                msg: "Doctor, I wanted to ask about the rash cream...",
                time: "5 min ago",
              },
              {
                name: "Dr. Omar Hassan",
                msg: "Thank you doctor, the report is attached.",
                time: "1 hour ago",
              },
              {
                name: "Khalid Al-Mansoor",
                msg: "Will see you tomorrow at 4:30 PM.",
                time: "3 hours ago",
              },
            ].map((m) => (
              <div
                key={m.name}
                className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border/70"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary font-bold text-xs">
                  {m.name.charAt(0)}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-xs text-foreground">{m.name}</h4>
                    <span className="text-[10px] text-muted-foreground">{m.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{m.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Patient Reviews (4 cols) */}
        <div className="lg:col-span-4 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Patient Reviews</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
              <span>4.9 / 5</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {doctorReviews.slice(0, 2).map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-2xl bg-card border border-border/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{r.patientName}</span>
                  <div className="flex text-amber-500">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3 w-3 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  "{r.comment}"
                </p>
                <span className="text-[10px] text-muted-foreground block">
                  {r.date} · Verified Patient
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Profile Completion Card (4 cols) */}
        <div className="lg:col-span-4 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <h3 className="font-bold text-sm text-foreground">Doctor Profile</h3>

          <div className="flex items-center gap-3.5">
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="h-14 w-14 rounded-2xl object-cover"
            />
            <div>
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
                <span>{doctor.name}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              </h4>
              <p className="text-xs text-primary font-semibold">
                {specialtyName(doctor.specialtyId)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {doctor.years} years exp · {doctor.city}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-3 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="text-primary font-bold">92%</span>
            </div>
            <Progress value={92} className="h-2 bg-secondary" />
            <p className="text-[11px] text-muted-foreground">
              Missing: Additional clinic schedule blocks.
            </p>

            <Button
              onClick={() => toast.info("Opening Profile Settings")}
              className="w-full rounded-2xl text-xs font-bold bg-primary text-primary-foreground mt-2"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
