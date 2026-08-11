import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  FileHeart,
  FolderOpen,
  HeartPulse,
  Search,
  Video,
} from "lucide-react";
import { StatCard } from "@/components/layout/PortalLayout";
import { EmptyState, PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { findDoctor, ref, specialtyName, useStore } from "@/lib/store";
import { currency, formatDate, formatTime } from "@/lib/slots";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Patient dashboard — MediBook" },
      {
        name: "description",
        content:
          "Your health at a glance: upcoming appointments, prescriptions, lab reports, payments and family profiles.",
      },
      { property: "og:title", content: "Patient dashboard — MediBook" },
      {
        property: "og:description",
        content: "Manage appointments, records and prescriptions in one place.",
      },
    ],
  }),
  component: PatientDashboard,
});

function PatientDashboard() {
  const store = useStore();
  const patientId = store.user?.linkedId ?? "";
  const mine = store.appointments.filter((a) => a.patientId === patientId);
  const upcoming = mine
    .filter((a) => a.status === "upcoming" || a.status === "confirmed")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const past = mine.filter((a) => a.status === "completed");
  const prescriptions = store.prescriptions.filter((p) => p.patientId === patientId);
  const records = store.records.filter((r) => r.patientId === patientId);
  const payments = store.payments.filter((p) => p.patientId === patientId);
  const spent = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const next = upcoming[0];
  const toReview = past.filter((a) => !a.reviewed);

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Patient portal"
        title={`Hello, ${store.user?.name.split(" ")[0] ?? "there"} 👋`}
        subtitle="Here's a summary of your care. Everything is private to your account."
        action={
          <Button asChild>
            <Link to="/doctors">
              <Search className="size-4" /> Find a doctor
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming appointments"
          value={String(upcoming.length)}
          hint={next ? `Next ${formatDate(next.date)}` : "Nothing booked"}
          icon={<CalendarCheck className="size-5" />}
        />
        <StatCard
          label="Active prescriptions"
          value={String(prescriptions.length)}
          hint="Digital & downloadable"
          icon={<FileHeart className="size-5" />}
        />
        <StatCard
          label="Medical records"
          value={String(records.length)}
          hint="Reports, scans & labs"
          icon={<FolderOpen className="size-5" />}
        />
        <StatCard
          label="Total spent"
          value={currency(spent)}
          hint={`${payments.length} transactions`}
          icon={<CreditCard className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Next appointment */}
          {next ? (
            <div className="surface-panel overflow-hidden">
              <div className="gradient-hero flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                    Next appointment
                  </p>
                  <p className="mt-1.5 text-lg font-bold">
                    {formatDate(next.date)} · {formatTime(next.time)}
                  </p>
                </div>
                <Badge className="capitalize">{next.type.replace("-", " ")}</Badge>
              </div>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <img
                  src={findDoctor(next.doctorId)?.photo}
                  alt=""
                  className="size-16 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{findDoctor(next.doctorId)?.name}</p>
                  <p className="text-sm text-primary">
                    {specialtyName(findDoctor(next.doctorId)!.specialtyId)}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    For {next.forName} · {next.reason}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {next.type !== "in-clinic" && (
                    <Button asChild size="sm">
                      <Link to="/app/consult/$appointmentId" params={{ appointmentId: next.id }}>
                        <Video className="size-4" /> Join
                      </Link>
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <Link to="/app/appointments">Manage</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<CalendarCheck className="size-6" />}
              title="No upcoming appointments"
              description="Search verified specialists and book a visit in under a minute."
              actionLabel="Find a doctor"
              actionTo="/doctors"
            />
          )}

          {/* Reviews pending */}
          {toReview.length > 0 && (
            <div className="surface-panel p-5">
              <h2 className="text-base font-semibold">Rate your recent visits</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your feedback helps other patients choose the right doctor.
              </p>
              <ul className="mt-4 space-y-3">
                {toReview.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-xl bg-surface p-3">
                    <img
                      src={findDoctor(a.doctorId)?.photo}
                      alt=""
                      className="size-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{findDoctor(a.doctorId)?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.date)}</p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/app/appointments">Write review</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent prescriptions */}
          <div className="surface-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Latest prescriptions</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/prescriptions">
                  View all <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {prescriptions.length === 0 ? (
              <p className="mt-4 rounded-xl bg-surface p-6 text-center text-sm text-muted-foreground">
                Prescriptions issued by your doctors will appear here.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {prescriptions.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                      <FileHeart className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">
                        {findDoctor(p.doctorId)?.name} · {formatDate(p.date)} · {p.items.length}{" "}
                        medicines
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Health snapshot */}
          <div className="surface-panel p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <HeartPulse className="size-4 text-primary" /> Health snapshot
            </h2>
            <div className="mt-4 space-y-4">
              {[
                { label: "Care plan progress", value: 72, note: "3 of 4 follow-ups done" },
                {
                  label: "Records completeness",
                  value: Math.min(100, records.length * 12),
                  note: `${records.length} documents uploaded`,
                },
                { label: "Preventive checks", value: 45, note: "Annual blood panel due" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{m.value}%</span>
                  </div>
                  <Progress value={m.value} className="mt-2 h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="surface-panel p-5">
            <h2 className="text-base font-semibold">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Upload report", to: "/app/records", icon: FolderOpen },
                { label: "Add family", to: "/app/family", icon: HeartPulse },
                { label: "Online visit", to: "/online-consultation", icon: Video },
                { label: "Payments", to: "/app/payments", icon: CreditCard },
              ].map((q) => (
                <Button
                  key={q.label}
                  asChild
                  variant="outline"
                  className="h-auto justify-start py-3"
                >
                  <Link to={q.to}>
                    <q.icon className="size-4 text-primary" /> {q.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Health tips */}
          <div className="surface-panel p-5">
            <h2 className="text-base font-semibold">Recommended reading</h2>
            <ul className="mt-4 space-y-3">
              {ref.articles.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link
                    to="/articles/$articleId"
                    params={{ articleId: a.id }}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent"
                  >
                    <img src={a.image} alt="" className="size-12 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.readingTime} min read</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
