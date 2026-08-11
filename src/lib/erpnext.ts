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

/**
 * Sends a real-time booking payload to ERPNext MediBook Appointment DocType.
 * Uses Vercel Serverless Function /api/sync (same-origin, no CORS issues).
 *
 * NOTE: doctorName and specialty are passed in explicitly to avoid a circular
 * dependency between this module and store.tsx.
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
    payment_status: appointment.paymentStatus === "Paid" ? "Paid" : "Pending",
  };

  const isBrowser = typeof window !== "undefined";

  // Strategy 1: Attempt Vercel Serverless API Function (/api/sync)
  if (isBrowser) {
    try {
      const syncUrl = `${window.location.origin}/api/sync`;
      console.log(`[ERPNext] Syncing ${appointment.id} via ${syncUrl}...`);

      const serverlessRes = await fetch(syncUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = serverlessRes.headers.get("content-type") || "";
      if (serverlessRes.ok && contentType.includes("application/json")) {
        const json = await serverlessRes.json();
        console.log(
          `[ERPNext] ✅ Sync SUCCESS via /api/sync for ${appointment.id}`,
          json,
        );
        return true;
      } else {
        const errText = await serverlessRes.text();
        console.error(
          `[ERPNext] ❌ /api/sync returned ${serverlessRes.status}:`,
          errText.substring(0, 200),
        );
      }
    } catch (e) {
      console.warn("[ERPNext] /api/sync network error:", e);
    }
  }

  // Strategy 2: Direct REST API fallback (works from Node.js / server-side)
  try {
    const ERPNEXT_URL = "https://key.solutions.bitvera.co";
    const ERPNEXT_API_KEY = "45ec974ff12c04b";
    const ERPNEXT_API_SECRET = "4179a5d5fc9909d";

    console.log(
      `[ERPNext] Attempting direct REST API sync for ${appointment.id}...`,
    );
    const res = await fetch(
      `${ERPNEXT_URL}/api/resource/MediBook Appointment`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) {
      console.log(`[ERPNext] ✅ Direct sync SUCCESS for ${appointment.id}`);
      return true;
    } else {
      const errText = await res.text();
      console.error(
        `[ERPNext] ❌ Direct sync error ${res.status}:`,
        errText.substring(0, 200),
      );
      return false;
    }
  } catch (err) {
    console.error("[ERPNext] ❌ Direct sync network exception:", err);
    return false;
  }
}
