import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileLock2,
  MapPin,
  MessageCircle,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Video,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/brand/Stars";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { ref, useStore } from "@/lib/store";
import { CITIES } from "@/lib/data/seed";
import { currency } from "@/lib/slots";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediBook — Find the Right Doctor. Book Your Appointment." },
      {
        name: "description",
        content:
          "Search trusted doctors, compare specialists, check availability and book your appointment in minutes across Saudi Arabia.",
      },
      { property: "og:title", content: "MediBook — Find the Right Doctor" },
      {
        property: "og:description",
        content:
          "Verified doctors, live availability, secure payments and online consultations — book in minutes.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  { title: "Search", text: "Find doctors by specialty, condition, clinic or city." },
  { title: "Compare", text: "Check experience, fees, ratings and real patient reviews." },
  { title: "Choose a Slot", text: "See live availability and pick a time that suits you." },
  { title: "Book", text: "Confirm and pay securely — instant confirmation with QR." },
  { title: "Meet Your Doctor", text: "Visit the clinic or join the consultation online." },
];

const trust = [
  {
    icon: ShieldCheck,
    title: "Verified doctors",
    text: "Every license is checked by our medical review team.",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    text: "PCI-compliant checkout with instant refunds on cancellation.",
  },
  {
    icon: FileLock2,
    title: "Private records",
    text: "Your medical data is encrypted and visible only to your doctor.",
  },
  {
    icon: CalendarDays,
    title: "Easy management",
    text: "Reschedule, cancel or rebook in two taps.",
  },
];

