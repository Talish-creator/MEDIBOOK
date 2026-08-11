import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calendar,
  Heart,
  HeartPulse,
  Plus,
  Stethoscope,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, ref } from "@/lib/store";
import type { FamilyMember } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/family")({
  head: () => ({
    meta: [
      { title: "Family members — MediBook" },
      {
        name: "description",
        content: "Create and manage profiles for the family members you book care for.",
      },
      { property: "og:title", content: "Family members — MediBook" },
      {
        property: "og:description",
        content: "Create and manage profiles for the family members you book care for.",
      },
    ],
  }),
  component: FamilyMembersPage,
});

const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Spouse",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Other",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function FamilyMembersPage() {
  const navigate = useNavigate();
  const { user, family, appointments, addFamilyMember, removeFamilyMember } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeProfileMember, setActiveProfileMember] = useState<FamilyMember | null>(null);

  // Add Form State
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<string>("Father");
  const [dob, setDob] = useState("1970-05-15");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");

  const patientId = user?.linkedId ?? "pat-1";

  // Patient's Family Members list
  const memberList = useMemo(() => {
    return (family || []).filter((f) => f.patientId === patientId);
  }, [family, patientId]);

  // Upcoming family appointments count
  const familyAppointmentsCount = useMemo(() => {
    return (appointments || []).filter((a) => a.familyMemberId !== null && a.status === "confirmed")
      .length;
  }, [appointments]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter family member's full name.");
      return;
    }

    addFamilyMember({
      name: name.trim(),
      relation: relationship,
      relationship,
      dob,
      gender,
      phone: phone.trim(),
      bloodGroup,
      allergies: allergies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      medicalConditions: medicalConditions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });

    toast.success(`Added ${name.trim()} to your family profiles.`);
    setShowAddModal(false);
    setName("");
    setPhone("");
    setAllergies("");
    setMedicalConditions("");
  };

  const handleRemove = (id: string, memberName: string) => {
    removeFamilyMember(id);
    toast.success(`Removed ${memberName} from family members.`);
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeading
          eyebrow="MediBook"
          title="Family members"
          subtitle="Create and manage profiles for the family members you book care for."
        />
        <Button
          onClick={() => setShowAddModal(true)}
          className="rounded-2xl px-5 py-3 text-xs font-bold bg-primary text-primary-foreground gap-2 shrink-0 shadow-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Add family member</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="surface-panel p-5 rounded-3xl space-y-2 border border-border">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Family Profiles</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{memberList.length}</p>
        </div>

        <div className="surface-panel p-5 rounded-3xl space-y-2 border border-border">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Upcoming Family Appointments</span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{familyAppointmentsCount}</p>
        </div>
      </div>

      {/* Family Member Cards Grid */}
      <div className="space-y-4">
        {memberList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {memberList.map((m) => {
              const relText = m.relationship || m.relation || "Family";
              const familyApt = appointments.find(
                (a) => a.familyMemberId === m.id && a.status === "confirmed",
              );
              const doctor = familyApt
                ? ref.doctors.find((d) => d.id === familyApt.doctorId)
                : null;

              return (
                <div
                  key={m.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground font-bold text-base">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-foreground">{m.name}</h4>
                          <Badge variant="outline" className="text-[10px] font-semibold mt-0.5">
                            {relText}
                          </Badge>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(m.id, m.name)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        aria-label="Remove family member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 text-xs border-y border-border/70 py-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Blood Group:</span>
                        <span className="font-semibold text-foreground">{m.bloodGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DOB:</span>
                        <span className="font-semibold text-foreground">{m.dob}</span>
                      </div>

                      {familyApt && (
                        <div className="rounded-xl bg-primary-soft/30 p-2.5 space-y-1 mt-2">
                          <span className="text-[11px] font-bold text-primary block">
                            Upcoming Appointment:
                          </span>
                          <p className="text-[11px] font-medium text-foreground">
                            {familyApt.date} at {familyApt.time}{" "}
                            {doctor && `with Dr. ${doctor.name}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveProfileMember(m)}
                      className="rounded-2xl text-xs font-semibold"
                    >
                      View Profile
                    </Button>
                    <Link
                      to="/doctors"
                      className="inline-flex items-center justify-center rounded-2xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                    >
                      Book Care
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="surface-panel p-10 text-center rounded-3xl space-y-3 border border-border">
            <Users className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base text-foreground">No family members added yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add family member profiles so you can easily book appointments and manage
              prescriptions for them.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="rounded-2xl px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground mt-2"
            >
              Add family member profile
            </Button>
          </div>
        )}
      </div>

      {/* Add Family Member Modal */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={() => setShowAddModal(false)}>
          <DialogContent className="rounded-3xl max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                Add Family Member
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Full Name</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ahmed Al-Harbi"
                  className="h-11 rounded-2xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "male" | "female")}
                    className="h-11 w-full rounded-2xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Date of Birth</label>
                  <Input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-11 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Phone (Optional)</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 50 123 4567"
                  className="h-11 rounded-2xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Allergies (Comma separated)</label>
                <Input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="h-11 rounded-2xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">
                  Medical Conditions (Comma separated)
                </label>
                <Input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Asthma"
                  className="h-11 rounded-2xl text-xs"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 rounded-2xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-1/2 rounded-2xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  Add Profile
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Profile Detail Modal */}
      {activeProfileMember && (
        <Dialog
          open={Boolean(activeProfileMember)}
          onOpenChange={() => setActiveProfileMember(null)}
        >
          <DialogContent className="rounded-3xl max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                Family Profile — {activeProfileMember.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="rounded-2xl bg-secondary/60 p-4 space-y-2 border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relationship:</span>
                  <span className="font-semibold text-foreground">
                    {activeProfileMember.relationship ||
                      activeProfileMember.relation ||
                      "Family Member"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DOB:</span>
                  <span className="font-semibold text-foreground">{activeProfileMember.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood Group:</span>
                  <span className="font-semibold text-foreground">
                    {activeProfileMember.bloodGroup}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-semibold text-foreground">
                    {activeProfileMember.phone || "None listed"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Known Allergies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfileMember.allergies && activeProfileMember.allergies.length > 0 ? (
                    activeProfileMember.allergies.map((a) => (
                      <Badge key={a} variant="secondary">
                        {a}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No known allergies</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Chronic Conditions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfileMember.medicalConditions &&
                  activeProfileMember.medicalConditions.length > 0 ? (
                    activeProfileMember.medicalConditions.map((c) => (
                      <Badge key={c} variant="outline">
                        {c}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No chronic conditions listed</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/doctors"
                  onClick={() => setActiveProfileMember(null)}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Book Appointment for {activeProfileMember.name}
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
