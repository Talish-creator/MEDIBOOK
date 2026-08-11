import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/app/consult/$appointmentId")({
  head: () => ({
    meta: [
      { title: "Online consultation — MediBook" },
      { name: "description", content: "Join your secure video or audio consultation room." },
      { property: "og:title", content: "Online consultation — MediBook" },
      { property: "og:description", content: "Join your secure video or audio consultation room." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="MediBook"
        title="Online consultation"
        subtitle="Join your secure video or audio consultation room."
      />
      <div className="surface-panel p-8 text-sm text-muted-foreground">
        This section is being prepared in the next build step.
      </div>
    </div>
  );
}
