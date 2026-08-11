import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — MediBook" },
      {
        name: "description",
        content: "Appointment reminders, payment receipts and prescription updates.",
      },
      { property: "og:title", content: "Notifications — MediBook" },
      {
        property: "og:description",
        content: "Appointment reminders, payment receipts and prescription updates.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="MediBook"
        title="Notifications"
        subtitle="Appointment reminders, payment receipts and prescription updates."
      />
      <div className="surface-panel p-8 text-sm text-muted-foreground">
        This section is being prepared in the next build step.
      </div>
    </div>
  );
}
