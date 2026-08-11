import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const columns = [
  {
    title: "Patients",
    links: [
      { label: "Find doctors", to: "/doctors" },
      { label: "Specialties", to: "/specialties" },
      { label: "Online consultation", to: "/online-consultation" },
      { label: "Offers", to: "/offers" },
    ],
  },
  {
    title: "Doctors & Clinics",
    links: [
      { label: "Hospitals & clinics", to: "/clinics" },
      { label: "Doctor portal", to: "/doctor" },
      { label: "Join MediBook", to: "/auth" },
      { label: "Admin console", to: "/admin" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Health articles", to: "/articles" },
      { label: "My appointments", to: "/app/appointments" },
      { label: "Medical records", to: "/app/records" },
      { label: "Support", to: "/app/settings" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              MediBook connects patients with verified doctors across Saudi Arabia — clinic visits,
              video consultations, prescriptions and medical records in one secure place.
            </p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Instagram, Linkedin, Facebook].map((Icon, i) => (
                <span
                  key={i}
                  className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MediBook. All rights reserved.</p>
          <p>Patient data is encrypted and never shared without consent.</p>
        </div>
      </div>
    </footer>
  );
}
