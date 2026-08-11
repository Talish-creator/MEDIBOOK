import { createFileRoute } from "@tanstack/react-router";
import { Download, FileHeart, Pill } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findDoctor, specialtyName, useStore } from "@/lib/store";
import { formatDate } from "@/lib/slots";

export const Route = createFileRoute("/app/prescriptions")({
  head: () => ({
    meta: [
      { title: "My prescriptions — MediBook" },
      {
        name: "description",
        content:
          "Digital prescriptions with dosage, duration and doctor advice, ready to download.",
      },
      { property: "og:title", content: "My prescriptions — MediBook" },
      {
        property: "og:description",
        content: "Every prescription issued by your MediBook doctors.",
      },
    ],
  }),
  component: PrescriptionsPage,
});

function PrescriptionsPage() {
  const store = useStore();
  const patientId = store.user?.linkedId ?? "";
  const list = store.prescriptions
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Patient portal"
        title="Prescriptions"
        subtitle="Digitally signed prescriptions you can show at any pharmacy."
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<FileHeart className="size-6" />}
          title="No prescriptions yet"
          description="After a completed consultation your doctor's prescription appears here instantly."
          actionLabel="Book a consultation"
          actionTo="/doctors"
        />
      ) : (
        <div className="space-y-4">
          {list.map((p) => {
            const doctor = findDoctor(p.doctorId)!;
            return (
              <article key={p.id} className="surface-panel overflow-hidden">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={doctor.photo} alt="" className="size-11 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {specialtyName(doctor.specialtyId)} · {formatDate(p.date)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success("Prescription PDF downloaded")}
                  >
                    <Download className="size-4" /> Download
                  </Button>
                </header>
                <div className="p-5">
                  <Badge variant="secondary">{p.diagnosis}</Badge>
                  <ul className="mt-4 space-y-3">
                    {p.items.map((i) => (
                      <li key={i.medicine} className="rounded-xl bg-surface p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <Pill className="size-4 text-primary" /> {i.medicine} · {i.dosage}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {i.frequency} · {i.duration} · {i.instructions}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {p.tests.length > 0 && (
                    <p className="mt-4 text-sm">
                      <span className="font-medium">Tests advised:</span>{" "}
                      <span className="text-muted-foreground">{p.tests.join(", ")}</span>
                    </p>
                  )}
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Advice:</span>{" "}
                    <span className="text-muted-foreground">{p.advice}</span>
                  </p>
                  {p.followUp && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Follow-up:</span>{" "}
                      <span className="text-muted-foreground">{formatDate(p.followUp)}</span>
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
