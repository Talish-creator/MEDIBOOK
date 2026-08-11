import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  Search,
  SearchX,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { PublicLayout, EmptyState } from "@/components/layout/PublicLayout";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CITIES, INSURERS, LANGUAGES } from "@/lib/data/seed";
import { ref, specialtyName, useStore } from "@/lib/store";
import { currency, nextAvailable } from "@/lib/slots";
import { cn } from "@/lib/utils";

interface DoctorSearch {
  q?: string | undefined;
  specialty?: string | undefined;
  city?: string | undefined;
  date?: string | undefined;
  online?: boolean | undefined;
}

export const Route = createFileRoute("/doctors/")({
  validateSearch: (search: Record<string, unknown>): DoctorSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    specialty: typeof search["specialty"] === "string" ? search["specialty"] : undefined,
    city: typeof search["city"] === "string" ? search["city"] : undefined,
    date: typeof search["date"] === "string" ? search["date"] : undefined,
    online: search["online"] === true || search["online"] === "true" ? true : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Find Doctors — Compare Specialists | MediBook" },
      {
        name: "description",
        content:
          "Filter doctors by specialty, city, fee, language, experience and rating. See live availability and book instantly.",
      },
      { property: "og:title", content: "Find Doctors — MediBook" },
      {
        property: "og:description",
        content: "Compare verified specialists by fee, experience, rating and availability.",
      },
    ],
  }),
  component: DoctorSearchPage,
});

type Sort = "recommended" | "rating" | "experience" | "price" | "earliest";

function DoctorSearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { appointments, verification } = useStore();

  const [q, setQ] = useState(search.q ?? "");
  const [specialty, setSpecialty] = useState(search.specialty ?? "");
  const [city, setCity] = useState(search.city ?? "");
  const [gender, setGender] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [minYears, setMinYears] = useState(0);
  const [maxFee, setMaxFee] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [onlineOnly, setOnlineOnly] = useState(Boolean(search.online));
  const [insurance, setInsurance] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [availableSoon, setAvailableSoon] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");
  const [view, setView] = useState<"list" | "grid" | "map">("list");

  const results = useMemo(() => {
    const list = ref.doctors
      .filter((d) => (verification[d.id] ?? d.verification) !== "Suspended")
      .filter((d) => {
        const term = q.trim().toLowerCase();
        if (term) {
          const haystack =
            `${d.name} ${specialtyName(d.specialtyId)} ${d.subSpecialties.join(" ")} ${d.city}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        if (specialty && d.specialtyId !== specialty) return false;
        if (city && d.city !== city) return false;
        if (gender && d.gender !== gender) return false;
        if (languages.length && !languages.every((l) => d.languages.includes(l))) return false;
        if (d.years < minYears) return false;
        if (d.fee > maxFee) return false;
        if (d.rating < minRating) return false;
        if (onlineOnly && !d.onlineConsultation) return false;
        if (insurance && !d.insurances.includes(insurance)) return false;
        if (clinicId && !d.clinics.some((c) => c.clinicId === clinicId)) return false;
        if (availableSoon) {
          const next = nextAvailable(d, appointments);
          if (!next || next.dayOffset > 2) return false;
        }
        return true;
      });

    const withNext = list.map((d) => ({ d, next: nextAvailable(d, appointments) }));
    withNext.sort((a, b) => {
      if (sort === "rating") return b.d.rating - a.d.rating;
      if (sort === "experience") return b.d.years - a.d.years;
      if (sort === "price") return a.d.fee - b.d.fee;
      if (sort === "earliest") return (a.next?.dayOffset ?? 99) - (b.next?.dayOffset ?? 99);
      return b.d.rating * Math.log(b.d.reviewCount) - a.d.rating * Math.log(a.d.reviewCount);
    });
    return withNext.map((w) => w.d);
  }, [
    q,
    specialty,
    city,
    gender,
    languages,
    minYears,
    maxFee,
    minRating,
    onlineOnly,
    insurance,
    clinicId,
    availableSoon,
    sort,
    appointments,
    verification,
  ]);

  const clearFilters = () => {
    setQ("");
    setSpecialty("");
    setCity("");
    setGender("");
    setLanguages([]);
    setMinYears(0);
    setMaxFee(500);
    setMinRating(0);
    setOnlineOnly(false);
    setInsurance("");
    setClinicId("");
    setAvailableSoon(false);
    navigate({ search: {} });
  };

  const Filters = (
    <div className="space-y-6">
      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">Specialty</Label>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All specialties</option>
          {ref.specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">Location</Label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">Gender</Label>
        <div className="mt-2 flex gap-2">
          {[
            { v: "", l: "Any" },
            { v: "male", l: "Male" },
            { v: "female", l: "Female" },
          ].map((o) => (
            <Button
              key={o.l}
              variant={gender === o.v ? "default" : "outline"}
              size="sm"
              onClick={() => setGender(o.v)}
            >
              {o.l}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">Language</Label>
        <div className="mt-2 space-y-2">
          {LANGUAGES.map((l) => (
            <label key={l} className="flex items-center gap-2.5 text-sm">
              <Checkbox
                checked={languages.includes(l)}
                onCheckedChange={(v) =>
                  setLanguages((prev) => (v ? [...prev, l] : prev.filter((x) => x !== l)))
                }
              />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">
          Experience — {minYears}+ years
        </Label>
        <Slider
          className="mt-3"
          value={[minYears]}
          onValueChange={([v]) => setMinYears(v ?? 0)}
          max={25}
          step={1}
        />
      </div>

      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">
          Consultation fee — up to {currency(maxFee)}
        </Label>
        <Slider
          className="mt-3"
          value={[maxFee]}
          onValueChange={([v]) => setMaxFee(v ?? 500)}
          min={100}
          max={500}
          step={50}
        />
      </div>

      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">Rating</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[0, 3, 4, 4.5].map((rv) => (
            <Button
              key={rv}
              variant={minRating === rv ? "default" : "outline"}
              size="sm"
              onClick={() => setMinRating(rv)}
              className="gap-1"
            >
              {rv === 0 ? (
                "Any"
              ) : (
                <>
                  {rv}+ <Star className="size-3" />
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <label className="flex items-center justify-between gap-3 text-sm">
          Available in 48 hours
          <Switch checked={availableSoon} onCheckedChange={setAvailableSoon} />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          Online consultation
          <Switch checked={onlineOnly} onCheckedChange={setOnlineOnly} />
        </label>
      </div>

      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">Insurance</Label>
        <select
          value={insurance}
          onChange={(e) => setInsurance(e.target.value)}
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Any insurer</option>
          {INSURERS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="text-xs font-semibold tracking-wide uppercase">Hospital / Clinic</Label>
        <select
          value={clinicId}
          onChange={(e) => setClinicId(e.target.value)}
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Any clinic</option>
          {ref.clinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search doctors, specialties or conditions — e.g. best dermatologist"
            className="h-12 pl-10"
            aria-label="Search doctors"
          />
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="surface-panel sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="size-4" /> Filters
              </h2>
              {Filters}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold sm:text-xl">
                  {results.length.toLocaleString()} doctors available
                </h1>
                <p className="text-xs text-muted-foreground">
                  {specialty ? specialtyName(specialty) : "All specialties"}
                  {city ? ` · ${city}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="size-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-6">
                    <SheetTitle className="mb-5">Filters</SheetTitle>
                    {Filters}
                  </SheetContent>
                </Sheet>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  aria-label="Sort doctors"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating">Rating</option>
                  <option value="experience">Experience</option>
                  <option value="price">Price: Low to High</option>
                  <option value="earliest">Earliest Available</option>
                </select>
                <div className="hidden rounded-md border border-border p-0.5 sm:flex">
                  {(
                    [
                      ["list", List],
                      ["grid", LayoutGrid],
                      ["map", MapIcon],
                    ] as const
                  ).map(([v, Icon]) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      aria-label={`${v} view`}
                      className={cn(
                        "grid size-8 place-items-center rounded",
                        view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={<SearchX className="size-6" />}
                  title="We couldn't find doctors matching your search."
                  description="Try widening the fee range, removing the language filter, or searching another city."
                  actionLabel="Clear Filters"
                  onAction={clearFilters}
                />
              </div>
            ) : view === "map" ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                <div className="surface-panel relative min-h-80 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=60"
                    alt="Map of clinic locations"
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end gap-2 p-4">
                    {results.slice(0, 4).map((d, i) => (
                      <Badge
                        key={d.id}
                        className="w-fit gap-1.5 bg-card text-card-foreground shadow"
                      >
                        <span className="grid size-4 place-items-center rounded-full bg-primary text-[0.6rem] text-primary-foreground">
                          {i + 1}
                        </span>
                        {d.name} · {d.city}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {results.slice(0, 4).map((d) => (
                    <DoctorCard key={d.id} doctor={d} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={cn("mt-6 grid gap-4", view === "grid" && "sm:grid-cols-2")}>
                {results.map((d) => (
                  <DoctorCard key={d.id} doctor={d} layout={view} />
                ))}
              </div>
            )}

            {results.length > 0 && (
              <p className="mt-8 text-center text-xs text-muted-foreground">
                Showing all {results.length} matching doctors ·{" "}
                <Link to="/specialties" className="font-medium text-primary hover:underline">
                  browse by specialty instead
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export function DoctorListSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-44 w-full rounded-2xl" />
      ))}
    </div>
  );
}
