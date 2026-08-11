import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  CreditCard,
  FileText,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  Video,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { findClinic, ref, specialtyName, useStore } from "@/lib/store";
import type { AppointmentType } from "@/lib/data/types";
import { DAY_LABELS, currency, formatShortDate, formatTime, generateSlots } from "@/lib/slots";
import { cn } from "@/lib/utils";

interface BookSearch {
  type?: AppointmentType | undefined;
  date?: string | undefined;
  time?: string | undefined;
  clinicId?: string | undefined;
}

const TYPES: AppointmentType[] = ["in-clinic", "video", "audio"];

export const Route = createFileRoute("/book/$doctorId")({
  validateSearch: (search: Record<string, unknown>): BookSearch => ({
    type: TYPES.includes(search["type"] as AppointmentType)
      ? (search["type"] as AppointmentType)
      : undefined,
    date: typeof search["date"] === "string" ? search["date"] : undefined,
    time: typeof search["time"] === "string" ? search["time"] : undefined,
    clinicId: typeof search["clinicId"] === "string" ? search["clinicId"] : undefined,
  }),
  loader: ({ params }) => {
    const doctor = ref.doctors.find((d) => d.id === params.doctorId);
    if (!doctor) throw notFound();
    return { name: doctor.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Booking unavailable — MediBook" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Book ${loaderData.name} — MediBook`;
    const description = `Choose a visit type, pick a time slot and confirm your appointment with ${loaderData.name} in a few steps.`;
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
        <Button asChild className="mt-6">
          <Link to="/doctors">Browse doctors</Link>
        </Button>
      </div>
    </PublicLayout>
  ),
  errorComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">Booking couldn't load. Please try again.</h1>
      </div>
    </PublicLayout>
  ),
  component: BookingFlow,
});

const STEPS = ["Visit type", "Date & time", "Patient details", "Payment", "Confirmed"];

const METHODS = [
  { id: "Mada", label: "Mada / Debit card", icon: CreditCard, note: "Saudi debit network" },
  { id: "Visa", label: "Credit card", icon: CreditCard, note: "Visa · Mastercard" },
  { id: "Apple Pay", label: "Apple Pay", icon: Wallet, note: "One-tap checkout" },
  { id: "STC Pay", label: "STC Pay", icon: Phone, note: "Wallet transfer" },
  { id: "Insurance", label: "Insurance", icon: Landmark, note: "Approval at clinic" },
  { id: "Cash", label: "Pay at clinic", icon: Wallet, note: "Cash on arrival" },
];

