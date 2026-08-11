import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Apple,
  ArrowRight,
  Baby,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Heart,
  HeartPulse,
  Info,
  MapPin,
  MessageCircle,
  Percent,
  Search,
  SearchX,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";
import { EmptyState, PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  HEALTH_OFFERS,
  HealthOffer,
  OFFER_CATEGORIES,
  OfferCategory,
  PARTNER_FACILITIES,
  SAUDI_CITIES,
} from "@/lib/data/offers";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface OffersSearch {
  q?: string | undefined;
  city?: string | undefined;
  cat?: string | undefined;
}

export const Route = createFileRoute("/offers")({
  validateSearch: (search: Record<string, unknown>): OffersSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    city: typeof search["city"] === "string" ? search["city"] : undefined,
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Offers & Packages — MediBook Healthcare Marketplace" },
      {
        name: "description",
        content: "Health checkup packages and seasonal offers from partner clinics.",
      },
      { property: "og:title", content: "Offers and packages — MediBook" },
      {
        property: "og:description",
        content: "Health checkup packages and seasonal offers from partner clinics.",
      },
    ],
  }),
  component: OffersPage,
});

type SortOption = "recommended" | "discount" | "price_asc" | "rating" | "popular";

function OffersPage() {
  const searchParams = Route.useSearch();
  const { user } = useStore();

  const [q, setQ] = useState<string>(searchParams.q ?? "");
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.city ?? "");
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory>(
    (searchParams.cat as OfferCategory) &&
      OFFER_CATEGORIES.includes(searchParams.cat as OfferCategory)
      ? (searchParams.cat as OfferCategory)
      : "All",
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedDiscountRange, setSelectedDiscountRange] = useState<number>(0);
  const [selectedPackageType, setSelectedPackageType] = useState<string>("");
  const [selectedProviderType, setSelectedProviderType] = useState<string>("");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  // Local Favorite Packages
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Modals state
  const [activeDetailsOffer, setActiveDetailsOffer] = useState<HealthOffer | null>(null);
  const [bookingOffer, setBookingOffer] = useState<HealthOffer | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [bookingDate, setBookingDate] = useState<string>("Today");
  const [bookingTime, setBookingTime] = useState<string>("10:30 AM");
  const [bookingPatient, setBookingPatient] = useState<string>("Myself");
  const [bookingConfirmedId, setBookingConfirmedId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Filtered & Sorted Offers logic
  const filteredOffers = useMemo(() => {
    const query = q.trim().toLowerCase();
    return HEALTH_OFFERS.filter((off) => {
      // City filter
      if (selectedCity && off.city !== selectedCity) return false;
      // Category filter
      if (selectedCategory !== "All" && off.category !== selectedCategory) return false;
      // Search query filter
      if (query) {
        const haystack = [off.name, off.description, off.provider, off.city, ...off.includedTests]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      // Price range
      if (selectedPriceRange === "under100" && off.offerPrice >= 100) return false;
      if (selectedPriceRange === "100-200" && (off.offerPrice < 100 || off.offerPrice > 200))
        return false;
      if (selectedPriceRange === "200-500" && (off.offerPrice < 200 || off.offerPrice > 500))
        return false;
      if (selectedPriceRange === "500plus" && off.offerPrice < 500) return false;

      // Discount range
      if (selectedDiscountRange > 0 && off.discountPercentage < selectedDiscountRange) return false;

      // Package type
      if (selectedPackageType && off.packageType !== selectedPackageType) return false;

      // Provider type
      if (selectedProviderType && off.providerType !== selectedProviderType) return false;

      // Availability
      if (selectedAvailability === "today" && off.availability !== "today") return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "discount") return b.discountPercentage - a.discountPercentage;
      if (sortBy === "price_asc") return a.offerPrice - b.offerPrice;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "popular") return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      return b.rating * Math.log(b.reviewCount) - a.rating * Math.log(a.reviewCount);
    });
  }, [
    q,
    selectedCity,
    selectedCategory,
    selectedPriceRange,
    selectedDiscountRange,
    selectedPackageType,
    selectedProviderType,
    selectedAvailability,
    sortBy,
  ]);

  // Featured Offer
  const featuredOffer = useMemo(() => {
    return HEALTH_OFFERS.find((o) => o.featured) ?? HEALTH_OFFERS[0]!;
  }, []);

  // Popular Offers list
  const popularOffers = useMemo(() => {
    return HEALTH_OFFERS.filter((o) => o.popular && !o.featured).slice(0, 6);
  }, []);

  const hasActiveFilters = Boolean(
    q ||
    selectedCity ||
    selectedCategory !== "All" ||
    selectedPriceRange ||
    selectedDiscountRange > 0 ||
    selectedPackageType ||
    selectedProviderType ||
    selectedAvailability,
  );

  const clearAllFilters = () => {
    setQ("");
    setSelectedCity("");
    setSelectedCategory("All");
    setSelectedPriceRange("");
    setSelectedDiscountRange(0);
    setSelectedPackageType("");
    setSelectedProviderType("");
    setSelectedAvailability("");
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleUseMyLocation = () => {
    setSelectedCity("Riyadh");
  };

  const startBooking = (offer: HealthOffer) => {
    setBookingOffer(offer);
    setBookingStep(1);
    setBookingConfirmedId(null);
  };

  const completeDemoBooking = () => {
    const randomId = `PKG-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingConfirmedId(randomId);
    setBookingStep(6);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 space-y-10">
        {/* Introduction */}
        <PageHeading
          eyebrow="MEDIBOOK"
          title="Offers and packages"
          subtitle="Health checkup packages and seasonal offers from partner clinics."
        />

        {/* Hero Search & Location Bar */}
        <div className="surface-panel p-5 sm:p-6 rounded-3xl space-y-4 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-8">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search health packages, tests or services..."
                className="h-12 pl-12 pr-10 text-sm rounded-2xl border-border bg-card shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Search health packages"
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

            {/* Location Selector */}
            <div className="md:col-span-4 flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-border bg-card pl-9 pr-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Location"
                >
                  <option value="">Saudi Arabia (All)</option>
                  {SAUDI_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleUseMyLocation}
                className="h-12 rounded-2xl px-3 text-xs font-semibold shrink-0 gap-1.5"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Use my location</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Offer Categories Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filter by Category
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto pb-2">
            {OFFER_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Health Package (Shown when no search filter active) */}
        {!hasActiveFilters && featuredOffer && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold">
                Featured Package
              </Badge>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Featured health package
              </h2>
            </div>

            <div className="group relative rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full bg-muted overflow-hidden">
                  <img
                    src={featuredOffer.image}
                    alt={featuredOffer.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-emerald-600 text-white border-none font-bold text-xs px-3 py-1">
                      SAVE {featuredOffer.discountPercentage}%
                    </Badge>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>Verified by MediBook · {featuredOffer.provider}</span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground sm:text-2xl group-hover:text-primary transition-colors leading-tight">
                      {featuredOffer.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {featuredOffer.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        Includes {featuredOffer.testCount}+ tests
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {featuredOffer.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {featuredOffer.duration}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-border pt-4">
                    {/* Pricing Callout */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span>Original:</span>
                          <span className="line-through font-semibold">
                            SAR {featuredOffer.originalPrice}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary">
                            SAR {featuredOffer.offerPrice}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Save SAR {featuredOffer.savings}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Valid until {featuredOffer.validUntil}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDetailsOffer(featuredOffer)}
                        className="rounded-2xl py-3 text-xs font-semibold"
                      >
                        View Package
                      </Button>
                      <Button
                        type="button"
                        onClick={() => startBooking(featuredOffer)}
                        className="rounded-2xl py-3 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Book Package
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Popular Health Packages */}
        {!hasActiveFilters && popularOffers.length > 0 && (
          <section className="space-y-5 pt-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Popular health packages
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Take care of your health with curated checkup packages from trusted healthcare
                partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {popularOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isFavorite={favoriteIds.includes(offer.id)}
                  onToggleFavorite={toggleFavorite}
                  onViewDetails={setActiveDetailsOffer}
                  onBook={startBooking}
                />
              ))}
            </div>
          </section>
        )}

        {/* Offers Near You (City Discovery) */}
        {!hasActiveFilters && (
          <section className="space-y-4 pt-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Offers near you
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore accredited diagnostic packages in major Saudi cities.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {["Riyadh", "Jeddah", "Dammam", "Khobar", "Makkah", "Madinah"].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className="group flex flex-col items-center text-center p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:bg-primary-soft/20 transition-all duration-200 shadow-xs"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground group-hover:scale-105 transition-transform mb-2">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                    {city}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {HEALTH_OFFERS.filter((o) => o.city === city || city === "Riyadh").length}{" "}
                    packages
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Trusted Healthcare Partners */}
        {!hasActiveFilters && (
          <section className="space-y-4 pt-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Offers from trusted healthcare partners
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PARTNER_FACILITIES.map((fac) => (
                <div
                  key={fac.id}
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={fac.logo}
                      alt={fac.name}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-foreground truncate max-w-[130px] sm:max-w-[150px]">
                        {fac.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {fac.city} · ★ {fac.rating}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity(fac.city);
                      setQ(fac.name);
                    }}
                    className="text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    View offers
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Health Packages Section & Filter Bar */}
        <section className="space-y-6 pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                All health packages
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredOffers.length} {filteredOffers.length === 1 ? "package" : "packages"}{" "}
                available
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Mobile Sheet Filters Trigger */}
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
                    <SheetTitle className="text-lg font-bold">Filter Packages</SheetTitle>
                    <div className="mt-4">
                      <OffersFilterSidebar
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedCity={selectedCity}
                        setSelectedCity={setSelectedCity}
                        selectedPriceRange={selectedPriceRange}
                        setSelectedPriceRange={setSelectedPriceRange}
                        selectedDiscountRange={selectedDiscountRange}
                        setSelectedDiscountRange={setSelectedDiscountRange}
                        selectedPackageType={selectedPackageType}
                        setSelectedPackageType={setSelectedPackageType}
                        selectedProviderType={selectedProviderType}
                        setSelectedProviderType={setSelectedProviderType}
                        selectedAvailability={selectedAvailability}
                        setSelectedAvailability={setSelectedAvailability}
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
                  aria-label="Sort health packages"
                >
                  <option value="recommended">Recommended</option>
                  <option value="discount">Highest Discount</option>
                  <option value="price_asc">Lowest Price</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Filters Sidebar + Grid */}
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

                <OffersFilterSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedCity={selectedCity}
                  setSelectedCity={setSelectedCity}
                  selectedPriceRange={selectedPriceRange}
                  setSelectedPriceRange={setSelectedPriceRange}
                  selectedDiscountRange={selectedDiscountRange}
                  setSelectedDiscountRange={setSelectedDiscountRange}
                  selectedPackageType={selectedPackageType}
                  setSelectedPackageType={setSelectedPackageType}
                  selectedProviderType={selectedProviderType}
                  setSelectedProviderType={setSelectedProviderType}
                  selectedAvailability={selectedAvailability}
                  setSelectedAvailability={setSelectedAvailability}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </aside>

            {/* Offer Cards Grid */}
            <main className="lg:col-span-9 space-y-6">
              {filteredOffers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      isFavorite={favoriteIds.includes(offer.id)}
                      onToggleFavorite={toggleFavorite}
                      onViewDetails={setActiveDetailsOffer}
                      onBook={startBooking}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
                  title="No health packages found"
                  description="Try changing your filters or searching for another health package."
                  actionLabel="Clear filters"
                  onAction={clearAllFilters}
                />
              )}
            </main>
          </div>
        </section>
      </div>

      {/* Package Details Modal */}
      {activeDetailsOffer && (
        <Dialog open={Boolean(activeDetailsOffer)} onOpenChange={() => setActiveDetailsOffer(null)}>
          <DialogContent className="rounded-3xl max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                {activeDetailsOffer.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-muted">
                <img
                  src={activeDetailsOffer.image}
                  alt={activeDetailsOffer.name}
                  className="h-full w-full object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-3 py-1">
                  SAVE {activeDetailsOffer.discountPercentage}%
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified by MediBook · {activeDetailsOffer.provider}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeDetailsOffer.city} · Duration: {activeDetailsOffer.duration}
                </p>
              </div>

              {/* Pricing Box */}
              <div className="rounded-2xl bg-secondary/60 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground line-through block">
                    Original: SAR {activeDetailsOffer.originalPrice}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    SAR {activeDetailsOffer.offerPrice}
                  </span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-none">
                  Save SAR {activeDetailsOffer.savings}
                </Badge>
              </div>

              {/* Included Tests List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  Included Tests ({activeDetailsOffer.testCount}+ items)
                </h4>
                <div className="rounded-2xl border border-border bg-card p-3 space-y-1.5 max-h-40 overflow-y-auto">
                  {activeDetailsOffer.includedTests.map((test) => (
                    <div
                      key={test}
                      className="flex items-center gap-2 text-xs text-foreground font-medium"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{test}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fasting & Suitable For Info */}
              <div className="space-y-2 text-xs">
                <div className="rounded-xl bg-amber-500/10 dark:bg-amber-950/40 p-3 text-amber-800 dark:text-amber-300 space-y-1">
                  <span className="font-bold block">Preparation Instructions:</span>
                  <p>{activeDetailsOffer.preparationInstructions}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="rounded-2xl text-xs font-semibold"
                >
                  {copiedLink ? "Link Copied!" : "Share Package"}
                </Button>
                <Button
                  onClick={() => {
                    const off = activeDetailsOffer;
                    setActiveDetailsOffer(null);
                    startBooking(off);
                  }}
                  className="rounded-2xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  Book Package
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Interactive 6-Step Package Booking Modal */}
      {bookingOffer && (
        <Dialog open={Boolean(bookingOffer)} onOpenChange={() => setBookingOffer(null)}>
          <DialogContent className="rounded-3xl max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                {bookingStep === 6 ? "Package Booked" : `Book ${bookingOffer.name}`}
              </DialogTitle>
            </DialogHeader>

            {bookingStep < 6 && (
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-b border-border pb-3">
                <span>Step {bookingStep} of 5</span>
                <span className="text-primary font-bold">
                  {bookingStep === 1 && "Select Facility Branch"}
                  {bookingStep === 2 && "Select Date"}
                  {bookingStep === 3 && "Select Time"}
                  {bookingStep === 4 && "Select Patient"}
                  {bookingStep === 5 && "Review & Confirm"}
                </span>
              </div>
            )}

            {/* Step 1: Branch */}
            {bookingStep === 1 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Select Healthcare Branch
                </label>
                <div className="rounded-2xl border border-primary bg-primary-soft/30 p-4 space-y-1">
                  <h4 className="font-bold text-sm text-foreground">{bookingOffer.provider}</h4>
                  <p className="text-xs text-muted-foreground">
                    {bookingOffer.city} Main Branch · Verified Partner
                  </p>
                </div>
                <Button
                  onClick={() => setBookingStep(2)}
                  className="w-full rounded-2xl py-3 text-sm font-bold mt-4"
                >
                  Continue to Select Date
                </Button>
              </div>
            )}

            {/* Step 2: Date */}
            {bookingStep === 2 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Select Appointment Date
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
                          ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                          : "border-border bg-card hover:bg-secondary",
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

            {/* Step 3: Time */}
            {bookingStep === 3 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Select Time Slot ({bookingDate})
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {["8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"].map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBookingTime(t)}
                        className={cn(
                          "rounded-xl border py-2.5 text-xs font-semibold transition-all",
                          bookingTime === t
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border bg-card text-foreground hover:bg-secondary",
                        )}
                      >
                        {t}
                      </button>
                    ),
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
                    Next: Patient Selection
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Patient Selection */}
            {bookingStep === 4 && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Select Patient
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {["Myself", "Father", "Mother", "Spouse", "Child"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setBookingPatient(p)}
                      className={cn(
                        "rounded-2xl border p-3.5 text-left transition-all",
                        bookingPatient === p
                          ? "border-primary bg-primary-soft/40 ring-1 ring-primary shadow-xs"
                          : "border-border bg-card hover:bg-secondary",
                      )}
                    >
                      <User className="h-4 w-4 text-primary mb-1" />
                      <h5 className="font-bold text-xs text-foreground">{p}</h5>
                      {p === "Myself" && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {user?.name ?? "Account Holder"}
                        </p>
                      )}
                    </button>
                  ))}
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
                    Review Summary
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Summary */}
            {bookingStep === 5 && (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl bg-secondary/70 p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-sm text-foreground">{bookingOffer.name}</h4>
                  <p className="text-muted-foreground">
                    {bookingOffer.provider} · {bookingOffer.city}
                  </p>
                  <div className="border-t border-border pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span className="font-semibold text-foreground">
                        {bookingDate} at {bookingTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patient:</span>
                      <span className="font-semibold text-foreground">{bookingPatient}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1">
                      <span className="font-bold text-foreground">Offer Price:</span>
                      <span className="font-bold text-primary text-sm">
                        SAR {bookingOffer.offerPrice}
                      </span>
                    </div>
                  </div>
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
                    onClick={completeDemoBooking}
                    className="w-1/2 rounded-2xl text-xs font-bold bg-primary text-primary-foreground"
                  >
                    Confirm & Book
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation Screen */}
            {bookingStep === 6 && (
              <div className="space-y-5 pt-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Package booked successfully</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Booking Reference ID:{" "}
                    <span className="font-mono font-bold text-primary">{bookingConfirmedId}</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package:</span>
                    <span className="font-semibold text-foreground">{bookingOffer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facility:</span>
                    <span className="font-semibold text-foreground">{bookingOffer.provider}</span>
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
                    onClick={() => setBookingOffer(null)}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    View My Appointments
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setBookingOffer(null)}
                    className="w-full rounded-2xl text-xs font-semibold"
                  >
                    Back to Offers & Packages
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

/** Individual Offer Card Component */
function OfferCard({
  offer,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onBook,
}: {
  offer: HealthOffer;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (offer: HealthOffer) => void;
  onBook: (offer: HealthOffer) => void;
}) {
  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
      <div>
        {/* Cover Image & Badges */}
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          <img
            src={offer.image}
            alt={offer.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Badge className="bg-emerald-600 text-white font-bold border-none text-[11px] px-2.5 py-0.5">
              SAVE {offer.discountPercentage}%
            </Badge>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(offer.id)}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
            aria-label="Save package"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite && "fill-rose-500 text-rose-500",
              )}
            />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{offer.provider}</span>
          </div>

          <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {offer.name}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {offer.description}
          </p>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-y border-border/70 py-2">
            <span>Includes {offer.testCount}+ tests</span>
            <span>{offer.city}</span>
          </div>
        </div>
      </div>

      {/* Pricing & Card Actions */}
      <div className="p-5 pt-0 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs text-muted-foreground line-through block">
              SAR {offer.originalPrice}
            </span>
            <span className="text-xl font-bold text-primary">SAR {offer.offerPrice}</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Save SAR {offer.savings}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onViewDetails(offer)}
            className="rounded-2xl py-2.5 text-xs font-semibold"
          >
            View Package
          </Button>
          <Button
            type="button"
            onClick={() => onBook(offer)}
            className="rounded-2xl py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Book Package
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Offers Filter Sidebar Component */
function OffersFilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedDiscountRange,
  setSelectedDiscountRange,
  selectedPackageType,
  setSelectedPackageType,
  selectedProviderType,
  setSelectedProviderType,
  selectedAvailability,
  setSelectedAvailability,
  clearAllFilters,
}: {
  selectedCategory: OfferCategory;
  setSelectedCategory: (c: OfferCategory) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  selectedPriceRange: string;
  setSelectedPriceRange: (p: string) => void;
  selectedDiscountRange: number;
  setSelectedDiscountRange: (d: number) => void;
  selectedPackageType: string;
  setSelectedPackageType: (t: string) => void;
  selectedProviderType: string;
  setSelectedProviderType: (p: string) => void;
  selectedAvailability: string;
  setSelectedAvailability: (a: string) => void;
  clearAllFilters: () => void;
}) {
  return (
    <div className="space-y-5 text-xs">
      {/* Category */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as OfferCategory)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {OFFER_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          City Location
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
          <option value="">Any Price</option>
          <option value="under100">Under SAR 100</option>
          <option value="100-200">SAR 100 – SAR 200</option>
          <option value="200-500">SAR 200 – SAR 500</option>
          <option value="500plus">SAR 500+</option>
        </select>
      </div>

      {/* Discount Percentage */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Minimum Discount
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { val: 0, label: "Any" },
            { val: 20, label: "20%+" },
            { val: 30, label: "30%+" },
            { val: 40, label: "40%+" },
          ].map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => setSelectedDiscountRange(d.val)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 font-semibold transition-all",
                selectedDiscountRange === d.val
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Type */}
      <div>
        <label className="font-bold text-foreground uppercase tracking-wider block mb-2">
          Provider Type
        </label>
        <select
          value={selectedProviderType}
          onChange={(e) => setSelectedProviderType(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All Provider Types</option>
          <option value="Hospital">Hospital</option>
          <option value="Clinic">Clinic</option>
          <option value="Diagnostic Center">Diagnostic Center</option>
          <option value="Laboratory">Laboratory</option>
        </select>
      </div>

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
