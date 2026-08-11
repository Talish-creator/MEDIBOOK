import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Award,
  Bell,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Globe,
  HeartHandshake,
  HelpCircle,
  Hospital,
  LifeBuoy,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Stethoscope,
  Tag,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserX,
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
import type { Doctor, VerificationStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — MediBook" },
      {
        name: "description",
        content: "Platform-wide metrics, doctor verification, payments and moderation.",
      },
      { property: "og:title", content: "Admin dashboard — MediBook" },
      {
        property: "og:description",
        content: "Platform-wide metrics, doctor verification, payments and moderation.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { verification = {}, appointments = [], reviews = [] } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [selectedVerificationFilter, setSelectedVerificationFilter] = useState<string>("All");

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

  // Doctor list with verification overrides
  const doctorsList = useMemo(() => {
    return ref.doctors.map((d) => ({
      ...d,
      verificationStatus: verification[d.id] ?? d.verification ?? "Pending",
    }));
  }, [verification]);

  // Pending Doctor Verifications
  const pendingDoctors = useMemo(() => {
    return doctorsList.filter(
      (d) => d.verificationStatus === "Pending" || d.verificationStatus === "Under Review",
    );
  }, [doctorsList]);

  // Filtered Verification list
  const filteredVerificationDoctors = useMemo(() => {
    let list = doctorsList;
    if (selectedVerificationFilter !== "All") {
      list = list.filter((d) => d.verificationStatus === selectedVerificationFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          specialtyName(d.specialtyId).toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q),
      );
    }
    return list.slice(0, 8);
  }, [doctorsList, selectedVerificationFilter, searchQuery]);

  // Handle Verification Status Action
  const handleVerificationAction = (docId: string, docName: string, status: VerificationStatus) => {
    toast.success(`Updated ${docName} verification to "${status}"`);
  };

  return (
    <div className="space-y-8">
      {/* 1. WELCOME & SYSTEM STATUS HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>{todayFormattedDate}</span>
            <span>·</span>
            <span>Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            {greetingTime}, Admin
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Here's what's happening across MediBook today.
          </p>
        </div>

        {/* Platform Status Card */}
        <div className="surface-panel p-3 px-4 rounded-2xl flex items-center gap-3 border border-border bg-card">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div className="text-xs">
            <span className="font-bold text-foreground block">All Systems Operational</span>
            <span className="text-[10px] text-muted-foreground">
              Appointments · Payments · Video · Encrypted Messaging
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN KPI CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {[
          {
            label: "TOTAL PATIENTS",
            val: "24,582",
            sub: "+8.4%",
            icon: Users,
            color: "text-blue-600",
          },
          {
            label: "TOTAL DOCTORS",
            val: "1,284",
            sub: "+4.2%",
            icon: Stethoscope,
            color: "text-primary",
          },
          {
            label: "VERIFIED DOCTORS",
            val: "1,126",
            sub: "87.7% verified",
            icon: ShieldCheck,
            color: "text-emerald-600",
          },
          {
            label: "PENDING REVIEW",
            val: "27",
            sub: "Needs action",
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "APPOINTMENTS TODAY",
            val: "384",
            sub: "+6.2%",
            icon: Calendar,
            color: "text-purple-600",
          },
          {
            label: "TOTAL CLINICS",
            val: "428",
            sub: "+12 this mo",
            icon: Building2,
            color: "text-teal-600",
          },
          {
            label: "MONTHLY REVENUE",
            val: "SAR 428.6K",
            sub: "+12.4%",
            icon: DollarSign,
            color: "text-emerald-600",
          },
          {
            label: "OPEN TICKETS",
            val: "18",
            sub: "5 urgent",
            icon: LifeBuoy,
            color: "text-red-500",
          },
        ].map((kpi) => {
          const IconComp = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="surface-panel p-3.5 rounded-3xl space-y-1.5 border border-border"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[9px] font-bold tracking-wider truncate">{kpi.label}</span>
                <IconComp className={cn("h-3.5 w-3.5 shrink-0", kpi.color)} />
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {kpi.val}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 3. QUICK ACTIONS BAR */}
      <div className="surface-panel p-5 rounded-3xl border border-border space-y-3">
        <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
          Administrative Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <Button
            variant="outline"
            onClick={() => toast.info("Navigating to Doctor Verification Queue")}
            className="rounded-2xl h-10 justify-start gap-2 text-xs font-semibold"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Review Doctors</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => toast.info("Navigating to Patient Management")}
            className="rounded-2xl h-10 justify-start gap-2 text-xs font-semibold"
          >
            <Users className="h-4 w-4 text-blue-600" />
            <span>Manage Patients</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => toast.info("Navigating to Appointments Audit")}
            className="rounded-2xl h-10 justify-start gap-2 text-xs font-semibold"
          >
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>View Appointments</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => toast.info("Navigating to Payments Audit")}
            className="rounded-2xl h-10 justify-start gap-2 text-xs font-semibold"
          >
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <span>Review Payments</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => toast.info("Navigating to Reviews Moderation")}
            className="rounded-2xl h-10 justify-start gap-2 text-xs font-semibold"
          >
            <Star className="h-4 w-4 text-amber-500" />
            <span>Moderate Reviews</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => toast.info("Navigating to Offers Management")}
            className="rounded-2xl h-10 justify-start gap-2 text-xs font-semibold"
          >
            <Tag className="h-4 w-4 text-rose-500" />
            <span>Manage Offers</span>
          </Button>
        </div>
      </div>

      {/* 4. DOCTOR VERIFICATION TABLE (PROMINENT SECTION) */}
      <div className="surface-panel p-6 rounded-3xl border border-border space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-foreground">Doctor Verification Queue</h3>
              <Badge className="bg-amber-500/10 text-amber-600 font-bold border-none text-[10px]">
                {pendingDoctors.length} Pending Approval
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Review credential submissions and license documentation before approving doctor
              profiles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                className="h-9 pl-9 pr-7 text-xs rounded-xl border-border bg-card"
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

            <select
              value={selectedVerificationFilter}
              onChange={(e) => setSelectedVerificationFilter(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Verification Table */}
        <div className="border border-border rounded-2xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-muted-foreground font-semibold uppercase border-b border-border">
                <tr>
                  <th className="p-3.5">Doctor</th>
                  <th className="p-3.5">Specialty</th>
                  <th className="p-3.5">Experience & City</th>
                  <th className="p-3.5">License</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium text-foreground">
                {filteredVerificationDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.photo}
                          alt={doc.name}
                          className="h-9 w-9 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-foreground block">{doc.name}</span>
                          <span className="text-[11px] text-muted-foreground">ID: {doc.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-primary">
                      {specialtyName(doc.specialtyId)}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {doc.years} yrs · {doc.city}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                      {doc.licenseNumber ?? "SCFHS-849201"}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        className={cn(
                          "text-[10px] font-bold border-none",
                          doc.verificationStatus === "Verified"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : doc.verificationStatus === "Pending"
                              ? "bg-amber-500/10 text-amber-600"
                              : doc.verificationStatus === "Under Review"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-red-500/10 text-red-600",
                        )}
                      >
                        {doc.verificationStatus}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerificationAction(doc.id, doc.name, "Verified")}
                          className="h-8 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerificationAction(doc.id, doc.name, "Rejected")}
                          className="h-8 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. APPOINTMENT ACTIVITY & REVENUE ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointment Activity Chart (7 cols) */}
        <div className="lg:col-span-7 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">Appointment Activity Trends</h3>
              <p className="text-xs text-muted-foreground">Platform-wide booking volume</p>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
              {(["7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all",
                    timeRange === r
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {[
              { label: "Mon", completed: 320, upcoming: 54, cancelled: 10 },
              { label: "Tue", completed: 384, upcoming: 42, cancelled: 8 },
              { label: "Wed", completed: 290, upcoming: 60, cancelled: 12 },
              { label: "Thu", completed: 410, upcoming: 30, cancelled: 15 },
              { label: "Fri", completed: 240, upcoming: 80, cancelled: 6 },
              { label: "Sat", completed: 190, upcoming: 40, cancelled: 4 },
              { label: "Sun", completed: 210, upcoming: 45, cancelled: 5 },
            ].map((bar) => {
              const max = 500;
              const compHeight = Math.round((bar.completed / max) * 120);
              const upHeight = Math.round((bar.upcoming / max) * 120);

              return (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
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
                  <span className="text-[11px] font-bold text-muted-foreground">{bar.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-[11px] font-medium border-t border-border pt-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span>Completed (384 today)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500/60" />
              <span>Upcoming / Pending</span>
            </div>
          </div>
        </div>

        {/* Revenue Overview (5 cols) */}
        <div className="lg:col-span-5 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">Revenue by Service</h3>
              <p className="text-xs text-muted-foreground">SAR 428,650 monthly gross revenue</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 font-bold border-none text-[10px]">
              +12.4% vs last mo
            </Badge>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">In-Clinic Consultations</span>
                <span className="font-bold text-foreground">SAR 248,600 (58%)</span>
              </div>
              <Progress value={58} className="h-2 bg-secondary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Online Video Consultations</span>
                <span className="font-bold text-foreground">SAR 102,800 (24%)</span>
              </div>
              <Progress value={24} className="h-2 bg-secondary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Health Checkup Packages</span>
                <span className="font-bold text-foreground">SAR 51,400 (12%)</span>
              </div>
              <Progress value={12} className="h-2 bg-secondary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Other Diagnostic Services</span>
                <span className="font-bold text-foreground">SAR 25,850 (6%)</span>
              </div>
              <Progress value={6} className="h-2 bg-secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* 6. HEALTHCARE FACILITIES, ONLINE CONSULTATIONS & OFFERS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Facilities Summary */}
        <div className="surface-panel p-5 rounded-3xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Healthcare Facilities</h3>
            <Hospital className="h-4 w-4 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-muted-foreground block">Hospitals</span>
              <span className="text-lg font-bold text-foreground">84</span>
            </div>
            <div className="p-3 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-muted-foreground block">Clinics</span>
              <span className="text-lg font-bold text-foreground">428</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => toast.info("Opening Facilities Manager")}
            className="w-full rounded-2xl text-xs font-semibold"
          >
            Manage Facilities
          </Button>
        </div>

        {/* Online Consultations Monitor */}
        <div className="surface-panel p-5 rounded-3xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Online Consultations</h3>
            <Video className="h-4 w-4 text-blue-600" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-600 font-bold block">Active Now</span>
              <span className="text-base font-bold text-emerald-600">18</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-[10px] text-muted-foreground font-semibold block">Today</span>
              <span className="text-base font-bold text-foreground">142</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-[10px] text-muted-foreground font-semibold block">
                Completed
              </span>
              <span className="text-base font-bold text-foreground">118</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => toast.info("Viewing Live Video Sessions")}
            className="w-full rounded-2xl text-xs font-semibold"
          >
            Monitor Sessions
          </Button>
        </div>

        {/* Offers & Packages */}
        <div className="surface-panel p-5 rounded-3xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Offers & Packages</h3>
            <Tag className="h-4 w-4 text-rose-500" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-muted-foreground block">Active Offers</span>
              <span className="text-lg font-bold text-foreground">48</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-600 font-semibold block">Pending Approval</span>
              <span className="text-lg font-bold text-amber-600">6</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => toast.info("Opening Offers Management")}
            className="w-full rounded-2xl text-xs font-semibold"
          >
            Manage Offers
          </Button>
        </div>
      </div>

      {/* 7. RECENT REVIEWS MODERATION & SUPPORT TICKETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Review Moderation (6 cols) */}
        <div className="lg:col-span-6 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Reviews Awaiting Moderation</h3>
            <Badge variant="outline" className="text-[10px]">
              4 Pending
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                id: "rev-1",
                doc: "Dr. Sarah Ahmed",
                patient: "Ahmed K.",
                rating: 5,
                comment: "Extremely thorough examination and kind staff.",
              },
              {
                id: "rev-2",
                doc: "Dr. Layla Farouk",
                patient: "Fatima A.",
                rating: 5,
                comment: "Clear advice and minimal waiting time at the clinic.",
              },
            ].map((r) => (
              <div key={r.id} className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {r.patient} → <span className="text-primary">{r.doc}</span>
                  </span>
                  <div className="flex text-amber-500">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-[11px]">"{r.comment}"</p>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success("Review published.")}
                    className="h-7 text-[10px] font-bold text-emerald-600 rounded-lg"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info("Review hidden.")}
                    className="h-7 text-[10px] font-semibold text-red-600 rounded-lg"
                  >
                    Hide
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Tickets (6 cols) */}
        <div className="lg:col-span-6 surface-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Recent Support Tickets</h3>
            <Badge className="bg-red-500/10 text-red-600 font-bold border-none text-[10px]">
              18 Open (5 Urgent)
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                id: "TCK-104",
                subject: "Refund request for cancelled consultation",
                user: "Ahmed Khan",
                priority: "High",
              },
              {
                id: "TCK-103",
                subject: "Doctor verification document update error",
                user: "Dr. Sarah Ahmed",
                priority: "Medium",
              },
              {
                id: "TCK-102",
                subject: "Insurance card claim clarification",
                user: "Mohammed Ali",
                priority: "Normal",
              },
            ].map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-primary">{t.id}</span>
                    <Badge
                      className={cn(
                        "text-[9px] font-bold border-none",
                        t.priority === "High"
                          ? "bg-red-500/10 text-red-600"
                          : "bg-secondary text-foreground",
                      )}
                    >
                      {t.priority}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs text-foreground">{t.subject}</h4>
                  <p className="text-[10px] text-muted-foreground">From: {t.user}</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info(`Viewing ticket ${t.id}`)}
                  className="h-8 rounded-xl text-[11px] font-semibold"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
