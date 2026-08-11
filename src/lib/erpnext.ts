import type { Appointment } from "./data/types";
import { findDoctor, specialtyName } from "./store";

const ERPNEXT_API_KEY =
  (import.meta.env.VITE_ERPNEXT_API_KEY as string | undefined) || "45ec974ff12c04b";

const ERPNEXT_API_SECRET =
  (import.meta.env.VITE_ERPNEXT_API_SECRET as string | undefined) || "4179a5d5fc9909d";

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
 * Uses Vercel proxy (/api/erpnext/resource/...) to prevent CORS browser block.
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

  // Determine endpoint URL: use Vercel proxy rewrite for web clients to bypass CORS
  const isBrowser = typeof window !== "undefined";
  const targetUrl = isBrowser
    ? `${window.location.origin}/api/erpnext/resource/MediBook Appointment`
    : "https://key.solutions.bitvera.co/api/resource/MediBook Appointment";

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[ERPNext Sync Success] Sent Appointment ${appointment.id} to ERPNext.`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[ERPNext Sync Error ${res.status}]:`, errText);
      return false;
    }
  } catch (err) {
    console.error("[ERPNext Network Exception]:", err);
    return false;
  }
}
