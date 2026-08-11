import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Apple,
  ArrowRight,
  Baby,
  Bone,
  Brain,
  Cross,
  Dna,
  Droplets,
  Dumbbell,
  Ear,
  Eye,
  Heart,
  HeartHandshake,
  HeartPulse,
  Microscope,
  Scissors,
  Search,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  UserCheck,
  Users,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { EmptyState, PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import {
  ALL_MEDICAL_SPECIALTIES,
  MedicalSpecialty,
  SPECIALTY_CATEGORIES,
  SpecialtyCategory,
} from "@/lib/data/specialties";
import { cn } from "@/lib/utils";

interface SpecialtiesSearch {
  q?: string | undefined;
  cat?: string | undefined;
}

export const Route = createFileRoute("/specialties")({
  validateSearch: (search: Record<string, unknown>): SpecialtiesSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Medical Specialties — MediBook" },
      {
        name: "description",
        content: "Browse every specialty and find the right expert for your symptoms.",
      },
      { property: "og:title", content: "Medical Specialties — MediBook" },
      {
        property: "og:description",
        content: "Browse every specialty and find the right expert for your symptoms.",
      },
    ],
  }),
  component: SpecialtiesPage,
});

/** Icon resolver component mapping icon names to Lucide icons */
function SpecialtyIcon({ iconName, className }: { iconName: string; className?: string }) {
  const cnStr = cn("h-6 w-6 shrink-0", className);
  switch (iconName) {
    case "Stethoscope":
      return <Stethoscope className={cnStr} />;
    case "Smile":
      return <Smile className={cnStr} />;
    case "Sparkles":
      return <Sparkles className={cnStr} />;
    case "HeartPulse":
      return <HeartPulse className={cnStr} />;
    case "Heart":
      return <Heart className={cnStr} />;
    case "Baby":
      return <Baby className={cnStr} />;
    case "UserCheck":
      return <UserCheck className={cnStr} />;
    case "Bone":
      return <Bone className={cnStr} />;
    case "Brain":
      return <Brain className={cnStr} />;
    case "Eye":
      return <Eye className={cnStr} />;
    case "Ear":
      return <Ear className={cnStr} />;
    case "HeartHandshake":
      return <HeartHandshake className={cnStr} />;
    case "Droplets":
      return <Droplets className={cnStr} />;
    case "Activity":
      return <Activity className={cnStr} />;
    case "Wind":
      return <Wind className={cnStr} />;
    case "Dna":
      return <Dna className={cnStr} />;
    case "ShieldAlert":
      return <ShieldAlert className={cnStr} />;
    case "Syringe":
      return <Syringe className={cnStr} />;
    case "Scissors":
      return <Scissors className={cnStr} />;
    case "Microscope":
      return <Microscope className={cnStr} />;
    case "Cross":
      return <Cross className={cnStr} />;
    case "Users":
      return <Users className={cnStr} />;
    case "ShieldCheck":
      return <ShieldCheck className={cnStr} />;
    case "Zap":
      return <Zap className={cnStr} />;
    case "Dumbbell":
      return <Dumbbell className={cnStr} />;
    case "Apple":
      return <Apple className={cnStr} />;
    default:
      return <Stethoscope className={cnStr} />;
  }
}

function SpecialtiesPage() {
  const searchParams = Route.useSearch();
  const [searchQuery, setSearchQuery] = useState(searchParams.q ?? "");
  const [selectedCategory, setSelectedCategory] = useState<SpecialtyCategory>(
    (searchParams.cat as SpecialtyCategory) &&
      SPECIALTY_CATEGORIES.includes(searchParams.cat as SpecialtyCategory)
      ? (searchParams.cat as SpecialtyCategory)
      : "All Specialties",
  );

  // Popular specialties list (top 8)
  const popularSpecialties = useMemo(() => {
    return ALL_MEDICAL_SPECIALTIES.filter((sp) => sp.popular).sort(
      (a, b) => (a.popularOrder ?? 99) - (b.popularOrder ?? 99),
    );
  }, []);

  // Filtered specialties list based on query and selected category
  const filteredSpecialties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_MEDICAL_SPECIALTIES.filter((sp) => {
      // Category filter
      if (selectedCategory !== "All Specialties" && sp.category !== selectedCategory) {
        return false;
      }
      // Text search filter
      if (q) {
        const haystack = [sp.name, sp.description, sp.category, ...sp.synonyms]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  const isDefaultView = !searchQuery.trim() && selectedCategory === "All Specialties";

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 space-y-10">
        {/* Top Section */}
        <PageHeading
          eyebrow="MEDIBOOK"
          title="Medical specialties"
          subtitle="Browse every specialty and find the right expert for your symptoms."
        />

        {/* Specialty Search Bar */}
        <div className="relative max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specialties..."
            className="h-12 sm:h-14 pl-12 pr-10 text-base rounded-2xl border-border bg-card shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Search medical specialties"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filter by Category
            </span>
            {(searchQuery || selectedCategory !== "All Specialties") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Specialties");
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
          <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto pb-2">
            {SPECIALTY_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular Specialties Section (Visible on default view) */}
        {isDefaultView && (
          <section className="space-y-6 pt-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Popular specialties</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Find trusted specialists for the most common healthcare needs.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
              {popularSpecialties.map((sp) => (
                <SpecialtyCard key={sp.id} specialty={sp} isPopular />
              ))}
            </div>
          </section>
        )}

        {/* All Specialties Section */}
        <section className="space-y-6 pt-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {isDefaultView ? "All specialties" : "Search results"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isDefaultView
                  ? "Explore our complete range of medical specialties."
                  : `Showing ${filteredSpecialties.length} ${filteredSpecialties.length === 1 ? "specialty" : "specialties"}`}
              </p>
            </div>
          </div>

          {filteredSpecialties.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
              {filteredSpecialties.map((sp) => (
                <SpecialtyCard key={sp.id} specialty={sp} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
              title="No specialties found"
              description="Try searching for another specialty or select a different category."
              actionLabel="Clear search"
              onAction={() => {
                setSearchQuery("");
                setSelectedCategory("All Specialties");
              }}
            />
          )}
        </section>
      </div>
    </PublicLayout>
  );
}

/** Individual Specialty Card Component */
function SpecialtyCard({
  specialty,
  isPopular = false,
}: {
  specialty: MedicalSpecialty;
  isPopular?: boolean;
}) {
  const isSeedSpecialty = specialty.id.startsWith("sp-");
  const doctorSearchTarget = isSeedSpecialty ? { specialty: specialty.id } : { q: specialty.name };

  return (
    <Link
      to="/doctors"
      search={doctorSearchTarget}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isPopular && "bg-gradient-to-b from-card to-primary-soft/10 border-primary/20",
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-105",
              isPopular
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-primary-soft text-primary-soft-foreground group-hover:bg-primary group-hover:text-primary-foreground",
            )}
          >
            <SpecialtyIcon iconName={specialty.iconName} />
          </div>
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {specialty.doctorCount} Doctors
          </span>
        </div>

        <div className="mt-4 space-y-1.5">
          <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
            {specialty.name}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {specialty.description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center text-xs font-semibold text-primary">
        <span>View Doctors</span>
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
