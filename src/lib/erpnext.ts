import type { Appointment } from "./data/types";
import { findDoctor, specialtyName } from "./store";

const ERPNEXT_URL = "https://key.solutions.bitvera.co";
const ERPNEXT_API_KEY = "45ec974ff12c04b";
const ERPNEXT_API_SECRET = "4179a5d5fc9909d";

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
 * Tries Vercel Serverless Function first (/api/sync), and falls back directly to ERPNext REST API.
 */
export async function sendAppointmentToERPNext(appointment: Appointment): Promise<boolean> {
  const doctor = findDoctor(appointment.doctorId);
  const doctorName = doctor?.name ?? "Doctor";
  const specName = doctor ? specialtyName(doctor.specialtyId) : "General";

  const payload: ERPNextAppointmentPayload = {
    doctype: "MediBook Appointment",
    appointment_id: appointment.id,
    patient_name: appointment.forName,
    doctor_name: doctorName,
    specialty: specName,
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
      const serverlessRes = await fetch(`${window.location.origin}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = serverlessRes.headers.get("content-type") || "";
      if (serverlessRes.ok && contentType.includes("application/json")) {
        const json = await serverlessRes.json();
        console.log(`[ERPNext Sync Success via API Function] ${appointment.id}:`, json);
        return true;
      }
    } catch (e) {
      console.warn("[Vercel API Sync Retry Notice]:", e);
    }
  }

  // Strategy 2: Direct REST Sync Fallback
  try {
    const res = await fetch(`${ERPNEXT_URL}/api/resource/MediBook Appointment`, {
      method: "POST",
      headers: {
        Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[ERPNext Direct Sync Success] ${appointment.id}`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[ERPNext Sync Response Error ${res.status}]:`, errText);
      return false;
    }
  } catch (err) {
    console.error("[ERPNext Direct Network Exception]:", err);
    return false;
  }
}
