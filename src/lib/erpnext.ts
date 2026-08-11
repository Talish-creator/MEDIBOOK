import type { Appointment } from "./data/types";
import { findDoctor, specialtyName } from "./store";

// Safely access credentials via Environment Variables (or pre-configured secure defaults)
const ERPNEXT_URL =
  (import.meta.env.VITE_ERPNEXT_URL as string | undefined) || "https://key.solutions.bitvera.co";

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
 * Sends a real-time booking payload to ERPNext MediBook Appointment DocType
 */
export async function sendAppointmentToERPNext(appointment: Appointment): Promise<boolean> {
  if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
    console.warn("ERPNext credentials not provided; skipping ERPNext sync.");
    return false;
  }

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
