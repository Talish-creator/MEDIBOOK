import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Clock, MapPin, Star, Video, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { findClinic, findDoctor, specialtyName, useStore } from "@/lib/store";
import {
  DAY_LABELS,
  currency,
  formatDate,
  formatShortDate,
  formatTime,
  generateSlots,
} from "@/lib/slots";
import type { Appointment } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/appointments")({
  head: () => ({
    meta: [
      { title: "My appointments — MediBook" },
      {
        name: "description",
        content:
          "Track upcoming, completed and cancelled appointments. Reschedule, cancel or review your doctors.",
      },
      { property: "og:title", content: "My appointments — MediBook" },
      { property: "og:description", content: "Your full appointment history in one timeline." },
    ],
  }),
  component: AppointmentsPage,
});

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-primary-soft text-primary-soft-foreground",
  confirmed: "bg-primary-soft text-primary-soft-foreground",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
  rescheduled: "bg-warning/20 text-warning-foreground",
};

function AppointmentsPage() {
  const store = useStore();
  const patientId = store.user?.linkedId ?? "";
  const mine = store.appointments
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const upcoming = mine.filter((a) => a.status === "upcoming" || a.status === "confirmed");
  const completed = mine.filter((a) => a.status === "completed");
  const cancelled = mine.filter((a) => a.status === "cancelled" || a.status === "rescheduled");

  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [review, setReview] = useState<Appointment | null>(null);

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Patient portal"
        title="My appointments"
        subtitle="Reschedule or cancel free of charge up to 4 hours before your visit."
        action={
          <Button asChild>
            <Link to="/doctors">Book new</Link>
          </Button>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>

        {[
          { key: "upcoming", list: upcoming, empty: "You have no upcoming appointments." },
          { key: "completed", list: completed, empty: "No completed visits yet." },
          { key: "cancelled", list: cancelled, empty: "Nothing cancelled — great!" },
        ].map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-5 space-y-4">
            {tab.list.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck className="size-6" />}
                title="Nothing here yet"
                description={tab.empty}
                actionLabel="Find a doctor"
                actionTo="/doctors"
              />
            ) : (
              tab.list.map((a) => {
                const doctor = findDoctor(a.doctorId)!;
                return (
                  <article key={a.id} className="surface-panel p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <img src={doctor.photo} alt="" className="size-16 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{doctor.name}</h2>
                          <Badge className={cn("capitalize", STATUS_STYLES[a.status])}>
                            {a.status}
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {a.type.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-primary">{specialtyName(doctor.specialtyId)}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5" /> {formatDate(a.date)} ·{" "}
                            {formatTime(a.time)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {a.type === "in-clinic"
                              ? findClinic(a.clinicId)?.name
                              : "Online consultation"}
                          </span>
                          <span>For {a.forName}</span>
                          <span>
                            {currency(a.fee)} · {a.paymentStatus}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {a.reason}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-col">
                        {(a.status === "upcoming" || a.status === "confirmed") && (
                          <>
                            {a.type !== "in-clinic" && (
                              <Button asChild size="sm">
                                <Link
                                  to="/app/consult/$appointmentId"
                                  params={{ appointmentId: a.id }}
                                >
                                  <Video className="size-4" /> Join call
                                </Link>
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => setReschedule(a)}>
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => {
                                store.cancelAppointment(a.id);
                                toast.success("Appointment cancelled and refund initiated.");
                              }}
                            >
                              <X className="size-4" /> Cancel
                            </Button>
                          </>
                        )}
                        {a.status === "completed" && (
                          <>
                            <Button asChild size="sm" variant="outline">
                              <Link to="/app/prescriptions">Prescription</Link>
                            </Button>
                            {!a.reviewed && (
                              <Button size="sm" onClick={() => setReview(a)}>
                                <Star className="size-4" /> Review
                              </Button>
                            )}
                            <Button asChild size="sm" variant="ghost">
                              <Link to="/book/$doctorId" params={{ doctorId: doctor.id }}>
                                Book again
                              </Link>
                            </Button>
                          </>
                        )}
                        {a.status === "cancelled" && (
                          <Button asChild size="sm" variant="outline">
                            <Link to="/book/$doctorId" params={{ doctorId: doctor.id }}>
                              Rebook
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>

      {reschedule && (
        <RescheduleDialog appointment={reschedule} onClose={() => setReschedule(null)} />
      )}
      {review && <ReviewDialog appointment={review} onClose={() => setReview(null)} />}
    </div>
  );
}

function RescheduleDialog({
  appointment,
  onClose,
}: {
  appointment: Appointment;
  onClose: () => void;
}) {
  const store = useStore();
  const doctor = findDoctor(appointment.doctorId)!;
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState("");
  const week = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().slice(0, 10), weekday: d.getDay() };
  });
  const slots = generateSlots(doctor, appointment.clinicId, date, store.appointments);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reschedule with {doctor.name}</DialogTitle>
          <DialogDescription>Pick a new date and time. No extra charge applies.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {week.map((d) => (
            <button
              key={d.date}
              onClick={() => {
                setDate(d.date);
                setTime("");
              }}
              className={cn(
                "min-w-[70px] rounded-xl border p-2.5 text-center text-xs",
                date === d.date
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              <span className="block font-medium">{DAY_LABELS[d.weekday]}</span>
              <span className="mt-0.5 block font-bold">{formatShortDate(d.date)}</span>
            </button>
          ))}
        </div>
        {slots.length === 0 ? (
          <p className="rounded-xl bg-surface p-5 text-center text-sm text-muted-foreground">
            No availability on this date.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <Button
                key={s.time}
                size="sm"
                variant={time === s.time ? "default" : "outline"}
                disabled={!s.available}
                onClick={() => setTime(s.time)}
                className={cn(!s.available && "line-through opacity-50")}
              >
                {formatTime(s.time)}
              </Button>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Keep current time
          </Button>
          <Button
            disabled={!time}
            onClick={() => {
              store.rescheduleAppointment(appointment.id, date, time);
              toast.success(`Moved to ${formatDate(date)} at ${formatTime(time)}`);
              onClose();
            }}
          >
            Confirm new time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const CATEGORIES = ["behaviour", "waiting", "cleanliness", "staff", "treatment"] as const;

function ReviewDialog({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const store = useStore();
  const doctor = findDoctor(appointment.doctorId)!;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [cats, setCats] = useState<Record<string, number>>({
    behaviour: 5,
    waiting: 4,
    cleanliness: 5,
    staff: 5,
    treatment: 5,
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review {doctor.name}</DialogTitle>
          <DialogDescription>
            Only patients with a completed visit can review — your review is marked verified.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label>Overall rating</Label>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star
                  className={cn(
                    "size-7",
                    n <= rating ? "fill-warning text-warning" : "text-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <div key={c}>
              <Label className="text-xs capitalize">{c}</Label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCats((p) => ({ ...p, [c]: n }))}
                    aria-label={`${c} ${n}`}
                  >
                    <Star
                      className={cn(
                        "size-4",
                        n <= (cats[c] ?? 0)
                          ? "fill-warning text-warning"
                          : "text-muted-foreground/40",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="comment">Your experience</Label>
          <Textarea
            id="comment"
            value={comment}
            maxLength={600}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Was the doctor clear? How was the waiting time and the clinic?"
            className="mt-2 min-h-24"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (comment.trim().length < 10) {
                toast.error("Please write at least a sentence.");
                return;
              }
              store.addReview({
                doctorId: doctor.id,
                appointmentId: appointment.id,
                rating,
                categories: {
                  behaviour: cats["behaviour"] ?? 5,
                  waiting: cats["waiting"] ?? 5,
                  cleanliness: cats["cleanliness"] ?? 5,
                  staff: cats["staff"] ?? 5,
                  treatment: cats["treatment"] ?? 5,
                },
                comment: comment.trim(),
              });
              toast.success("Thank you — your review is pending moderation.");
              onClose();
            }}
          >
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
