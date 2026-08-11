import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crosshair,
  Filter,
  Heart,
  Grid,
  List,
  Map as MapIcon,
  MapPin,
  Phone,
  Search,
  SearchX,
  SlidersHorizontal,
  Star,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { EmptyState, PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  FACILITIES,
  FACILITY_SERVICES,
  FACILITY_SPECIALTIES,
  FACILITY_TYPES,
  Facility,
  FacilityType,
  SAUDI_CITIES,
  SaudiCity,
  getCityFacilityCounts,
} from "@/lib/data/facilities";
import { cn } from "@/lib/utils";

interface ClinicsSearch {
  q?: string | undefined;
  city?: string | undefined;
  type?: string | undefined;
}

export const Route = createFileRoute("/clinics/")({
  validateSearch: (search: Record<string, unknown>): ClinicsSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    city: typeof search["city"] === "string" ? search["city"] : undefined,
    type: typeof search["type"] === "string" ? search["type"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Hospitals and Clinics — MediBook" },
      {
        name: "description",
        content: "Explore accredited hospitals and clinics across Saudi Arabia.",
      },
      { property: "og:title", content: "Hospitals and Clinics — MediBook" },
      {
        property: "og:description",
        content: "Explore accredited hospitals and clinics across Saudi Arabia.",
      },
    ],
  }),
  component: ClinicsPage,
});

type SortOption = "recommended" | "rating" | "reviews" | "name";

