import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Apple,
  ArrowRight,
  Baby,
  Bone,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Ear,
  Eye,
  FileText,
  Heart,
  HeartHandshake,
  HeartPulse,
  Lock,
  MessageCircle,
  Mic,
  MicOff,
  Paperclip,
  Phone,
  PhoneOff,
  Search,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Stethoscope,
  Star,
  User,
  UserCheck,
  Users,
  Video,
  VideoOff,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { EmptyState, PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ConsultationType,
  ONLINE_DOCTORS,
  ONLINE_SPECIALTIES,
  OnlineDoctor,
} from "@/lib/data/online-doctors";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface TeleConsultationSearch {
  q?: string | undefined;
  type?: string | undefined;
  spec?: string | undefined;
}

export const Route = createFileRoute("/online-consultation")({
  validateSearch: (search: Record<string, unknown>): TeleConsultationSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    type: typeof search["type"] === "string" ? search["type"] : undefined,
    spec: typeof search["spec"] === "string" ? search["spec"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Online Consultation — MediBook Telemedicine" },
      {
        name: "description",
        content: "Consult a licensed doctor by video or audio within minutes.",
      },
      { property: "og:title", content: "Online Consultation — MediBook" },
      {
        property: "og:description",
        content: "Consult a licensed doctor by video or audio within minutes.",
      },
    ],
  }),
  component: OnlineConsultationPage,
});

type SortOption = "recommended" | "rating" | "experience" | "price" | "earliest";

/** Specialty Lucide Icon Resolver */
function SpecialtyIcon({ iconName, className }: { iconName: string; className?: string }) {
  const cnStr = cn("h-5 w-5 shrink-0", className);
  switch (iconName) {
    case "Stethoscope":
      return <Stethoscope className={cnStr} />;
    case "Sparkles":
      return <Sparkles className={cnStr} />;
    case "Smile":
      return <Smile className={cnStr} />;
    case "Baby":
      return <Baby className={cnStr} />;
    case "UserCheck":
      return <UserCheck className={cnStr} />;
    case "HeartPulse":
      return <HeartPulse className={cnStr} />;
    case "Bone":
      return <Bone className={cnStr} />;
    case "Ear":
      return <Ear className={cnStr} />;
    default:
      return <Stethoscope className={cnStr} />;
  }
}