const testimonials = [
  {
    name: "Nouf A.",
    city: "Dammam",
    text: "I booked a dermatologist at 9pm and was seen the next morning. The whole flow took under two minutes.",
  },
  {
    name: "Faisal M.",
    city: "Riyadh",
    text: "The video consultation saved me a trip across the city, and the prescription arrived in the app instantly.",
  },
  {
    name: "Reem S.",
    city: "Jeddah",
    text: "Managing my parents' appointments from one account is the feature I did not know I needed.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const { appointments } = useStore();
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("Dammam");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const suggestions =
    q.length > 1
      ? [
          ...ref.specialties
            .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
            .map((s) => s.name),
          ...ref.doctors
            .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
            .map((d) => d.name),
        ].slice(0, 6)
      : [];

  const popularDoctors = ref.doctors
    .filter((d) => d.verification === "Verified")
    .slice()
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, 4);

  const submit = () => navigate({ to: "/doctors", search: { q, city, date } });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Badge variant="secondary" className="gap-1.5 bg-card px-3 py-1.5">
                <Sparkles className="size-3.5 text-primary" />
                12 specialties · 1,245 doctors · 6 cities
              </Badge>
              <h1 className="mt-5 text-[2.1rem] leading-[1.08] font-extrabold sm:text-5xl lg:text-[3.4rem]">
                Find the Right Doctor.{" "}
                <span className="text-gradient-brand">Book Your Appointment.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Search trusted doctors, compare specialists, check availability and book your
                appointment in minutes.
              </p>

              {/* Search component */}
              <div className="surface-panel relative mt-8 p-4 sm:p-5">
                <p className="text-sm font-semibold">What are you looking for?</p>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      placeholder="Doctor, specialty or condition"
                      className="h-12 pl-9"
                      aria-label="Doctor or specialty"
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-lift)]">
                        {suggestions.map((s) => (
                          <li key={s}>
                            <button
                              type="button"
                              onClick={() => {
                                setQ(s);
                                navigate({ to: "/doctors", search: { q: s, city, date } });
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent"
                            >
                              <Search className="size-3.5 text-muted-foreground" />
                              {s}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      aria-label="Location"
                      className="h-12 w-full rounded-md border border-input bg-background pl-9 text-sm"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label="Date"
                    className="h-12"
                  />
                  <Button size="lg" className="h-12 px-7" onClick={submit}>
                    Search
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Try: <span className="font-medium text-foreground">Dentist | Dammam | Today</span>
                </p>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=70"
                alt="Doctor consulting a patient in a modern clinic"
                className="aspect-4/5 w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
              />
              <div className="surface-panel absolute -bottom-6 -left-8 w-64 p-4">
                <p className="text-xs text-muted-foreground">Next available today</p>
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={ref.doctors[2]!.photo}
                    alt=""
                    className="size-11 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{ref.doctors[2]!.name}</p>
                    <p className="text-xs text-muted-foreground">Dermatologist · 4:30 PM</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <Stars value={ref.doctors[2]!.rating} />
                  <span className="font-semibold">{currency(ref.doctors[2]!.fee)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Browse by specialty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a specialty to see doctors with live availability near you.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/specialties">
              All specialties <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ref.specialties.map((s) => (
            <Link
              key={s.id}
              to="/doctors"
              search={{ specialty: s.id }}
              className="surface-panel group flex flex-col items-start gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                <Stethoscope className="size-5" />
              </span>
              <span className="text-sm font-semibold">{s.name}</span>
              <span className="text-xs text-muted-foreground">{s.doctorCount} doctors</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Online consultation */}
      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Book an Online Consultation</h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Speak to a licensed doctor from home. Get a diagnosis, digital prescription and
              follow-up plan without leaving your sofa.
            </p>
            <Button asChild className="mt-6">
              <Link to="/online-consultation">Start a consultation</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Video,
                title: "Video consultation",
                text: "Face-to-face on any device",
                price: 150,
              },
              {
                icon: Mic,
                title: "Audio consultation",
                text: "Low-bandwidth friendly",
                price: 120,
              },
              {
                icon: MessageCircle,
                title: "Chat consultation",
                text: "Reply within 30 minutes",
                price: 90,
              },
            ].map((c) => (
              <div key={c.title} className="surface-panel p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                  <c.icon className="size-5" />
                </span>
                <h3 className="mt-3.5 text-sm font-semibold">{c.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.text}</p>
                <p className="mt-3 text-sm font-bold text-primary">from {currency(c.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular doctors */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold sm:text-3xl">Popular doctors this week</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/doctors">
              See all doctors <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {popularDoctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Availability is calculated live from {appointments.length} booked appointments.
        </p>
      </section>

      {/* Clinics */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">Popular hospitals & clinics</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ref.clinics.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              to="/clinics/$clinicId"
              params={{ clinicId: c.id }}
              className="surface-panel overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <img src={c.image} alt={c.name} loading="lazy" className="h-36 w-full object-cover" />
              <div className="p-4">
                <h3 className="truncate text-sm font-semibold">{c.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" /> {c.city}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs">
                  <Star className="size-3.5 fill-warning text-warning" />
                  <span className="font-semibold">{c.rating}</span>
                  <span className="text-muted-foreground">({c.reviews} reviews)</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">How MediBook works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="surface-panel p-5">
                <span className="font-display text-3xl font-bold text-primary/25">0{i + 1}</span>
                <h3 className="mt-2 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <div key={t.title} className="surface-panel p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                <t.icon className="size-5" />
              </span>
              <h3 className="mt-3.5 text-sm font-semibold">{t.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">What patients say</h2>
        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="surface-panel p-6">
              <Stars value={5} size="md" />
              <blockquote className="mt-3 text-sm leading-relaxed">{t.text}</blockquote>
              <figcaption className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-success" />
                {t.name} · {t.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold sm:text-3xl">Health articles</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/articles">
              Read more <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ref.articles.slice(0, 3).map((a) => (
            <Link
              key={a.id}
              to="/articles/$articleId"
              params={{ articleId: a.id }}
              className="surface-panel overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <img
                src={a.image}
                alt={a.title}
                loading="lazy"
                className="h-40 w-full object-cover"
              />
              <div className="p-5">
                <Badge variant="secondary">{a.category}</Badge>
                <h3 className="mt-3 text-sm font-semibold">{a.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{a.excerpt}</p>
                <p className="mt-3 text-xs text-muted-foreground">{a.readingTime} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