function ClinicsPage() {
  const searchParams = Route.useSearch();
  const [q, setQ] = useState(searchParams.q ?? "");
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.city ?? "");
  const [selectedType, setSelectedType] = useState<string>(searchParams.type ?? "");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeMapFacility, setActiveMapFacility] = useState<Facility | null>(null);
  const [userLocationDetected, setUserLocationDetected] = useState<boolean>(false);

  // Search input focus / suggestions dropdown state
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const cityCounts = useMemo(() => getCityFacilityCounts(), []);

  // Filtered facilities logic
  const filteredFacilities = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = FACILITIES.filter((f) => {
      // Text Query Match (Name, City, Type, Address, Specialties, Services)
      if (query) {
        const haystack = [f.name, f.city, f.type, f.address, ...f.specialties, ...f.services]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      // City Filter
      if (selectedCity && f.city !== selectedCity) return false;
      // Type Filter
      if (selectedType && f.type !== selectedType) return false;
      // Specialty Filter
      if (selectedSpecialty && !f.specialties.includes(selectedSpecialty)) return false;
      // Service Filter
      if (selectedService && !f.services.includes(selectedService)) return false;
      // Rating Filter
      if (minRating > 0 && f.rating < minRating) return false;
      // Open Now Filter
      if (openNowOnly && !f.isOpenNow) return false;

      return true;
    });

    // Sorting logic
    return [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      // Recommended default: featured first, then rating
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.rating - a.rating;
    });
  }, [
    q,
    selectedCity,
    selectedType,
    selectedSpecialty,
    selectedService,
    minRating,
    openNowOnly,
    sortBy,
  ]);

  const featuredFacilities = useMemo(() => {
    return FACILITIES.filter((f) => f.featured);
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.trim().toLowerCase();
    return FACILITIES.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.city.toLowerCase().includes(term) ||
        f.type.toLowerCase().includes(term),
    ).slice(0, 5);
  }, [q]);

  const hasActiveFilters = Boolean(
    q ||
    selectedCity ||
    selectedType ||
    selectedSpecialty ||
    selectedService ||
    minRating > 0 ||
    openNowOnly,
  );

  const clearAllFilters = () => {
    setQ("");
    setSelectedCity("");
    setSelectedType("");
    setSelectedSpecialty("");
    setSelectedService("");
    setMinRating(0);
    setOpenNowOnly(false);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleUseLocation = () => {
    setUserLocationDetected(true);
    setSelectedCity("Riyadh"); // Simulates local location detection
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 space-y-10">
        {/* Introduction */}
        <PageHeading
          eyebrow="MEDIBOOK"
          title="Hospitals and clinics"
          subtitle="Explore accredited hospitals and clinics across Saudi Arabia."
        />

        {/* Search & Location Bar */}
        <div className="surface-panel p-4 sm:p-6 rounded-3xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Main Search Bar */}
            <div className="relative md:col-span-7">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search hospitals, clinics, or services..."
                className="h-12 sm:h-13 pl-12 pr-10 text-base rounded-2xl border-border bg-card shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Search hospitals, clinics or services"
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

              {/* Instant Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-border bg-card p-2 shadow-lift">
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Matching Facilities
                  </div>
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setQ(item.name);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary/70 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-12 sm:h-13 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Select location"
              >
                <option value="">Saudi Arabia (All Cities)</option>
                {SAUDI_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Use My Location Button */}
            <div className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseLocation}
                className={cn(
                  "h-12 sm:h-13 w-full rounded-2xl text-sm font-semibold gap-2 border-border",
                  userLocationDetected && "border-primary text-primary bg-primary-soft/30",
                )}
              >
                <Crosshair className="h-4 w-4 shrink-0 text-primary" />
                <span>{userLocationDetected ? "Riyadh (Detected)" : "Use location"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Facilities Section (Shown when no search query active) */}
        {!hasActiveFilters && featuredFacilities.length > 0 && (
          <section className="space-y-5 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold">
                  Featured
                </Badge>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Featured hospitals & clinics
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Trusted healthcare facilities chosen for quality, services and patient experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  isFavorite={favorites.includes(facility.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* Find Healthcare Near You (City Exploration Pills) */}
        {!hasActiveFilters && (
          <section className="space-y-4 pt-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Find healthcare near you
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a city to filter accredited hospitals and medical centers nearby.
              </p>
            </div>

            <div className="no-scrollbar flex flex-nowrap items-center gap-3 overflow-x-auto pb-2">
              {cityCounts.map(({ city, count }) => {
                const isActive = selectedCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(isActive ? "" : city)}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/70",
                    )}
                  >
                    <MapPin
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary-foreground" : "text-primary",
                      )}
                    />
                    <span>{city}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Results Controls & Main Content Area */}
        <section className="space-y-6 pt-2">
          {/* Header Controls: Count, Sort, View Toggle */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Hospitals & clinics {selectedCity ? `in ${selectedCity}` : "in Saudi Arabia"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredFacilities.length}{" "}
                {filteredFacilities.length === 1 ? "facility" : "facilities"} found
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
                    <SheetTitle className="text-lg font-bold">Filter Facilities</SheetTitle>
                    <div className="mt-4">
                      <FilterSidebar
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        selectedCity={selectedCity}
                        setSelectedCity={setSelectedCity}
                        selectedSpecialty={selectedSpecialty}
                        setSelectedSpecialty={setSelectedSpecialty}
                        selectedService={selectedService}
                        setSelectedService={setSelectedService}
                        minRating={minRating}
                        setMinRating={setMinRating}
                        openNowOnly={openNowOnly}
                        setOpenNowOnly={setOpenNowOnly}
                        clearAllFilters={clearAllFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Sort facilities"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>

              {/* List View | Map View Toggle */}
              <div className="inline-flex rounded-xl border border-border bg-card p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                    viewMode === "map"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout: Desktop Filters Sidebar + Results Grid */}
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

                <FilterSidebar
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedCity={selectedCity}
                  setSelectedCity={setSelectedCity}
                  selectedSpecialty={selectedSpecialty}
                  setSelectedSpecialty={setSelectedSpecialty}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  openNowOnly={openNowOnly}
                  setOpenNowOnly={setOpenNowOnly}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </aside>

            {/* Results Output (List View or Map View) */}
            <main className="lg:col-span-9 space-y-6">
              {viewMode === "list" ? (
                filteredFacilities.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredFacilities.slice(0, visibleCount).map((facility) => (
                        <FacilityCard
                          key={facility.id}
                          facility={facility}
                          isFavorite={favorites.includes(facility.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>

                    {/* Load More Facilities Button */}
                    {visibleCount < filteredFacilities.length && (
                      <div className="pt-6 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setVisibleCount((prev) => prev + 8)}
                          className="rounded-2xl px-8 py-3 text-sm font-semibold border-border hover:border-primary hover:bg-primary-soft/20"
                        >
                          Load more facilities ({filteredFacilities.length - visibleCount}{" "}
                          remaining)
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
                    title="No hospitals or clinics found"
                    description="Try changing your location or removing some filters to find available facilities."
                    actionLabel="Clear all filters"
                    onAction={clearAllFilters}
                  />
                )
              ) : (
                /* Map View Mode Component */
                <FacilityMapView
                  facilities={filteredFacilities}
                  activeFacility={activeMapFacility}
                  onSelectFacility={setActiveMapFacility}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </main>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

/** Reusable Filter Sidebar Content Component */
function FilterSidebar({
  selectedType,
  setSelectedType,
  selectedCity,
  setSelectedCity,
  selectedSpecialty,
  setSelectedSpecialty,
  selectedService,
  setSelectedService,
  minRating,
  setMinRating,
  openNowOnly,
  setOpenNowOnly,
  clearAllFilters,
}: {
  selectedType: string;
  setSelectedType: (v: string) => void;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (v: string) => void;
  selectedService: string;
  setSelectedService: (v: string) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  openNowOnly: boolean;
  setOpenNowOnly: (v: boolean) => void;
  clearAllFilters: () => void;
}) {
  return (
    <div className="space-y-5 text-xs">
      {/* Facility Type */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Facility Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All Types</option>
          {FACILITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          City
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All Cities</option>
          {SAUDI_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Specialty */}
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
          {FACILITY_SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Services */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Service
        </label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All Services</option>
          {FACILITY_SERVICES.map((srv) => (
            <option key={srv} value={srv}>
              {srv}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Minimum Rating
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { val: 0, label: "Any" },
            { val: 4.5, label: "4.5+" },
            { val: 4.0, label: "4.0+" },
            { val: 3.5, label: "3.5+" },
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setMinRating(r.val)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-semibold transition-all",
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

      {/* Availability Checkbox */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-foreground">
          <input
            type="checkbox"
            checked={openNowOnly}
            onChange={(e) => setOpenNowOnly(e.target.checked)}
            className="h-4 w-4 rounded-md border-border text-primary focus:ring-primary"
          />
          <span>Open Now Only</span>
        </label>
      </div>

      {/* Clear Filters Action */}
      <div className="pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={clearAllFilters}
          className="w-full rounded-xl text-xs font-semibold"
        >
          Clear all filters
        </Button>
      </div>
    </div>
  );
}

/** Individual Hospital / Clinic Card Component */
function FacilityCard({
  facility,
  isFavorite,
  onToggleFavorite,
}: {
  facility: Facility;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
      <div>
        {/* Facility Cover Image & Badges Header */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={facility.image}
            alt={facility.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Type Badge & Verified Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
              <Building2 className="h-3.5 w-3.5 text-primary-soft-foreground" />
              {facility.type}
            </span>
            {facility.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-md px-2.5 py-1 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(facility.id);
            }}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
            aria-label="Save to favorites"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-white",
              )}
            />
          </button>

          {/* Rating & Review Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
            <div className="flex items-center gap-1 rounded-lg bg-amber-500/90 px-2 py-0.5 text-xs font-bold text-white">
              <Star className="h-3.5 w-3.5 fill-white" />
              <span>{facility.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-white/90 font-medium">
              ({facility.reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors leading-tight">
              {facility.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">
                {facility.city} · {facility.address}
              </span>
            </p>
          </div>

          {/* Opening Hours & Status */}
          <div className="flex items-center justify-between text-xs border-y border-border/70 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full shrink-0",
                  facility.isOpenNow ? "bg-emerald-500" : "bg-muted-foreground",
                )}
              />
              <span className="font-semibold text-foreground">
                {facility.is24Hours
                  ? "Open 24 hours"
                  : facility.isOpenNow
                    ? "Open today"
                    : "Closed"}
              </span>
            </div>
            <span className="text-muted-foreground font-medium truncate max-w-[140px]">
              {facility.openingHours}
            </span>
          </div>

          {/* Specialties Tags */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Main Specialties:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {facility.specialties.slice(0, 3).map((spec) => (
                <span
                  key={spec}
                  className="rounded-lg bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {spec}
                </span>
              ))}
              {facility.specialties.length > 3 && (
                <span className="text-xs text-muted-foreground font-medium self-center">
                  +{facility.specialties.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Services Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {facility.services.slice(0, 4).map((srv) => (
              <Badge
                key={srv}
                variant="outline"
                className="text-[11px] font-medium border-border/80"
              >
                {srv}
              </Badge>
            ))}
          </div>

          {/* Doctor Count Banner */}
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground pt-1">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <span>{facility.doctorCount}+ Verified Doctors</span>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
        <Link
          to="/clinics/$clinicId"
          params={{ clinicId: facility.id }}
          className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors text-center"
        >
          View Hospital
        </Link>
        <Link
          to="/doctors"
          search={{ q: facility.name }}
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors text-center"
        >
          Find a Doctor
        </Link>
      </div>
    </div>
  );
}

/** Interactive Map View Component for Saudi Arabia Facilities */
function FacilityMapView({
  facilities,
  activeFacility,
  onSelectFacility,
  favorites,
  onToggleFavorite,
}: {
  facilities: Facility[];
  activeFacility: Facility | null;
  onSelectFacility: (f: Facility | null) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="surface-panel p-6 rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-foreground">Interactive Facility Map</h3>
          <p className="text-xs text-muted-foreground">
            Explore accredited hospital markers across major cities in Saudi Arabia.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-xs">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {facilities.length} Pins Active
        </Badge>
      </div>

      {/* Map Graphic Container */}
      <div className="relative h-[480px] w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Stylized Dark Grid Map Representation */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* City Marker Overlay Grid */}
        <div className="relative h-full w-full p-8 flex flex-wrap items-center justify-around gap-6">
          {facilities.slice(0, 10).map((f, idx) => {
            const isSelected = activeFacility?.id === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectFacility(f)}
                className={cn(
                  "group relative flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition-all shadow-md",
                  isSelected
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110 z-20"
                    : "bg-slate-800/90 text-slate-100 hover:bg-slate-700 border border-slate-700 z-10",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <div className="text-left">
                  <p className="truncate max-w-[110px]">{f.name}</p>
                  <p className="text-[10px] font-normal opacity-80">{f.city}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Facility Card Drawer Overlay */}
        {activeFacility && (
          <div className="absolute bottom-4 left-4 right-4 max-w-sm mx-auto rounded-2xl border border-border bg-card p-4 shadow-lift z-30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <img
                  src={activeFacility.image}
                  alt={activeFacility.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{activeFacility.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {activeFacility.city} · ★ {activeFacility.rating}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectFacility(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">
                {activeFacility.doctorCount}+ Doctors
              </span>
              <Link
                to="/clinics/$clinicId"
                params={{ clinicId: activeFacility.id }}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <span>View Profile</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