function OnlineConsultationPage() {
  const searchParams = Route.useSearch();
  const { user } = useStore();

  const [selectedType, setSelectedType] = useState<ConsultationType>(
    (searchParams.type as ConsultationType) &&
      ["video", "audio", "chat"].includes(searchParams.type as ConsultationType)
      ? (searchParams.type as ConsultationType)
      : "video",
  );
  const [q, setQ] = useState<string>(searchParams.q ?? "");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(searchParams.spec ?? "");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedExp, setSelectedExp] = useState<number>(0);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState<OnlineDoctor | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [bookingType, setBookingType] = useState<ConsultationType>("video");
  const [bookingDate, setBookingDate] = useState<string>("Today");
  const [bookingTime, setBookingTime] = useState<string>("6:30 PM");
  const [bookingFor, setBookingFor] = useState<"myself" | "family">("myself");
  const [bookingReason, setBookingReason] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [bookingConfirmedId, setBookingConfirmedId] = useState<string | null>(null);

  // Filtered doctors logic
  const filteredDoctors = useMemo(() => {
    const query = q.trim().toLowerCase();
    return ONLINE_DOCTORS.filter((doc) => {
      // Type Filter
      if (selectedType && !doc.consultationTypes.includes(selectedType)) return false;
      // Specialty Filter
      if (selectedSpecialty && doc.specialty !== selectedSpecialty) return false;
      // Search Query
      if (query) {
        const haystack = [doc.name, doc.specialty, doc.about, ...doc.languages]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      // Language Filter
      if (selectedLanguage && !doc.languages.includes(selectedLanguage)) return false;
      // Gender Filter
      if (selectedGender && doc.gender !== selectedGender) return false;
      // Experience Filter
      if (selectedExp > 0 && doc.experienceYears < selectedExp) return false;
      // Price Filter
      const fee =
        selectedType === "video"
          ? doc.videoFee
          : selectedType === "audio"
            ? doc.audioFee
            : doc.chatFee;

      if (selectedPriceRange === "under100" && fee >= 100) return false;
      if (selectedPriceRange === "100-200" && (fee < 100 || fee > 200)) return false;
      if (selectedPriceRange === "200-300" && (fee < 200 || fee > 300)) return false;
      if (selectedPriceRange === "300plus" && fee < 300) return false;

      // Availability Filter
      if (selectedAvailability === "now" && doc.onlineStatus !== "now") return false;
      if (selectedAvailability === "today" && doc.onlineStatus === "offline") return false;

      // Rating Filter
      if (minRating > 0 && doc.rating < minRating) return false;

      return true;
    }).sort((a, b) => {
      const getFee = (d: OnlineDoctor) =>
        selectedType === "video" ? d.videoFee : selectedType === "audio" ? d.audioFee : d.chatFee;

      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "experience") return b.experienceYears - a.experienceYears;
      if (sortBy === "price") return getFee(a) - getFee(b);
      if (sortBy === "earliest") return a.onlineStatus === "now" ? -1 : 1;
      return b.rating * Math.log(b.reviewCount) - a.rating * Math.log(a.reviewCount);
    });
  }, [
    selectedType,
    selectedSpecialty,
    q,
    selectedLanguage,
    selectedGender,
    selectedExp,
    selectedPriceRange,
    selectedAvailability,
    minRating,
    sortBy,
  ]);

  const hasActiveFilters = Boolean(
    q ||
    selectedSpecialty ||
    selectedLanguage ||
    selectedGender ||
    selectedExp > 0 ||
    selectedPriceRange ||
    selectedAvailability ||
    minRating > 0,
  );

  const clearAllFilters = () => {
    setQ("");
    setSelectedSpecialty("");
    setSelectedLanguage("");
    setSelectedGender("");
    setSelectedExp(0);
    setSelectedPriceRange("");
    setSelectedAvailability("");
    setMinRating(0);
  };

  const startBooking = (doctor: OnlineDoctor) => {
    setBookingDoctor(doctor);
    setBookingType(selectedType);
    setBookingStep(1);
    setBookingConfirmedId(null);
    setBookingReason("");
    setUploadedFiles([]);
  };

  const completeDemoBooking = () => {
    const randomId = `APT-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingConfirmedId(randomId);
    setBookingStep(7);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 space-y-12">
        {/* Intro Banner */}
        <PageHeading
          eyebrow="MEDIBOOK"
          title="Online consultation"
          subtitle="Consult a licensed doctor by video or audio within minutes."
        />

        {/* Section 2: Talk to a doctor from anywhere */}
        <div className="surface-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-border">
          <div className="max-w-2xl space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Talk to a doctor from anywhere
            </h2>
            <p className="text-sm text-muted-foreground">
              Get professional medical advice through a secure online consultation.
            </p>
          </div>

          {/* Section 3: Consultation Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Video */}
            <button
              type="button"
              onClick={() => setSelectedType("video")}
              className={cn(
                "group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedType === "video"
                  ? "border-primary bg-primary-soft/40 shadow-sm ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50",
              )}
            >
              <div className="space-y-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
                    selectedType === "video"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-soft text-primary-soft-foreground",
                  )}
                >
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Video Consultation</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Face-to-face consultation with a doctor.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-primary">
                <span>{selectedType === "video" ? "Selected Option" : "Choose Video"}</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </button>

            {/* Audio */}
            <button
              type="button"
              onClick={() => setSelectedType("audio")}
              className={cn(
                "group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedType === "audio"
                  ? "border-primary bg-primary-soft/40 shadow-sm ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50",
              )}
            >
              <div className="space-y-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
                    selectedType === "audio"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-soft text-primary-soft-foreground",
                  )}
                >
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Audio Consultation</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Speak privately with a doctor by voice.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-primary">
                <span>{selectedType === "audio" ? "Selected Option" : "Choose Audio"}</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </button>

            {/* Chat */}
            <button
              type="button"
              onClick={() => setSelectedType("chat")}
              className={cn(
                "group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedType === "chat"
                  ? "border-primary bg-primary-soft/40 shadow-sm ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50",
              )}
            >
              <div className="space-y-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
                    selectedType === "chat"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-soft text-primary-soft-foreground",
                  )}
                >
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Chat Consultation</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Discuss your concerns through secure chat.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-primary">
                <span>{selectedType === "chat" ? "Selected Option" : "Choose Chat"}</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Section 4: Specialty Selection & Search */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            What kind of doctor do you need?
          </h2>
          <div className="relative max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search specialty or condition..."
              className="h-13 pl-12 pr-10 text-base rounded-2xl border-border bg-card shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Search specialty or condition"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Section 5: Popular Online Specialties */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Popular online specialties
            </h2>
            {selectedSpecialty && (
              <button
                type="button"
                onClick={() => setSelectedSpecialty("")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear specialty filter
              </button>
            )}
          </div>

          <div className="no-scrollbar flex flex-nowrap items-center gap-4 overflow-x-auto pb-2">
            {ONLINE_SPECIALTIES.map((sp) => {
              const isActive = selectedSpecialty === sp.name;
              return (
                <button
                  key={sp.name}
                  type="button"
                  onClick={() => setSelectedSpecialty(isActive ? "" : sp.name)}
                  className={cn(
                    "group flex shrink-0 items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-w-[240px]",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-card hover:border-primary/40 hover:shadow-xs",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary-soft text-primary-soft-foreground group-hover:bg-primary group-hover:text-primary-foreground",
                    )}
                  >
                    <SpecialtyIcon iconName={sp.iconName} />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "font-bold text-sm",
                        isActive ? "text-primary-foreground" : "text-foreground",
                      )}
                    >
                      {sp.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-1 text-xs line-clamp-2 leading-relaxed",
                        isActive ? "text-primary-foreground/90" : "text-muted-foreground",
                      )}
                    >
                      {sp.description}
                    </p>
                    <span
                      className={cn(
                        "mt-2 inline-block text-[11px] font-semibold",
                        isActive ? "text-primary-foreground/80" : "text-primary",
                      )}
                    >
                      {sp.doctorCount} online doctors
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 6 & 8: Available Doctors List, Controls & Filters */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Doctors available online
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? "doctor" : "doctors"}{" "}
                available online for{" "}
                <span className="font-semibold text-foreground capitalize">
                  {selectedType} consultation
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Mobile Filter Sheet Trigger */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-2 text-xs font-semibold"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                      <span>Filters</span>
                      {hasActiveFilters && (
                        <span className="flex h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
                  >
                    <SheetTitle className="text-lg font-bold">Filter Online Doctors</SheetTitle>
                    <div className="mt-4">
                      <DoctorFiltersSidebar
                        selectedSpecialty={selectedSpecialty}
                        setSelectedSpecialty={setSelectedSpecialty}
                        selectedLanguage={selectedLanguage}
                        setSelectedLanguage={setSelectedLanguage}
                        selectedGender={selectedGender}
                        setSelectedGender={setSelectedGender}
                        selectedExp={selectedExp}
                        setSelectedExp={setSelectedExp}
                        selectedPriceRange={selectedPriceRange}
                        setSelectedPriceRange={setSelectedPriceRange}
                        selectedAvailability={selectedAvailability}
                        setSelectedAvailability={setSelectedAvailability}
                        minRating={minRating}
                        setMinRating={setMinRating}
                        clearAllFilters={clearAllFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sorting Options */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Sort doctors"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="price">Lowest Price</option>
                  <option value="earliest">Earliest Availability</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Filters Sidebar + Doctor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="surface-panel p-5 rounded-3xl space-y-6 sticky top-24">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">Filters</h3>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <DoctorFiltersSidebar
                  selectedSpecialty={selectedSpecialty}
                  setSelectedSpecialty={setSelectedSpecialty}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  selectedGender={selectedGender}
                  setSelectedGender={setSelectedGender}
                  selectedExp={selectedExp}
                  setSelectedExp={setSelectedExp}
                  selectedPriceRange={selectedPriceRange}
                  setSelectedPriceRange={setSelectedPriceRange}
                  selectedAvailability={selectedAvailability}
                  setSelectedAvailability={setSelectedAvailability}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </aside>

            {/* Doctor Cards Grid */}
            <main className="lg:col-span-9 space-y-6">
              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredDoctors.map((doc) => (
                    <OnlineDoctorCard
                      key={doc.id}
                      doctor={doc}
                      selectedType={selectedType}
                      onStartBooking={startBooking}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
                  title="No online doctors found"
                  description="Try changing your filters or selecting another specialty."
                  actionLabel="Clear filters"
                  onAction={clearAllFilters}
                />
              )}
            </main>
          </div>
        </section>

        {/* Section 13: How Online Consultation Works */}
        <section className="surface-panel p-8 rounded-3xl space-y-8 pt-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How online consultation works
            </h2>
            <p className="text-sm text-muted-foreground">
              Get healthcare advice in four simple steps from the comfort of your home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                icon: Stethoscope,
                title: "Choose a doctor",
                desc: "Browse verified specialists by rating, language, and consultation fee.",
              },
              {
                step: "2",
                icon: Calendar,
                title: "Pick a time",
                desc: "Select a date and time slot that perfectly fits your daily schedule.",
              },
              {
                step: "3",
                icon: FileText,
                title: "Complete booking",
                desc: "Describe your symptoms, upload optional reports, and confirm.",
              },
              {
                step: "4",
                icon: Video,
                title: "Talk online",
                desc: "Connect via HD video or audio call and receive your digital prescription.",
              },
            ].map((st) => {
              const StepIcon = st.icon;
              return (
                <div
                  key={st.step}
                  className="flex flex-col items-center text-center space-y-3 rounded-2xl bg-card p-5 border border-border/70"
                >
                  <div className="relative">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground font-bold">
                      <StepIcon className="h-6 w-6" />
                    </span>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {st.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground">{st.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 14: Video Consultation Telemedicine Preview */}
        <section className="surface-panel p-8 rounded-3xl space-y-8 bg-slate-950 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1 font-semibold">
                Telemedicine Platform
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl leading-tight">
                Healthcare, wherever you are
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect directly with licensed consultants over high-definition encrypted video,
                complete with real-time symptom notes and e-prescriptions.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Encrypted end-to-end video communication",
                  "Verified and licensed healthcare specialists",
                  "Private medical records and prescriptions",
                  "Convenient appointments without clinic travel",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-xs font-semibold text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Call Interface Mockup Visual */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-4">
                {/* Header controls bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-white">
                      Live Consultation — Dr. Sarah Ahmed
                    </span>
                  </div>
                  <span className="font-mono text-slate-400">14:32</span>
                </div>

                {/* Call Canvas Mockup */}
                <div className="relative h-64 sm:h-72 w-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80"
                    alt="Doctor Video"
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Patient Inset Camera */}
                  <div className="absolute bottom-3 right-3 h-20 w-28 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                      alt="Patient Camera"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Call Controls Bar */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
                    <button
                      type="button"
                      className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
                    >
                      <Video className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                    >
                      <PhoneOff className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 15: Why Consult Online with MediBook */}
        <section className="space-y-6 pt-2">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Why consult online with MediBook?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: "Verified doctors",
                desc: "Connect with qualified and verified healthcare professionals.",
              },
              {
                icon: Clock,
                title: "Convenient",
                desc: "Consult from home without travelling to a clinic.",
              },
              {
                icon: Calendar,
                title: "Flexible",
                desc: "Choose a consultation time that fits your daily schedule.",
              },
              {
                icon: Lock,
                title: "Private",
                desc: "Your healthcare information stays protected.",
              },
            ].map((c) => {
              const IconComp = c.icon;
              return (
                <div key={c.title} className="surface-panel p-5 rounded-2xl space-y-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground font-bold">
                    <IconComp className="h-5 w-5" />
                  </span>
                  <h3 className="font-bold text-base text-foreground">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 16: Trust & Privacy */}
        <section className="surface-panel p-8 rounded-3xl text-center max-w-3xl mx-auto space-y-3 border border-border">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground mb-1">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Your health. Your privacy. Your choice.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            MediBook ensures encrypted data transmission and confidential tele-consultation sessions
            with accredited healthcare professionals.
          </p>
        </section>
      </div>

      {/* Section 11 & 12: Interactive 7-Step Tele-Consultation Booking Modal */}
      {bookingDoctor && (
        <Dialog open={Boolean(bookingDoctor)} onOpenChange={() => setBookingDoctor(null)}>
          <DialogContent className="rounded-3xl max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                {bookingStep === 7
                  ? "Consultation Booked"
                  : `Book Consultation with ${bookingDoctor.name}`}
              </DialogTitle>
            </DialogHeader>

            {/* Step Indicators */}
            {bookingStep < 7 && (
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-b border-border pb-3">
                <span>Step {bookingStep} of 6</span>
                <span className="text-primary font-bold">
                  {bookingStep === 1 && "Select Type"}
                  {bookingStep === 2 && "Select Date"}
                  {bookingStep === 3 && "Select Time"}
                  {bookingStep === 4 && "Patient Details"}
                  {bookingStep === 5 && "Reason for Visit"}
                  {bookingStep === 6 && "Summary & Confirm"}
                </span>
              </div>
            )}

            {/* STEP 1: Consultation Type */}
            {bookingStep === 1 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Select Consultation Type
                </label>
                <div className="space-y-3">
                  {[
                    {
                      type: "video" as ConsultationType,
                      title: "Video Consultation",
                      fee: bookingDoctor.videoFee,
                      icon: Video,
                    },
                    {
                      type: "audio" as ConsultationType,
                      title: "Audio Consultation",
                      fee: bookingDoctor.audioFee,
                      icon: Phone,
                    },
                    {
                      type: "chat" as ConsultationType,
                      title: "Chat Consultation",
                      fee: bookingDoctor.chatFee,
                      icon: MessageCircle,
                    },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = bookingType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setBookingType(item.type)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary-soft/40 shadow-xs ring-1 ring-primary"
                            : "border-border bg-card hover:bg-secondary/50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "p-2 rounded-xl",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground",
                            )}
                          >
                            <ItemIcon className="h-5 w-5" />
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              High-definition encrypted connection
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-primary">SAR {item.fee}</span>
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={() => setBookingStep(2)}
                  className="w-full rounded-2xl py-3 text-sm font-bold mt-4"
                >
                  Continue to Select Date
                </Button>
              </div>
            )}

            {/* STEP 2: Select Date */}
            {bookingStep === 2 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Select Consultation Date
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Today", "Tomorrow", "In 2 Days"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBookingDate(d)}
                      className={cn(
                        "rounded-2xl border p-3.5 text-center transition-all",
                        bookingDate === d
                          ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                          : "border-border bg-card text-foreground hover:bg-secondary",
                      )}
                    >
                      <Calendar className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-xs">{d}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setBookingStep(1)}
                    className="w-1/2 rounded-2xl text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setBookingStep(3)}
                    className="w-1/2 rounded-2xl text-xs font-bold"
                  >
                    Next: Select Time
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Select Time */}
            {bookingStep === 3 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Select Time Slot ({bookingDate})
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"].map(
                    (t, idx) => {
                      const isTaken = idx === 2; // Demo taken slot
                      const isSelected = bookingTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isTaken}
                          onClick={() => setBookingTime(t)}
                          className={cn(
                            "rounded-xl border py-2.5 text-xs font-semibold transition-all",
                            isTaken
                              ? "bg-muted text-muted-foreground cursor-not-allowed line-through"
                              : isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                : "border-border bg-card text-foreground hover:bg-secondary",
                          )}
                        >
                          {t}
                        </button>
                      );
                    },
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setBookingStep(2)}
                    className="w-1/2 rounded-2xl text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setBookingStep(4)}
                    className="w-1/2 rounded-2xl text-xs font-bold"
                  >
                    Next: Patient Details
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Patient Selection */}
            {bookingStep === 4 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Who is this consultation for?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingFor("myself")}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      bookingFor === "myself"
                        ? "border-primary bg-primary-soft/40 ring-1 ring-primary shadow-xs"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    <User className="h-5 w-5 text-primary mb-2" />
                    <h5 className="font-bold text-sm text-foreground">Myself</h5>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.name ?? "Account Holder"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingFor("family")}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      bookingFor === "family"
                        ? "border-primary bg-primary-soft/40 ring-1 ring-primary shadow-xs"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    <Users className="h-5 w-5 text-primary mb-2" />
                    <h5 className="font-bold text-sm text-foreground">Family Member</h5>
                    <p className="text-[11px] text-muted-foreground">Dependent / Relative</p>
                  </button>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setBookingStep(3)}
                    className="w-1/2 rounded-2xl text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setBookingStep(5)}
                    className="w-1/2 rounded-2xl text-xs font-bold"
                  >
                    Next: Reason for Visit
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: Reason & Optional Document Upload */}
            {bookingStep === 5 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Reason for Consultation
                </label>
                <textarea
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder="Briefly describe what symptoms or questions you need help with..."
                  className="w-full h-24 rounded-2xl border border-border bg-card p-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />

                <div className="border border-dashed border-border rounded-2xl p-4 text-center space-y-1 bg-secondary/30">
                  <Paperclip className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">
                    Upload medical reports (Optional)
                  </p>
                  <p className="text-[10px] text-muted-foreground">PDF, PNG, or JPG up to 10MB</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setBookingStep(4)}
                    className="w-1/2 rounded-2xl text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setBookingStep(6)}
                    className="w-1/2 rounded-2xl text-xs font-bold"
                  >
                    Review Summary
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 6: Appointment Summary */}
            {bookingStep === 6 && (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl bg-secondary/70 p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={bookingDoctor.photo}
                      alt={bookingDoctor.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{bookingDoctor.name}</h4>
                      <p className="text-muted-foreground">{bookingDoctor.specialty}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consultation Type:</span>
                      <span className="font-semibold text-foreground capitalize">
                        {bookingType} Consultation
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span className="font-semibold text-foreground">
                        {bookingDate} at {bookingTime}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1">
                      <span className="font-bold text-foreground">Consultation Fee:</span>
                      <span className="font-bold text-primary text-sm">
                        SAR{" "}
                        {bookingType === "video"
                          ? bookingDoctor.videoFee
                          : bookingType === "audio"
                            ? bookingDoctor.audioFee
                            : bookingDoctor.chatFee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setBookingStep(5)}
                    className="w-1/2 rounded-2xl text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={completeDemoBooking}
                    className="w-1/2 rounded-2xl text-xs font-bold bg-primary text-primary-foreground"
                  >
                    Confirm & Proceed
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 7: Confirmation Screen */}
            {bookingStep === 7 && (
              <div className="space-y-5 pt-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Consultation booked successfully
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your appointment reference ID is{" "}
                    <span className="font-mono font-bold text-primary">{bookingConfirmedId}</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-semibold text-foreground">{bookingDoctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-semibold text-foreground capitalize">
                      {bookingType} Consultation
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-semibold text-foreground">
                      {bookingDate} at {bookingTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold text-emerald-600">Confirmed</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    to="/app/appointments"
                    onClick={() => setBookingDoctor(null)}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    View Appointment
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setBookingDoctor(null)}
                    className="w-full rounded-2xl text-xs font-semibold"
                  >
                    Back to Online Consultation
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </PublicLayout>
  );
}

/** Online Doctor Card Component */
function OnlineDoctorCard({
  doctor,
  selectedType,
  onStartBooking,
}: {
  doctor: OnlineDoctor;
  selectedType: ConsultationType;
  onStartBooking: (doc: OnlineDoctor) => void;
}) {
  const fee =
    selectedType === "video"
      ? doctor.videoFee
      : selectedType === "audio"
        ? doctor.audioFee
        : doctor.chatFee;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
      <div>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="h-16 w-16 rounded-2xl object-cover"
            />
            <span
              className={cn(
                "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card",
                doctor.onlineStatus === "now" ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors truncate">
                {doctor.name}
              </h3>
              {doctor.verified && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
            </div>

            <p className="text-xs font-semibold text-primary">{doctor.specialty}</p>
            <p className="text-[11px] text-muted-foreground truncate">{doctor.qualifications}</p>
            <p className="text-[11px] text-muted-foreground">
              {doctor.experienceYears} years experience
            </p>
          </div>
        </div>

        {/* Rating, Reviews & Languages */}
        <div className="mt-4 flex items-center justify-between border-y border-border/70 py-2.5 text-xs">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="font-bold text-foreground">{doctor.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({doctor.reviewCount})</span>
          </div>
          <span className="text-muted-foreground font-medium truncate max-w-[130px]">
            {doctor.languages.join(" · ")}
          </span>
        </div>

        {/* Availability Badge & Fee */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span
              className={doctor.onlineStatus === "now" ? "text-emerald-600" : "text-foreground"}
            >
              {doctor.onlineStatus === "now"
                ? "Available now"
                : `${doctor.nextAvailableDate} at ${doctor.nextAvailableTime}`}
            </span>
          </div>
          <span className="font-bold text-foreground text-sm">SAR {fee}</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link
          to="/doctors"
          search={{ q: doctor.name }}
          className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors text-center"
        >
          View Profile
        </Link>
        <Button
          type="button"
          onClick={() => onStartBooking(doctor)}
          className="rounded-2xl bg-primary text-primary-foreground px-3 py-2.5 text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Book Consultation
        </Button>
      </div>
    </div>
  );
}

/** Reusable Doctor Filters Sidebar Component */
function DoctorFiltersSidebar({
  selectedSpecialty,
  setSelectedSpecialty,
  selectedLanguage,
  setSelectedLanguage,
  selectedGender,
  setSelectedGender,
  selectedExp,
  setSelectedExp,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedAvailability,
  setSelectedAvailability,
  minRating,
  setMinRating,
  clearAllFilters,
}: {
  selectedSpecialty: string;
  setSelectedSpecialty: (v: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (v: string) => void;
  selectedGender: string;
  setSelectedGender: (v: string) => void;
  selectedExp: number;
  setSelectedExp: (v: number) => void;
  selectedPriceRange: string;
  setSelectedPriceRange: (v: string) => void;
  selectedAvailability: string;
  setSelectedAvailability: (v: string) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  clearAllFilters: () => void;
}) {
  return (
    <div className="space-y-5 text-xs">
      {/* Specialty Filter */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Specialty
        </label>
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All Specialties</option>
          {ONLINE_SPECIALTIES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All Languages</option>
          {["Arabic", "English", "Hindi", "Urdu", "French"].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Gender
        </label>
        <div className="flex gap-2">
          {[
            { val: "", label: "Any" },
            { val: "male", label: "Male" },
            { val: "female", label: "Female" },
          ].map((g) => (
            <button
              key={g.label}
              type="button"
              onClick={() => setSelectedGender(g.val)}
              className={cn(
                "flex-1 rounded-lg py-1.5 font-semibold transition-all text-center",
                selectedGender === g.val
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Minimum Experience
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { val: 0, label: "Any" },
            { val: 5, label: "5+ yrs" },
            { val: 10, label: "10+ yrs" },
            { val: 15, label: "15+ yrs" },
          ].map((exp) => (
            <button
              key={exp.label}
              type="button"
              onClick={() => setSelectedExp(exp.val)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 font-semibold transition-all",
                selectedExp === exp.val
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {exp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Price Range
        </label>
        <select
          value={selectedPriceRange}
          onChange={(e) => setSelectedPriceRange(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">Any Fee</option>
          <option value="under100">Under SAR 100</option>
          <option value="100-200">SAR 100 – SAR 200</option>
          <option value="200-300">SAR 200 – SAR 300</option>
          <option value="300plus">SAR 300+</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Availability
        </label>
        <select
          value={selectedAvailability}
          onChange={(e) => setSelectedAvailability(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">Any Time</option>
          <option value="now">Available Now</option>
          <option value="today">Available Today</option>
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Minimum Rating
        </label>
        <div className="flex gap-1.5">
          {[
            { val: 0, label: "Any" },
            { val: 4.5, label: "4.5+" },
            { val: 4.0, label: "4.0+" },
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setMinRating(r.val)}
              className={cn(
                "flex-1 rounded-lg py-1.5 font-semibold transition-all text-center",
                minRating === r.val
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Action */}
      <div className="pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={clearAllFilters}
          className="w-full rounded-xl text-xs font-semibold"
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
