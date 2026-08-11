import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  Building2,
  CalendarDays,
  Clock,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Stars } from "@/components/brand/Stars";
import { findClinic, ref, specialtyName, useStore } from "@/lib/store";
import { DAY_LABELS, currency, formatShortDate, formatTime, generateSlots } from "@/lib/slots";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctors/$doctorId")({
  loader: ({ params }) => {
    const doctor = ref.doctors.find((d) => d.id === params.doctorId);
    if (!doctor) throw notFound();
    return { name: doctor.name, specialty: specialtyName(doctor.specialtyId), photo: doctor.photo };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Doctor unavailable — MediBook" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — ${loaderData.specialty} | MediBook`;
    const description = `Book an appointment with ${loaderData.name}, ${loaderData.specialty}. See qualifications, clinics, fees, live availability and verified patient reviews.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Doctor not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This profile may have been removed or suspended.
        </p>
        <Button asChild className="mt-6">
          <Link to="/doctors">Browse all doctors</Link>
        </Button>
      </div>
    </PublicLayout>
  ),
  errorComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">Something went wrong. Please try again.</h1>
      </div>
    </PublicLayout>
  ),
  component: DoctorProfile,
});

function DoctorProfile() {
  const { doctorId } = Route.useParams();
  const { appointments, reviews, favorites, toggleFavorite, verification } = useStore();
  const doctor = ref.doctors.find((d) => d.id === doctorId)!;
  const specialty = specialtyName(doctor.specialtyId);
  const verified = (verification[doctor.id] ?? doctor.verification) === "Verified";
  const isFav = favorites.includes(doctor.id);

  const [clinicId, setClinicId] = useState(doctor.clinics[0]!.clinicId);
  const [dayOffset, setDayOffset] = useState(0);

  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return { offset: i, date: d.toISOString().slice(0, 10), weekday: d.getDay() };
      }),
    [],
  );
  const activeDate = week[dayOffset]!.date;
  const slots = generateSlots(doctor, clinicId, activeDate, appointments);

  const doctorReviews = reviews.filter((r) => r.doctorId === doctor.id && r.status === "published");
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: doctorReviews.filter((r) => r.rating === star).length,
  }));

  return (
    <PublicLayout>
      {/* Header */}
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row">
              <img
                src={doctor.photo}
                alt={`Portrait of ${doctor.name}`}
                className="size-28 rounded-3xl object-cover shadow-[var(--shadow-card)] sm:size-36"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold sm:text-3xl">{doctor.name}</h1>
                  {verified && (
                    <Badge className="gap-1 bg-primary-soft text-primary-soft-foreground">
                      <ShieldCheck className="size-3.5" /> Verified
                    </Badge>
                  )}
                </div>
                <p className="mt-1 font-medium text-primary">{specialty}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {doctor.qualifications.join(", ")} · {doctor.years} years experience
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Stars value={doctor.rating} size="md" />
                    <span className="font-semibold">{doctor.rating}</span>
                    <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Languages className="size-4" /> {doctor.languages.join(", ")}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-4" /> {doctor.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="surface-panel w-full shrink-0 p-5 lg:w-80">
              <p className="text-xs text-muted-foreground">Consultation fee</p>
              <p className="text-2xl font-bold">{currency(doctor.fee)}</p>
              {doctor.onlineConsultation && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Online consultation {currency(doctor.onlineFee)}
                </p>
              )}
              <div className="mt-4 space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link to="/book/$doctorId" params={{ doctorId: doctor.id }}>
                    Book Appointment
                  </Link>
                </Button>
                {doctor.onlineConsultation && (
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      to="/book/$doctorId"
                      params={{ doctorId: doctor.id }}
                      search={{ type: "video" }}
                    >
                      <Video className="size-4" /> Online Consultation
                    </Link>
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/app/messages">
                      <MessageSquare className="size-4" /> Message
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Save doctor"
                    onClick={() => toggleFavorite(doctor.id)}
                  >
                    <Heart className={cn("size-4", isFav && "fill-destructive text-destructive")} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="overview">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 sm:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="clinics">Clinics</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="surface-panel p-6">
              <h2 className="text-base font-semibold">About {doctor.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{doctor.about}</p>
              <Separator className="my-5" />
              <h3 className="text-sm font-semibold">Specializations</h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[specialty, ...doctor.subSpecialties].map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
              <Separator className="my-5" />
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Award className="size-4 text-primary" /> Awards
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {doctor.awards.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
              <h3 className="mt-5 text-sm font-semibold">Publications</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {doctor.publications.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="surface-panel p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <GraduationCap className="size-4 text-primary" /> Education
                </h2>
                <ul className="mt-4 space-y-4">
                  {doctor.education.map((e) => (
                    <li key={e.degree} className="border-l-2 border-primary/30 pl-4">
                      <p className="text-sm font-semibold">{e.degree}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.institute} · {e.year}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surface-panel p-6">
                <h2 className="text-base font-semibold">Experience</h2>
                <ul className="mt-4 space-y-4">
                  {doctor.experienceItems.map((e) => (
                    <li key={e.role} className="border-l-2 border-primary/30 pl-4">
                      <p className="text-sm font-semibold">{e.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.place} · {e.period}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-lg font-bold">{doctor.patientsTreated.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Patients treated</p>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-lg font-bold">{doctor.licenseNumber}</p>
                    <p className="text-xs text-muted-foreground">SCFHS license</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <div className="surface-panel divide-y divide-border">
              {doctor.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-4 p-5">
                  <p className="text-sm font-medium">{s.name}</p>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-bold">{currency(s.price)}</p>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/book/$doctorId" params={{ doctorId: doctor.id }}>
                        Book
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clinics" className="mt-6 grid gap-4 lg:grid-cols-2">
            {doctor.clinics.map((link) => {
              const clinic = findClinic(link.clinicId)!;
              return (
                <div key={link.clinicId} className="surface-panel overflow-hidden">
                  <img src={clinic.image} alt={clinic.name} className="h-40 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <Building2 className="size-4 text-primary" /> {clinic.name}
                    </h3>
                    <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" /> {clinic.address}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-3.5" /> {clinic.openingHours}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="size-3.5" /> {clinic.phone}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm font-bold">{currency(link.fee)}</p>
                      <Button asChild size="sm">
                        <Link to="/clinics/$clinicId" params={{ clinicId: clinic.id }}>
                          View clinic
                        </Link>
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Available on {link.days.map((d) => DAY_LABELS[d]).join(", ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            <div className="surface-panel p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <CalendarDays className="size-4 text-primary" /> Availability
                </h2>
                <select
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                  aria-label="Clinic"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {doctor.clinics.map((l) => (
                    <option key={l.clinicId} value={l.clinicId}>
                      {findClinic(l.clinicId)!.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {week.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setDayOffset(d.offset)}
                    className={cn(
                      "rounded-xl border p-3 text-center transition-colors",
                      dayOffset === d.offset
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="block text-xs font-medium">{DAY_LABELS[d.weekday]}</span>
                    <span className="mt-0.5 block text-sm font-bold">
                      {formatShortDate(d.date)}
                    </span>
                  </button>
                ))}
              </div>

              {slots.length === 0 ? (
                <p className="mt-6 rounded-xl bg-surface p-6 text-center text-sm text-muted-foreground">
                  No clinic hours on this day. Try another date or clinic.
                </p>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {slots.map((s) => (
                    <Button
                      key={s.time}
                      asChild={s.available}
                      variant={s.available ? "outline" : "ghost"}
                      disabled={!s.available}
                      className={cn(
                        "justify-center",
                        !s.available && "cursor-not-allowed text-muted-foreground/50 line-through",
                      )}
                    >
                      {s.available ? (
                        <Link
                          to="/book/$doctorId"
                          params={{ doctorId: doctor.id }}
                          search={{ date: activeDate, time: s.time, clinicId }}
                        >
                          {formatTime(s.time)}
                        </Link>
                      ) : (
                        <span>{formatTime(s.time)}</span>
                      )}
                    </Button>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Slots are 30 minutes. Struck-through times are already booked, held by another
                patient, or too close to now.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="surface-panel h-fit p-6">
              <p className="font-display text-4xl font-bold">{doctor.rating}</p>
              <Stars value={doctor.rating} size="lg" className="mt-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                Based on {doctorReviews.length} verified reviews
              </p>
              <div className="mt-5 space-y-2.5">
                {breakdown.map((b) => (
                  <div key={b.star} className="flex items-center gap-3">
                    <span className="flex w-8 items-center gap-1 text-xs">
                      {b.star} <Star className="size-3 fill-warning text-warning" />
                    </span>
                    <Progress
                      value={doctorReviews.length ? (b.count / doctorReviews.length) * 100 : 0}
                      className="h-2"
                    />
                    <span className="w-6 text-right text-xs text-muted-foreground">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {doctorReviews.length === 0 && (
                <p className="surface-panel p-6 text-sm text-muted-foreground">
                  No reviews yet for this doctor.
                </p>
              )}
              {doctorReviews.map((r) => (
                <div key={r.id} className="surface-panel p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{r.patientName}</p>
                    {r.verifiedVisit && (
                      <Badge variant="secondary" className="gap-1 text-[0.7rem]">
                        <ShieldCheck className="size-3" /> Verified visit
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <Stars value={r.rating} className="mt-2" />
                  <p className="mt-2.5 text-sm leading-relaxed">{r.comment}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Behaviour {r.categories.behaviour}/5</span>
                    <span>Waiting time {r.categories.waiting}/5</span>
                    <span>Cleanliness {r.categories.cleanliness}/5</span>
                    <span>Staff {r.categories.staff}/5</span>
                  </div>
                  {r.doctorReply && (
                    <div className="mt-4 rounded-xl bg-primary-soft p-4">
                      <p className="text-xs font-semibold text-primary-soft-foreground">
                        Reply from {doctor.name}
                      </p>
                      <p className="mt-1 text-sm">{r.doctorReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faqs" className="mt-6">
            <div className="surface-panel p-6">
              <Accordion type="single" collapsible>
                {[
                  {
                    q: `What is ${doctor.name}'s consultation fee?`,
                    a: `The in-clinic consultation fee is ${currency(doctor.fee)}${doctor.onlineConsultation ? ` and online consultations are ${currency(doctor.onlineFee)}` : ""}. Follow-up visits are charged at a reduced rate.`,
                  },
                  {
                    q: "Which languages does the doctor speak?",
                    a: doctor.languages.join(", "),
                  },
                  {
                    q: "Does the doctor accept insurance?",
                    a: `Yes — ${doctor.insurances.join(" and ")} are accepted. Bring your card and ID to the clinic.`,
                  },
                  {
                    q: "Can I reschedule or cancel?",
                    a: "Yes. You can reschedule or cancel free of charge up to 4 hours before the appointment from your MediBook dashboard, and refunds are issued automatically.",
                  },
                ].map((f) => (
                  <AccordionItem key={f.q} value={f.q}>
                    <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky mobile booking bar */}
      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{specialty}</p>
            <p className="text-sm font-bold">{currency(doctor.fee)}</p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/book/$doctorId" params={{ doctorId: doctor.id }}>
              Book Appointment
            </Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
