import { Link } from "@tanstack/react-router";
import { CalendarCheck, MapPin, ShieldCheck, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/brand/Stars";
import { findClinic, specialtyName, useStore } from "@/lib/store";
import { currency, nextAvailable } from "@/lib/slots";
import type { Doctor } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

export function DoctorCard({
  doctor,
  layout = "list",
}: {
  doctor: Doctor;
  layout?: "list" | "grid";
}) {
  const { appointments, favorites, toggleFavorite, verification } = useStore();
  const next = nextAvailable(doctor, appointments);
  const clinic = findClinic(doctor.clinics[0]!.clinicId);
  const verified = (verification[doctor.id] ?? doctor.verification) === "Verified";
  const isFav = favorites.includes(doctor.id);

  return (
    <article
      className={cn(
        "surface-panel group relative p-4 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-5",
        layout === "grid" ? "flex flex-col" : "",
      )}
    >
      <button
        type="button"
        onClick={() => toggleFavorite(doctor.id)}
        aria-label={isFav ? "Remove from favourites" : "Save doctor"}
        className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-border bg-background/70 text-muted-foreground transition-colors hover:text-destructive"
      >
        <Heart className={cn("size-4", isFav && "fill-destructive text-destructive")} />
      </button>

      <div className={cn("flex gap-4", layout === "grid" && "flex-col items-start")}>
        <img
          src={doctor.photo}
          alt={`Portrait of ${doctor.name}`}
          loading="lazy"
          className="size-20 shrink-0 rounded-2xl object-cover sm:size-24"
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2 pr-10">
            <h3 className="truncate text-base font-semibold sm:text-lg">{doctor.name}</h3>
            {verified && (
              <Badge
                variant="secondary"
                className="gap-1 bg-primary-soft text-primary-soft-foreground"
              >
                <ShieldCheck className="size-3" /> Verified
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm font-medium text-primary">
            {specialtyName(doctor.specialtyId)}
          </p>
          <p className="text-xs text-muted-foreground">
            {doctor.qualifications.join(", ")} · {doctor.years} yrs experience
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {clinic?.name} · {doctor.city}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5">
              <Stars value={doctor.rating} />
              <span className="font-semibold">{doctor.rating}</span>
              <span className="text-muted-foreground">({doctor.reviewCount})</span>
            </span>
            <span className="font-semibold">{currency(doctor.fee)}</span>
            {doctor.onlineConsultation && (
              <Badge variant="outline" className="gap-1 text-[0.7rem]">
                <Video className="size-3" /> Online
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-xs">
          <CalendarCheck className="size-4 text-success" />
          {next ? (
            <span>
              Next available <span className="font-semibold">{next.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">No slots in the next 14 days</span>
          )}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Link to="/doctors/$doctorId" params={{ doctorId: doctor.id }}>
              View Profile
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1 sm:flex-none">
            <Link to="/book/$doctorId" params={{ doctorId: doctor.id }}>
              Book Appointment
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
