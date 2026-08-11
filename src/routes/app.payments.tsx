import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileCheck,
  FileText,
  Filter,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, ref, specialtyName } from "@/lib/store";
import type { Payment } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/payments")({
  head: () => ({
    meta: [
      { title: "Payments and invoices — MediBook" },
      {
        name: "description",
        content: "Review payments, refunds and invoices for every appointment.",
      },
      { property: "og:title", content: "Payments and invoices — MediBook" },
      {
        property: "og:description",
        content: "Review payments, refunds and invoices for every appointment.",
      },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { user, payments = [], appointments = [] } = useStore();

  const [q, setQ] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [activeInvoicePayment, setActiveInvoicePayment] = useState<Payment | null>(null);

  const patientId = user?.linkedId ?? "pat-1";

  // Patient Payments list
  const userPayments = useMemo(() => {
    return (payments || []).filter((p) => p && p.patientId === patientId);
  }, [payments, patientId]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    const query = q.trim().toLowerCase();
    return userPayments
      .filter((p) => {
        if (!p) return false;
        // Status Filter
        if (selectedStatus !== "All" && p.status !== selectedStatus) return false;
        // Search Query
        if (query) {
          const doctor = (ref.doctors || []).find((d) => d && d.id === p.doctorId);
          const haystack = [p.id, p.transactionId, p.method, doctor?.name ?? ""]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
  }, [userPayments, q, selectedStatus]);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalSpent = userPayments
      .filter((p) => p.status === "Paid")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const thisMonthSpent = userPayments
      .filter((p) => p.status === "Paid" && p.date && p.date.startsWith("2026-08"))
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const pendingCount = userPayments.filter((p) => p.status === "Pending").length;
    const refundsCount = userPayments.filter((p) => p.status === "Refunded").length;

    return { totalSpent, thisMonthSpent, pendingCount, refundsCount };
  }, [userPayments]);

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-none">
            Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border-none">
            Pending
          </Badge>
        );
      case "Refunded":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border-none">
            Refunded
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 font-bold border-none">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <PageHeading
        eyebrow="MediBook"
        title="Payments and invoices"
        subtitle="Review payments, refunds and invoices for every appointment."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spent", val: `SAR ${stats.totalSpent}`, icon: Receipt },
          { label: "Spent This Month", val: `SAR ${stats.thisMonthSpent}`, icon: Calendar },
          { label: "Pending Payments", val: stats.pendingCount, icon: Clock },
          { label: "Refunds", val: stats.refundsCount, icon: RefreshCw },
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

      {/* Search & Filter Bar */}
      <div className="surface-panel p-5 rounded-3xl space-y-4 border border-border">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by transaction ID, invoice or doctor name..."
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase hidden sm:inline">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 rounded-2xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="All">All Transactions</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table & Cards */}
      <div className="space-y-4">
        {filteredPayments.length > 0 ? (
          <div className="surface-panel rounded-3xl overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground font-semibold uppercase border-b border-border">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Doctor / Facility</th>
                    <th className="p-4">Appointment</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium text-foreground">
                  {filteredPayments.map((p) => {
                    const doctor = (ref.doctors || []).find((d) => d && d.id === p.doctorId);
                    return (
                      <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-4 text-muted-foreground">{p.date}</td>
                        <td className="p-4">
                          <span className="font-bold text-foreground block">
                            {doctor?.name ?? "Specialist Clinic"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {doctor ? specialtyName(doctor.specialtyId) : "Medical Service"}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-primary">
                          {p.appointmentId}
                        </td>
                        <td className="p-4 flex items-center gap-1.5 pt-5">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{p.method}</span>
                        </td>
                        <td className="p-4 font-bold text-foreground">SAR {p.amount}</td>
                        <td className="p-4">{getStatusBadge(p.status)}</td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveInvoicePayment(p)}
                            className="rounded-xl text-xs font-semibold gap-1"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>Invoice</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="surface-panel p-10 text-center rounded-3xl space-y-3 border border-border">
            <Receipt className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base text-foreground">No payment history found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your appointment payment history and digital invoices will appear here once you book
              consultations.
            </p>
          </div>
        )}
      </div>

      {/* Commercial Invoice Modal */}
      {activeInvoicePayment && (
        <Dialog
          open={Boolean(activeInvoicePayment)}
          onOpenChange={() => setActiveInvoicePayment(null)}
        >
          <DialogContent className="rounded-3xl max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Official Payment Invoice
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-2 text-xs">
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">MediBook Health</h3>
                  <p className="text-[11px] text-muted-foreground">Kingdom of Saudi Arabia</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-foreground block">
                    {activeInvoicePayment.id}
                  </span>
                  <span className="text-muted-foreground">{activeInvoicePayment.date}</span>
                </div>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-secondary/50 p-4 border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block uppercase">
                    Billed To:
                  </span>
                  <span className="font-bold text-foreground block mt-0.5">
                    {user?.name ?? "Patient Account"}
                  </span>
                  <span className="text-muted-foreground">{user?.email}</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block uppercase">
                    Provider:
                  </span>
                  <span className="font-bold text-foreground block mt-0.5">
                    {ref.doctors.find((d) => d.id === activeInvoicePayment.doctorId)?.name ??
                      "Healthcare Provider"}
                  </span>
                  <span className="text-muted-foreground">
                    Appointment ID: {activeInvoicePayment.appointmentId}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-secondary/70 font-semibold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3">Doctor Consultation Fee</td>
                      <td className="p-3 text-right font-bold">
                        SAR {activeInvoicePayment.amount - (activeInvoicePayment.tax ?? 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">VAT (15%)</td>
                      <td className="p-3 text-right font-bold">
                        SAR{" "}
                        {activeInvoicePayment.tax ?? Math.round(activeInvoicePayment.amount * 0.15)}
                      </td>
                    </tr>
                    <tr className="bg-primary-soft/30 font-bold text-foreground">
                      <td className="p-3">Total Paid</td>
                      <td className="p-3 text-right text-primary text-sm">
                        SAR {activeInvoicePayment.amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Transaction Info */}
              <div className="rounded-2xl bg-secondary/40 p-3 space-y-1 text-[11px] border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Ref:</span>
                  <span className="font-mono font-bold text-foreground">
                    {activeInvoicePayment.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold text-foreground">
                    {activeInvoicePayment.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {activeInvoicePayment.status}
                  </span>
                </div>
              </div>

              {/* Print & Download Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="w-1/2 rounded-2xl text-xs font-semibold gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Invoice</span>
                </Button>
                <Button
                  onClick={() => toast.success(`Downloaded Invoice PDF ${activeInvoicePayment.id}`)}
                  className="w-1/2 rounded-2xl text-xs font-bold bg-primary text-primary-foreground gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
