import type { Appointment } from "./data/types";

export interface ERPNextAppointmentPayload {
  doctype: "MediBook Appointment";
  appointment_id: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  fee: number;
  status: string;
  payment_status: string;
}

interface PendingSyncItem {
  appointment: Appointment;
  doctorName: string;
  specialty: string;
  createdAt: number;
}

const QUEUE_STORAGE_KEY = "medibook_pending_syncs_v1";

function getPendingQueue(): PendingSyncItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingSyncItem[]) : [];
  } catch {
    return [];
  }
}

function savePendingQueue(queue: PendingSyncItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

function addToPendingQueue(appointment: Appointment, doctorName: string, specialty: string) {
  const queue = getPendingQueue();
  if (!queue.some((i) => i.appointment.id === appointment.id)) {
    queue.push({
      appointment,
      doctorName,
      specialty,
      createdAt: Date.now(),
    });
    savePendingQueue(queue);
  }
}

function removeFromPendingQueue(appointmentId: string) {
  const queue = getPendingQueue().filter((i) => i.appointment.id !== appointmentId);
  savePendingQueue(queue);
}

/**
 * Sends a real-time booking payload to ERPNext MediBook Appointment DocType via
 * Vercel Serverless Function (/api/sync).
 * Zero API keys are included in client JavaScript code.
 */
export async function sendAppointmentToERPNext(
  appointment: Appointment,
  doctorName: string,
  specialty: string,
): Promise<boolean> {
  const payload: ERPNextAppointmentPayload = {
    doctype: "MediBook Appointment",
    appointment_id: appointment.id,
    patient_name: appointment.forName,
    doctor_name: doctorName,
    specialty: specialty,
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    consultation_type:
      appointment.type === "in-clinic"
        ? "In-Clinic"
        : appointment.type === "video"
          ? "Video"
          : "Audio",
    fee: appointment.fee,
    status: appointment.status === "confirmed" ? "Confirmed" : "Pending",
    payment_status:
      appointment.paymentStatus === "Paid"
        ? "Paid"
        : appointment.paymentStatus === "Pay at Clinic"
          ? "Pay at Clinic"
          : "Pending",
  };

  addToPendingQueue(appointment, doctorName, specialty);

  if (typeof window !== "undefined") {
    try {
      const syncUrl = `${window.location.origin}/api/sync`;
      console.log(`[ERPNext] Syncing ${appointment.id} via ${syncUrl}...`);

      const serverlessRes = await fetch(syncUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      const contentType = serverlessRes.headers.get("content-type") || "";
      if (serverlessRes.ok && contentType.includes("application/json")) {
        const json = await serverlessRes.json();
        console.log(`[ERPNext] ✅ Sync SUCCESS via /api/sync for ${appointment.id}`, json);
        removeFromPendingQueue(appointment.id);
        return true;
      } else {
        const errText = await serverlessRes.text();
        console.error(
          `[ERPNext] ❌ /api/sync returned ${serverlessRes.status}:`,
          errText.substring(0, 200),
        );
        return false;
      }
    } catch (e) {
      console.warn("[ERPNext] /api/sync network error:", e);
      return false;
    }
  }

  return false;
}

/**
 * Background worker: processes any unsynced appointments stored in localStorage.
 */
export async function processPendingSyncs() {
  if (typeof window === "undefined") return;
  const queue = getPendingQueue();
  if (queue.length === 0) return;

  console.log(`[ERPNext Queue] Processing ${queue.length} pending appointment(s)...`);
  for (const item of queue) {
    await sendAppointmentToERPNext(item.appointment, item.doctorName, item.specialty);
  }
}
