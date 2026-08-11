import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Search,
  SearchX,
  Star,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, ref, specialtyName } from "@/lib/store";
import type { Doctor } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/saved")({
  head: () => ({
    meta: [
      { title: "Saved doctors — MediBook" },
      { name: "description", content: "The specialists you bookmarked to book later." },
      { property: "og:title", content: "Saved doctors — MediBook" },
      { property: "og:description", content: "The specialists you bookmarked to book later." },
    ],
  }),
  component: SavedDoctorsPage,
});

function SavedDoctorsPage() {
  const { favorites = [], toggleFavorite } = useStore();

  const [q, setQ] = useState("");
  const [doctorToRemove, setDoctorToRemove] = useState<Doctor | null>(null);

  // Saved Doctors objects
  const savedDoctorList = useMemo(() => {
    return (favorites || [])
      .map((id) => (ref.doctors || []).find((d) => d && d.id === id))
      .filter((d): d is Doctor => d !== undefined);
  }, [favorites]);

  // Filtered Saved Doctors
  const filteredSavedDoctors = useMemo(() => {
    const query = q.trim().toLowerCase();
    return savedDoctorList.filter((doc) => {
      if (!doc) return false;
      if (!query) return true;
      const specName = specialtyName(doc.specialtyId);
      const haystack = [doc.name || "", specName || "", doc.city || ""].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [savedDoctorList, q]);

  const handleConfirmRemove = () => {
    if (doctorToRemove) {
      toggleFavorite(doctorToRemove.id);
      toast.success(`Removed ${doctorToRemove.name} from saved doctors.`);
      setDoctorToRemove(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <PageHeading
        eyebrow="MediBook"
        title="Saved doctors"
        subtitle="The specialists you bookmarked to book later."
      />

      {/* Search Bar */}
      {savedDoctorList.length > 0 && (
        <div className="surface-panel p-5 rounded-3xl space-y-4 border border-border">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search saved doctors by name, specialty or city..."
              className="h-11 pl-10 pr-8 text-xs rounded-2xl border-border bg-card shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Saved Doctor Cards Grid */}
      <div className="space-y-4">
        {filteredSavedDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSavedDoctors.map((doc) => (
              <SavedDoctorCard key={doc.id} doctor={doc} onRemoveRequest={setDoctorToRemove} />
            ))}
          </div>
        ) : savedDoctorList.length === 0 ? (
          /* Empty Saved Doctors State */
          <div className="surface-panel p-10 text-center rounded-3xl space-y-3 border border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mx-auto">
              <Heart className="h-6 w-6 fill-rose-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">No saved doctors yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Save doctors you like so you can quickly find and book them later.
            </p>
            <Link
              to="/doctors"
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
            >
              Find a doctor
            </Link>
          </div>
        ) : (
          /* No Search Results Match */
          <div className="surface-panel p-10 text-center rounded-3xl space-y-3 border border-border">
            <SearchX className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base text-foreground">No matching saved doctors</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No saved doctor matches your search query "{q}".
            </p>
            <Button
              onClick={() => setQ("")}
              className="rounded-2xl px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground mt-2"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      {doctorToRemove && (
        <Dialog open={Boolean(doctorToRemove)} onOpenChange={() => setDoctorToRemove(null)}>
          <DialogContent className="rounded-3xl max-w-sm p-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                Remove Saved Doctor?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <p className="text-muted-foreground">
                Remove <span className="font-bold text-foreground">{doctorToRemove.name}</span> from
                your saved doctors list?
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDoctorToRemove(null)}
                  className="w-1/2 rounded-2xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRemove}
                  className="w-1/2 rounded-2xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/** Individual Saved Doctor Card Component */
function SavedDoctorCard({
  doctor,
  onRemoveRequest,
}: {
  doctor: Doctor;
  onRemoveRequest: (doc: Doctor) => void;
}) {
  const specName = specialtyName(doctor.specialtyId);
  const ratingText = typeof doctor.rating === "number" ? doctor.rating.toFixed(1) : "4.9";
  const qualificationsText = (doctor.qualifications || []).join(" · ");

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
      <div>
        {/* Top Doctor Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="h-14 w-14 rounded-2xl object-cover"
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-foreground text-sm truncate">{doctor.name}</h3>
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              </div>
              <p className="text-xs font-semibold text-primary">{specName}</p>
              {qualificationsText && (
                <p className="text-[11px] text-muted-foreground truncate">{qualificationsText}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRemoveRequest(doctor)}
            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
            aria-label="Remove saved doctor"
          >
            <Heart className="h-4 w-4 fill-rose-500" />
          </button>
        </div>

        {/* Rating, Reviews & Location */}
        <div className="mt-4 flex items-center justify-between border-y border-border/70 py-2.5 text-xs">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="font-bold text-foreground">{ratingText}</span>
            <span className="text-muted-foreground">({doctor.reviewCount ?? 0})</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground font-medium">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{doctor.city}</span>
          </div>
        </div>

        {/* Experience & Fee */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{doctor.years ?? 5} years experience</span>
          <span className="font-bold text-foreground">SAR {doctor.fee ?? 150} fee</span>
        </div>

        {/* Next Available Badge */}
        <div className="mt-3 flex items-center gap-1.5 rounded-2xl bg-primary-soft/30 p-2.5 text-xs text-primary font-semibold">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Next available: Today · 6:30 PM</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link
          to="/doctors/$doctorId"
          params={{ doctorId: doctor.id }}
          className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors text-center"
        >
          View Profile
        </Link>
        <Link
          to="/book/$doctorId"
          params={{ doctorId: doctor.id }}
          className="inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground px-3 py-2.5 text-xs font-bold hover:bg-primary/90 transition-colors text-center"
        >
          Book Care
        </Link>
      </div>
    </div>
  );
}
