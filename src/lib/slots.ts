import type { Appointment, Doctor } from "./data/types";

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h! * 60 + m!;
}

export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h! >= 12 ? "PM" : "AM";
  const hour = h! % 12 === 0 ? 12 : h! % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function formatShortDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function isPastDate(date: string) {
  return date < new Date().toISOString().slice(0, 10);
}

export interface Slot {
  time: string;
  available: boolean;
  reason?: "booked" | "past" | "locked" | "break";
}

export interface SlotLock {
  key: string; // doctorId|date|time
  until: number;
  by: string;
}

/**
 * Generates the doctor's bookable slots for one day at one clinic.
 * Availability rules: working hours per weekday, blocked dates, breaks,
 * already-booked appointments, temporary locks and past times.
 */
export function generateSlots(
  doctor: Doctor,
  clinicId: string,
  date: string,
  appointments: Appointment[],
  locks: SlotLock[] = [],
  sessionId = "",
): Slot[] {
  if (isPastDate(date)) return [];
  if (doctor.blockedDates.includes(date)) return [];

  const weekday = new Date(`${date}T00:00:00`).getDay();
  const link = doctor.clinics.find((c) => c.clinicId === clinicId);
  if (link && !link.days.includes(weekday)) return [];

  const hours = doctor.workingHours.find((w) => w.day === weekday);
  if (!hours) return [];

  const booked = new Set(
    appointments
      .filter(
        (a) =>
          a.doctorId === doctor.id &&
          a.date === date &&
          a.status !== "cancelled" &&
          a.status !== "rescheduled",
      )
      .map((a) => a.time),
  );

  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTs = Date.now();

  const slots: Slot[] = [];
  for (const [start, end] of hours.blocks) {
    for (let t = toMinutes(start); t < toMinutes(end); t += 30) {
      const time = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      const lock = locks.find((l) => l.key === `${doctor.id}|${date}|${time}` && l.until > nowTs);
      let available = true;
      let reason: Slot["reason"];
      if (booked.has(time)) {
        available = false;
        reason = "booked";
      } else if (isToday && t <= nowMinutes + 30) {
        available = false;
        reason = "past";
      } else if (lock && lock.by !== sessionId) {
        available = false;
        reason = "locked";
      }
      slots.push({ time, available, ...(reason ? { reason } : {}) });
    }
  }
  return slots;
}

/** Next available appointment label, scanning the next 14 days. */
export function nextAvailable(doctor: Doctor, appointments: Appointment[]) {
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    for (const link of doctor.clinics) {
      const slot = generateSlots(doctor, link.clinicId, date, appointments).find(
        (s) => s.available,
      );
      if (slot) {
        const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatShortDate(date);
        return { date, time: slot.time, label: `${label}, ${formatTime(slot.time)}`, dayOffset: i };
      }
    }
  }
  return null;
}

export const currency = (n: number) => `SAR ${n.toLocaleString("en-US")}`;
