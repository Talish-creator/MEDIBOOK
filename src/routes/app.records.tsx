import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileCode,
  FilePlus,
  FileText,
  Filter,
  FolderOpen,
  Image as ImageIcon,
  Paperclip,
  Plus,
  Search,
  Share2,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, ref } from "@/lib/store";
import type { MedicalRecord, RecordType } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/records")({
  head: () => ({
    meta: [
      { title: "Medical records — MediBook" },
      {
        name: "description",
        content: "Upload and organise blood tests, X-rays, MRI scans and medical reports securely.",
      },
      { property: "og:title", content: "Medical records — MediBook" },
      {
        property: "og:description",
        content: "Upload and organise blood tests, X-rays, MRI scans and medical reports securely.",
      },
    ],
  }),
  component: MedicalRecordsPage,
});

const RECORD_TYPES: RecordType[] = [
  "Lab Report",
  "Prescription",
  "X-Ray / Scan",
  "Doctor Note",
  "Vaccination Record",
  "Discharge Summary",
  "Other",
];

function MedicalRecordsPage() {
  const { user, records, family, addRecord, deleteRecord } = useStore();

  const [q, setQ] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeViewRecord, setActiveViewRecord] = useState<MedicalRecord | null>(null);

  // Upload Form State
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState<RecordType>("Lab Report");
  const [uploadMemberId, setUploadMemberId] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");

  const patientId = user?.linkedId ?? "pat-1";

  // Patient Records List
  const userRecords = useMemo(() => {
    return (records || []).filter((r) => r.patientId === patientId);
  }, [records, patientId]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    const query = q.trim().toLowerCase();
    return userRecords
      .filter((rec) => {
        // Type Filter
        if (selectedType !== "All" && rec.type !== selectedType) return false;
        // Family Member Filter
        if (selectedMemberId === "self" && rec.familyMemberId !== null) return false;
        if (
          selectedMemberId !== "all" &&
          selectedMemberId !== "self" &&
          rec.familyMemberId !== selectedMemberId
        ) {
          return false;
        }
        // Search Query
        if (query) {
          const haystack = [rec.name, rec.type, rec.date].join(" ").toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userRecords, q, selectedType, selectedMemberId]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = userRecords.length;
    const thisMonth = userRecords.filter((r) => r.date && r.date.startsWith("2026-08")).length;
    const labReports = userRecords.filter(
      (r) => r.type === "Lab Report" || r.type === "Blood test",
    ).length;
    const sharedWithDocs = userRecords.filter((r) => r.doctorId !== null).length;

    return { total, thisMonth, labReports, sharedWithDocs };
  }, [userRecords]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) {
      toast.error("Please enter a record name.");
      return;
    }

    addRecord({
      name: uploadName.trim(),
      type: uploadType,
      familyMemberId: uploadMemberId,
    });

    toast.success("Medical record uploaded successfully.");
    setShowUploadModal(false);
    setUploadName("");
    setUploadFileName("");
    setUploadMemberId(null);
  };

  const handleDelete = (id: string, name: string) => {
    deleteRecord(id);
    toast.success(`Removed "${name}".`);
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "Lab Report":
      case "Blood test":
        return <FileText className="h-5 w-5 text-emerald-600" />;
      case "Prescription":
        return <FileCheck className="h-5 w-5 text-blue-600" />;
      case "X-Ray / Scan":
      case "X-ray":
      case "CT scan":
      case "MRI":
        return <ImageIcon className="h-5 w-5 text-amber-600" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeading
          eyebrow="MediBook"
          title="Medical records"
          subtitle="Upload and organise blood tests, X-rays, MRI scans and medical reports securely."
        />
        <Button
          onClick={() => setShowUploadModal(true)}
          className="rounded-2xl px-5 py-3 text-xs font-bold bg-primary text-primary-foreground gap-2 shrink-0 shadow-xs"
        >
          <Upload className="h-4 w-4" />
          <span>Upload medical record</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Records", val: stats.total, icon: FolderOpen },
          { label: "Uploaded This Month", val: stats.thisMonth, icon: Clock },
          { label: "Lab Reports", val: stats.labReports, icon: FileText },
          { label: "Shared with Doctors", val: stats.sharedWithDocs, icon: Share2 },
        ].map((s) => {
          const IconComp = s.icon;
          return (
            <div
              key={s.label}
              className="surface-panel p-5 rounded-3xl space-y-2 border border-border"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold">{s.label}</span>
                <IconComp className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.val}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filters Bar */}
      <div className="surface-panel p-5 rounded-3xl space-y-4 border border-border">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search records by name or type..."
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

          {/* Family Member Filter */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary shrink-0" />
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="h-11 rounded-2xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="all">All Profiles</option>
              <option value="self">Myself ({user?.name ?? "Patient"})</option>
              {(family || []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.relationship || f.relation || "Family"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Category Filter Pills */}
        <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto pt-1">
          {["All", ...RECORD_TYPES].map((type) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-secondary/70 text-secondary-foreground hover:bg-secondary",
                )}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Medical Record Table & Cards */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          <div className="surface-panel rounded-3xl overflow-hidden border border-border">
            <div className="divide-y divide-border">
              {filteredRecords.map((rec) => {
                const member = (family || []).find((f) => f.id === rec.familyMemberId);
                const relText = member
                  ? member.relationship || member.relation || "Family"
                  : "Self";
                const doctor = rec.doctorId ? ref.doctors.find((d) => d.id === rec.doctorId) : null;
                return (
                  <div
                    key={rec.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
                        {getRecordIcon(rec.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground">{rec.name}</h4>
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {rec.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Patient:{" "}
                          <span className="font-semibold text-foreground">
                            {member ? `${member.name} (${relText})` : (user?.name ?? "Self")}
                          </span>
                          {doctor && <span> · Dr. {doctor.name}</span>}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Uploaded: {rec.date} · {rec.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveViewRecord(rec)}
                        className="rounded-xl text-xs font-semibold gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success(`Downloading "${rec.name}"`)}
                        className="rounded-xl text-xs font-semibold gap-1"
                      >
                        <Download className="h-3.5 w-3.5 text-primary" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rec.id, rec.name)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        aria-label="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="surface-panel p-10 text-center rounded-3xl space-y-3 border border-border">
            <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base text-foreground">No medical records found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Upload blood tests, X-rays or prescriptions to keep your healthcare history organized.
            </p>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="rounded-2xl px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground mt-2"
            >
              Upload your first record
            </Button>
          </div>
        )}
      </div>

      {/* Medical History Timeline */}
      <section className="surface-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-border">
        <h3 className="font-bold text-lg text-foreground">Medical history timeline</h3>

        <div className="relative pl-6 border-l-2 border-primary/30 space-y-6">
          {filteredRecords.slice(0, 5).map((rec) => (
            <div key={rec.id} className="relative">
              <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-primary">{rec.date}</span>
                <h4 className="font-bold text-sm text-foreground">{rec.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Categorized under {rec.type} · File size {rec.size}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload Modal */}
      {showUploadModal && (
        <Dialog open={showUploadModal} onOpenChange={() => setShowUploadModal(false)}>
          <DialogContent className="rounded-3xl max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                Upload Medical Record
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
              <div className="border-2 border-dashed border-border rounded-2xl p-5 text-center space-y-2 bg-secondary/20">
                <Upload className="h-6 w-6 text-primary mx-auto" />
                <p className="text-xs font-semibold text-foreground">
                  {uploadFileName ? uploadFileName : "Click or drop file to upload"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Supported formats: PDF, PNG, JPG (max 15MB)
                </p>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFileName(file.name);
                      if (!uploadName) setUploadName(file.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="hidden"
                  id="fileInput"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("fileInput")?.click()}
                  className="rounded-xl text-xs font-semibold"
                >
                  Browse file
                </Button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Document Name</label>
                <Input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. CBC Blood Test Report"
                  className="h-11 rounded-2xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Record Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as RecordType)}
                  className="h-11 w-full rounded-2xl border border-border bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Patient Profile</label>
                <select
                  value={uploadMemberId ?? ""}
                  onChange={(e) => setUploadMemberId(e.target.value ? e.target.value : null)}
                  className="h-11 w-full rounded-2xl border border-border bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Myself ({user?.name ?? "Patient"})</option>
                  {(family || []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.relationship || f.relation || "Family"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="w-1/2 rounded-2xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-1/2 rounded-2xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  Save Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Record Viewer Modal */}
      {activeViewRecord && (
        <Dialog open={Boolean(activeViewRecord)} onOpenChange={() => setActiveViewRecord(null)}>
          <DialogContent className="rounded-3xl max-w-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                {activeViewRecord.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="rounded-2xl bg-secondary/50 p-4 space-y-2 text-xs border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold text-foreground">{activeViewRecord.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded Date:</span>
                  <span className="font-semibold text-foreground">{activeViewRecord.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-semibold text-foreground">{activeViewRecord.size}</span>
                </div>
              </div>

              <div className="h-48 rounded-2xl bg-muted border border-border flex items-center justify-center text-center p-4">
                <div className="space-y-2">
                  <FileText className="h-10 w-10 text-primary mx-auto" />
                  <p className="text-xs font-bold text-foreground">Encrypted Document Preview</p>
                  <p className="text-[11px] text-muted-foreground">
                    Previewing {activeViewRecord.name}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => toast.success("Share link generated for doctor")}
                  className="w-1/2 rounded-2xl text-xs font-semibold"
                >
                  Share with Doctor
                </Button>
                <Button
                  onClick={() => toast.success(`Downloading ${activeViewRecord.name}`)}
                  className="w-1/2 rounded-2xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  Download File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
