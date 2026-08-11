import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FACILITIES, Facility } from "@/lib/data/facilities";
import { ref, specialtyName } from "@/lib/store";

export const Route = createFileRoute("/clinics/$clinicId")({
  head: ({ params }) => {
    const facility = FACILITIES.find((f) => f.id === params.clinicId || f.slug === params.clinicId);
    const name = facility?.name ?? "Facility profile";
    return {
      meta: [
        { title: `${name} — MediBook` },
        {
          name: "description",
          content: `Facilities, services, doctors and opening hours for ${name}.`,
        },
        { property: "og:title", content: `${name} — MediBook` },
        {
          property: "og:description",
          content: `Facilities, services, doctors and opening hours for ${name}.`,
        },
      ],
    };
  },
  component: FacilityProfilePage,
});

function FacilityProfilePage() {
  const { clinicId } = Route.useParams();

  const facility: Facility = useMemo(() => {
    const found = FACILITIES.find((f) => f.id === clinicId || f.slug === clinicId);
    if (found) return found;

    // Fallback if seeded clinic ID is passed
    const seedClinic = ref.clinics.find((c) => c.id === clinicId);
    if (seedClinic) {
      return {
        id: seedClinic.id,
        name: seedClinic.name,
        slug: seedClinic.id,
        type: "Clinic",
        description: "Accredited polyclinic providing quality outpatient healthcare services.",
        verified: true,
        city: seedClinic.city,
        address: seedClinic.address,
        latitude: 24.7136,
        longitude: 46.6753,
        phone: seedClinic.phone,
        website: "https://medibook.sa",
        rating: seedClinic.rating,
        reviewCount: seedClinic.reviews,
        doctorCount: 42,
        specialties: ["General Medicine", "Dentistry", "Dermatology", "Pediatrics"],
        services: seedClinic.services,
        openingHours: seedClinic.openingHours,
        isOpenNow: true,
        is24Hours: false,
        image: seedClinic.image,
        featured: false,
        onlineConsultation: true,
      };
    }

    // Default fallback facility
    return FACILITIES[0]!;
  }, [clinicId]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 space-y-8">
        {/* Back Link */}
        <Link
          to="/clinics"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Hospitals & Clinics</span>
        </Link>

        {/* Hero Banner Section */}
        <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-card">
          <div className="relative h-64 sm:h-80 w-full bg-muted">
            <img src={facility.image} alt={facility.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge className="bg-black/60 text-white backdrop-blur-md border-none px-3 py-1 font-semibold">
                {facility.type}
              </Badge>
              {facility.verified && (
                <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md border-none px-3 py-1 font-semibold gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified by MediBook
                </Badge>
              )}
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <h1 className="text-2xl font-bold sm:text-4xl tracking-tight leading-tight">
                {facility.name}
              </h1>
              <p className="flex items-center gap-2 text-xs sm:text-sm text-white/90 font-medium">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {facility.city} · {facility.address}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border bg-card">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Rating
              </span>
              <div className="flex items-center gap-1.5 font-bold text-foreground text-base">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{facility.rating.toFixed(1)}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  ({facility.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Status
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {facility.is24Hours
                  ? "Open 24 Hours"
                  : facility.isOpenNow
                    ? "Open Today"
                    : "Closed"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Doctors
              </span>
              <span className="font-bold text-foreground text-base">
                {facility.doctorCount}+ Verified
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Contact
              </span>
              <span className="font-bold text-foreground text-sm truncate block">
                {facility.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Section */}
            <div className="surface-panel p-6 rounded-3xl space-y-3">
              <h2 className="text-lg font-bold text-foreground">About the Facility</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {facility.description} Equipped with modern diagnostic infrastructure, accredited
                medical staff, and digital appointment scheduling.
              </p>
            </div>

            {/* Medical Specialties */}
            <div className="surface-panel p-6 rounded-3xl space-y-4">
              <h2 className="text-lg font-bold text-foreground">Medical Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {facility.specialties.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs"
                  >
                    <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Services */}
            <div className="surface-panel p-6 rounded-3xl space-y-4">
              <h2 className="text-lg font-bold text-foreground">Available Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {facility.services.map((srv) => (
                  <div
                    key={srv}
                    className="flex items-center gap-2 rounded-2xl bg-secondary/80 px-3.5 py-2.5 text-xs font-semibold text-secondary-foreground"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info & Action */}
          <div className="lg:col-span-4 space-y-6">
            <div className="surface-panel p-6 rounded-3xl space-y-6 sticky top-24">
              <div className="space-y-3">
                <h3 className="font-bold text-base text-foreground">
                  Find Doctors at {facility.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Browse verified specialist doctors working at this facility.
                </p>
                <Link
                  to="/doctors"
                  search={{ q: facility.name }}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm text-center"
                >
                  Find a Doctor Here
                </Link>
              </div>

              <div className="border-t border-border pt-4 space-y-3 text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">Opening Hours</span>
                    <span>{facility.openingHours}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">Phone</span>
                    <span>{facility.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Globe className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">Official Website</span>
                    <a
                      href={facility.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {facility.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