function BookingFlow() {
  const { doctorId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const store = useStore();
  const doctor = ref.doctors.find((d) => d.id === doctorId)!;

  const [step, setStep] = useState(0);
  const [type, setType] = useState<AppointmentType>(search.type ?? "in-clinic");
  const [clinicId, setClinicId] = useState(search.clinicId ?? doctor.clinics[0]!.clinicId);
  const [date, setDate] = useState(search.date ?? "");
  const [time, setTime] = useState(search.time ?? "");
  const [familyMemberId, setFamilyMemberId] = useState<string>("self");
  const [reason, setReason] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [method, setMethod] = useState("Mada");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const isOnline = type !== "in-clinic";
  const clinicLink = doctor.clinics.find((c) => c.clinicId === clinicId);
  const baseFee = isOnline ? doctor.onlineFee : (clinicLink?.fee ?? doctor.fee);
  const platformFee = 10;
  const vat = Math.round((baseFee + platformFee - discount) * 0.15);
  const total = baseFee + platformFee - discount + vat;

  const week = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return { date: d.toISOString().slice(0, 10), weekday: d.getDay() };
      }),
    [],
  );

  const slots = date
    ? generateSlots(doctor, clinicId, date, store.appointments, store.locks, store.sessionId)
    : [];
  const family = store.family.filter((f) => f.patientId === (store.user?.linkedId ?? ""));

  // Temporary slot hold while the patient completes checkout.
  useEffect(() => {
    if (!date || !time || step < 2 || confirmedId) return;
    store.lockSlot(doctor.id, date, time);
    return () => store.releaseLock(doctor.id, date, time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time, step, confirmedId]);

  const [holdSeconds, setHoldSeconds] = useState(600);
  useEffect(() => {
    if (step < 2 || step > 3 || confirmedId) return;
    setHoldSeconds(600);
    const t = setInterval(() => setHoldSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step, confirmedId]);

  function next() {
    if (step === 0 && !isOnline && !clinicId) {
      toast.error("Select a clinic to continue.");
      return;
    }
    if (step === 1 && (!date || !time)) {
      toast.error("Pick a date and a time slot.");
      return;
    }
    if (step === 2 && reason.trim().length < 5) {
      toast.error("Tell the doctor briefly why you're visiting.");
      return;
    }
    if (step === 2 && !store.user) {
      toast.error("Sign in to confirm your booking.");
      void navigate({ to: "/auth", search: { redirect: `/book/${doctor.id}` } });
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }

  function pay() {
    if (store.isSlotTaken(doctor.id, date, time)) {
      toast.error("That slot was just taken. Please pick another time.");
      setStep(1);
      setTime("");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const appt = store.book(
        {
          doctorId: doctor.id,
          type,
          clinicId,
          date,
          time,
          familyMemberId: familyMemberId === "self" ? null : familyMemberId,
          reason,
          documents,
          fee: total,
        },
        method,
      );
      setProcessing(false);
      setConfirmedId(appt.id);
      setStep(4);
      toast.success("Appointment confirmed");
    }, 1200);
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav aria-label="Booking progress" className="mb-8">
          <ol className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden whitespace-nowrap text-xs font-medium sm:block",
                    i === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="surface-panel p-5 sm:p-7">
            {step === 0 && (
              <div>
                <h1 className="text-xl font-bold">How would you like to consult?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a visit type for {doctor.name}.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      id: "in-clinic" as const,
                      label: "In-clinic",
                      icon: Building2,
                      desc: "Visit the clinic in person",
                      fee: clinicLink?.fee ?? doctor.fee,
                    },
                    {
                      id: "video" as const,
                      label: "Video call",
                      icon: Video,
                      desc: "Secure video consultation",
                      fee: doctor.onlineFee,
                    },
                    {
                      id: "audio" as const,
                      label: "Audio call",
                      icon: Phone,
                      desc: "Voice-only consultation",
                      fee: doctor.onlineFee,
                    },
                  ].map((opt) => {
                    const disabled = opt.id !== "in-clinic" && !doctor.onlineConsultation;
                    return (
                      <button
                        key={opt.id}
                        disabled={disabled}
                        onClick={() => setType(opt.id)}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-colors",
                          type === opt.id
                            ? "border-primary bg-primary-soft"
                            : "border-border hover:bg-accent",
                          disabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <opt.icon className="size-5 text-primary" />
                        <p className="mt-2.5 text-sm font-semibold">{opt.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
                        <p className="mt-2 text-sm font-bold">{currency(opt.fee)}</p>
                      </button>
                    );
                  })}
                </div>

                {!isOnline && (
                  <>
                    <Separator className="my-6" />
                    <h2 className="text-sm font-semibold">Select clinic</h2>
                    <div className="mt-3 space-y-3">
                      {doctor.clinics.map((link) => {
                        const clinic = findClinic(link.clinicId)!;
                        return (
                          <button
                            key={link.clinicId}
                            onClick={() => setClinicId(link.clinicId)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                              clinicId === link.clinicId
                                ? "border-primary bg-primary-soft"
                                : "border-border hover:bg-accent",
                            )}
                          >
                            <img
                              src={clinic.image}
                              alt=""
                              className="size-14 rounded-xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{clinic.name}</p>
                              <p className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
                                <MapPin className="mt-0.5 size-3 shrink-0" /> {clinic.address}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {link.days.map((d) => DAY_LABELS[d]).join(", ")}
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-bold">{currency(link.fee)}</p>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="text-xl font-bold">Pick a date and time</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Slots are 30 minutes and held for 10 minutes once selected.
                </p>
                <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                  {week.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => {
                        setDate(d.date);
                        setTime("");
                      }}
                      className={cn(
                        "min-w-[74px] rounded-xl border p-3 text-center transition-colors",
                        date === d.date
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

                {!date ? (
                  <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 rounded-md" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="mt-6 rounded-xl bg-surface p-6 text-center text-sm text-muted-foreground">
                    The doctor isn't available on this date. Please choose another day.
                  </p>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {slots.map((s) => (
                      <Button
                        key={s.time}
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
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-xl font-bold">Who is this appointment for?</h1>
                <RadioGroup
                  value={familyMemberId}
                  onValueChange={setFamilyMemberId}
                  className="mt-4 space-y-2"
                >
                  <Label className="flex items-center gap-3 rounded-2xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
                    <RadioGroupItem value="self" />
                    <span>
                      <span className="block text-sm font-semibold">
                        {store.user?.name ?? "Myself"}
                      </span>
                      <span className="block text-xs text-muted-foreground">Primary account</span>
                    </span>
                  </Label>
                  {family.map((f) => (
                    <Label
                      key={f.id}
                      className="flex items-center gap-3 rounded-2xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
                    >
                      <RadioGroupItem value={f.id} />
                      <span>
                        <span className="block text-sm font-semibold">{f.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {f.relation} · {f.bloodGroup}
                        </span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>

                <div className="mt-6">
                  <Label htmlFor="reason">Reason for visit</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    maxLength={500}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your symptoms, how long you've had them and any medication you take."
                    className="mt-2 min-h-28"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {reason.length}/500 characters
                  </p>
                </div>

                <div className="mt-6">
                  <Label>Attach reports (optional)</Label>
                  <div className="mt-2 rounded-2xl border border-dashed border-border p-6 text-center">
                    <Upload className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Blood tests, X-rays or previous prescriptions
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setDocuments((d) => [...d, `Report-${d.length + 1}.pdf`])}
                    >
                      Add document
                    </Button>
                  </div>
                  {documents.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {documents.map((d) => (
                        <li
                          key={d}
                          className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm"
                        >
                          <FileText className="size-4 text-primary" /> {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-xl font-bold">Payment</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Lock className="size-3.5" /> Encrypted checkout · slot held{" "}
                  {Math.floor(holdSeconds / 60)}:{String(holdSeconds % 60).padStart(2, "0")}
                </p>
                <RadioGroup
                  value={method}
                  onValueChange={setMethod}
                  className="mt-5 grid gap-3 sm:grid-cols-2"
                >
                  {METHODS.map((m) => (
                    <Label
                      key={m.id}
                      className="flex items-center gap-3 rounded-2xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
                    >
                      <RadioGroupItem value={m.id} />
                      <m.icon className="size-4 text-primary" />
                      <span>
                        <span className="block text-sm font-semibold">{m.label}</span>
                        <span className="block text-xs text-muted-foreground">{m.note}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code (try MEDI50)"
                    maxLength={20}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (coupon.trim().toUpperCase() === "MEDI50") {
                        setDiscount(50);
                        toast.success("Coupon applied — SAR 50 off");
                      } else {
                        setDiscount(0);
                        toast.error("That coupon isn't valid.");
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15">
                  <Check className="size-8 text-success" />
                </div>
                <h1 className="mt-5 text-xl font-bold">Appointment confirmed</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Booking reference {confirmedId} · a confirmation was sent by email and SMS.
                </p>
                <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-surface p-5 text-left text-sm">
                  <Row label="Doctor" value={doctor.name} />
                  <Row label="Specialty" value={specialtyName(doctor.specialtyId)} />
                  <Row label="When" value={`${formatShortDate(date)} at ${formatTime(time)}`} />
                  <Row
                    label="Where"
                    value={isOnline ? "Online consultation" : findClinic(clinicId)!.name}
                  />
                  <Row label="Paid" value={currency(total)} />
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button asChild>
                    <Link to="/app/appointments">View my appointments</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/doctors">Book another doctor</Link>
                  </Button>
                </div>
              </div>
            )}

            {step < 4 && (
              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  Back
                </Button>
                {step === 3 ? (
                  <Button onClick={pay} disabled={processing} size="lg">
                    {processing && <Loader2 className="size-4 animate-spin" />}
                    Pay {currency(total)}
                  </Button>
                ) : (
                  <Button onClick={next} size="lg">
                    Continue
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="surface-panel p-5">
              <div className="flex items-center gap-3">
                <img src={doctor.photo} alt="" className="size-14 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{doctor.name}</p>
                  <p className="truncate text-xs text-primary">
                    {specialtyName(doctor.specialtyId)}
                  </p>
                  <Badge variant="secondary" className="mt-1 gap-1 text-[0.7rem]">
                    <ShieldCheck className="size-3" /> Verified
                  </Badge>
                </div>
              </div>
              <Separator className="my-4" />
              <dl className="space-y-2 text-sm">
                <Row
                  label="Visit type"
                  value={
                    type === "in-clinic"
                      ? "In-clinic"
                      : type === "video"
                        ? "Video call"
                        : "Audio call"
                  }
                />
                {!isOnline && <Row label="Clinic" value={findClinic(clinicId)?.name ?? "—"} />}
                <Row label="Date" value={date ? formatShortDate(date) : "Not selected"} />
                <Row label="Time" value={time ? formatTime(time) : "Not selected"} />
              </dl>
              <Separator className="my-4" />
              <dl className="space-y-2 text-sm">
                <Row label="Consultation" value={currency(baseFee)} />
                <Row label="Platform fee" value={currency(platformFee)} />
                {discount > 0 && <Row label="Discount" value={`- ${currency(discount)}`} />}
                <Row label="VAT (15%)" value={currency(vat)} />
              </dl>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Total</p>
                <p className="text-lg font-bold">{currency(total)}</p>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Free cancellation up to 4 hours before the appointment. Refunds are returned to the
                original payment method within 3 business days.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
