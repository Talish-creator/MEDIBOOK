import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as seed from "./data/seed";
import { sendAppointmentToERPNext } from "./erpnext";
import type {
  Account,
  Appointment,
  AppointmentType,
  FamilyMember,
  MedicalRecord,
  Message,
  Notification,
  Payment,
  Prescription,
  RecordType,
  Review,
  Role,
  VerificationStatus,
} from "./data/types";
import type { SlotLock } from "./slots";

const STORAGE_KEY = "medibook.state.v1";
const SESSION_ID_KEY = "medibook.session.v1";

interface MutableState {
  accounts: Account[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  records: MedicalRecord[];
  reviews: Review[];
  payments: Payment[];
  family: FamilyMember[];
  messages: Message[];
  notifications: Notification[];
  favorites: string[];
  verification: Record<string, VerificationStatus>;
  locks: SlotLock[];
  currentUserId: string | null;
  theme: "light" | "dark";
}

const initialState: MutableState = {
  accounts: seed.accounts,
  appointments: seed.appointments,
  prescriptions: seed.prescriptions,
  records: seed.medicalRecords,
  reviews: seed.reviews,
  payments: seed.payments,
  family: seed.familyMembers,
  messages: seed.messages,
  notifications: seed.notifications,
  favorites: ["doc-3", "doc-7"],
  verification: Object.fromEntries(seed.doctors.map((d) => [d.id, d.verification])),
  locks: [],
  currentUserId: null,
  theme: "light",
};

export interface BookingDraft {
  doctorId: string;
  type: AppointmentType;
  clinicId: string;
  date: string;
  time: string;
  familyMemberId: string | null;
  reason: string;
  documents: string[];
  fee: number;
}

interface StoreValue extends MutableState {
  sessionId: string;
  user: Account | null;
  role: Role | null;
  login: (email: string, password: string) => Account | null;
  loginAs: (role: Role) => Account;
  signup: (input: { name: string; email: string; password: string; role: Role }) => Account;
  logout: () => void;
  toggleTheme: () => void;
  lockSlot: (doctorId: string, date: string, time: string) => void;
  releaseLock: (doctorId: string, date: string, time: string) => void;
  isSlotTaken: (doctorId: string, date: string, time: string) => boolean;
  book: (draft: BookingDraft, method: string) => Appointment;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  toggleFavorite: (doctorId: string) => void;
  addFamilyMember: (m: Omit<FamilyMember, "id" | "patientId">) => void;
  removeFamilyMember: (id: string) => void;
  addRecord: (input: { name: string; type: RecordType; familyMemberId: string | null }) => void;
  deleteRecord: (id: string) => void;
  addReview: (input: {
    doctorId: string;
    appointmentId: string;
    rating: number;
    categories: Review["categories"];
    comment: string;
  }) => void;
  replyToReview: (reviewId: string, reply: string) => void;
  setReviewStatus: (reviewId: string, status: Review["status"]) => void;
  addPrescription: (rx: Omit<Prescription, "id">) => Prescription;
  setVerification: (doctorId: string, status: VerificationStatus) => void;
  setAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  refundPayment: (paymentId: string) => void;
  sendMessage: (
    doctorId: string,
    patientId: string,
    from: "doctor" | "patient",
    body: string,
  ) => void;
  markAllRead: () => void;
  notify: (n: Omit<Notification, "id" | "at" | "read">) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MutableState>(initialState);
  const [sessionId, setSessionId] = useState("ssr");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let sid = localStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = `s-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_ID_KEY, sid);
    }
    setSessionId(sid);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState((prev) => ({ ...prev, ...(JSON.parse(raw) as Partial<MutableState>) }));
      } catch {
        /* ignore corrupt state */
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state, hydrated]);

  const patch = useCallback((fn: (s: MutableState) => Partial<MutableState>) => {
    setState((prev) => ({ ...prev, ...fn(prev) }));
  }, []);

  const user = useMemo(
    () => state.accounts.find((a) => a.id === state.currentUserId) ?? null,
    [state.accounts, state.currentUserId],
  );

  const pushNotification = useCallback(
    (userId: string, n: Omit<Notification, "id" | "at" | "read" | "userId">) =>
      patch((s) => ({
        notifications: [
          {
            id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            userId,
            at: new Date().toISOString(),
            read: false,
            ...n,
          },
          ...s.notifications,
        ],
      })),
    [patch],
  );

  const value: StoreValue = {
    ...state,
    sessionId,
    user,
    role: user?.role ?? null,

    login: (email, password) => {
      const found = state.accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
      );
      if (found) patch(() => ({ currentUserId: found.id }));
      return found ?? null;
    },

    loginAs: (role) => {
      const account = state.accounts.find((a) => a.role === role)!;
      patch(() => ({ currentUserId: account.id }));
      return account;
    },

    signup: ({ name, email, password, role }) => {
      const id = `usr-${Date.now()}`;
      const linkedId = role === "patient" ? "pat-1" : role === "doctor" ? "doc-3" : "admin";
      const account: Account = {
        id,
        role,
        name,
        email,
        password,
        linkedId,
        avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`,
      };
      patch((s) => ({ accounts: [...s.accounts, account], currentUserId: id }));
      return account;
    },

    logout: () => patch(() => ({ currentUserId: null })),

    toggleTheme: () => patch((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

    lockSlot: (doctorId, date, time) =>
      patch((s) => ({
        locks: [
          ...s.locks.filter((l) => l.key !== `${doctorId}|${date}|${time}` && l.until > Date.now()),
          { key: `${doctorId}|${date}|${time}`, until: Date.now() + 10 * 60 * 1000, by: sessionId },
        ],
      })),

    releaseLock: (doctorId, date, time) =>
      patch((s) => ({ locks: s.locks.filter((l) => l.key !== `${doctorId}|${date}|${time}`) })),

    isSlotTaken: (doctorId, date, time) =>
      state.appointments.some(
        (a) =>
          a.doctorId === doctorId &&
          a.date === date &&
          a.time === time &&
          a.status !== "cancelled" &&
          a.status !== "rescheduled",
      ),

    book: (draft, method) => {
      const patientId = user?.role === "patient" ? user.linkedId : "pat-1";
      const patient = seed.patients.find((p) => p.id === patientId)!;
      const member = draft.familyMemberId
        ? state.family.find((f) => f.id === draft.familyMemberId)
        : null;
      const appointment: Appointment = {
        id: `APT-${Math.floor(100000 + Math.random() * 899999)}`,
        doctorId: draft.doctorId,
        patientId,
        forName: member?.name ?? patient.name,
        familyMemberId: draft.familyMemberId,
        clinicId: draft.clinicId,
        type: draft.type,
        date: draft.date,
        time: draft.time,
        status: "confirmed",
        reason: draft.reason,
        fee: draft.fee,
        paymentStatus: "Paid",
        paymentMethod: method,
        createdAt: new Date().toISOString().slice(0, 10),
        documents: draft.documents,
      };
      const payment: Payment = {
        id: `INV-${Math.floor(60000 + Math.random() * 9999)}`,
        appointmentId: appointment.id,
        patientId,
        doctorId: draft.doctorId,
        amount: draft.fee,
        tax: Math.round(draft.fee * 0.15),
        method,
        status: "Paid",
        date: appointment.createdAt,
        transactionId: `TXN${Math.floor(10000000 + Math.random() * 89999999)}`,
      };
      const doctor = seed.doctors.find((d) => d.id === draft.doctorId)!;
      patch((s) => ({
        appointments: [appointment, ...s.appointments],
        payments: [payment, ...s.payments],
        locks: s.locks.filter((l) => l.key !== `${draft.doctorId}|${draft.date}|${draft.time}`),
        notifications: [
          {
            id: `n-${Date.now()}`,
            userId: user?.id ?? "usr-p1",
            title: "Appointment confirmed",
            body: `${appointment.id} with ${doctor.name} — ${draft.date} at ${draft.time}.`,
            at: new Date().toISOString(),
            read: false,
            kind: "appointment",
          },
          ...s.notifications,
        ],
      }));
      void sendAppointmentToERPNext(appointment);
      return appointment;
    },

    cancelAppointment: (id) =>
      patch((s) => ({
        appointments: s.appointments.map((a) =>
          a.id === id ? { ...a, status: "cancelled", paymentStatus: "Refunded" } : a,
        ),
        payments: s.payments.map((p) =>
          p.appointmentId === id ? { ...p, status: "Refunded" } : p,
        ),
      })),

    rescheduleAppointment: (id, date, time) =>
      patch((s) => ({
        appointments: s.appointments.map((a) =>
          a.id === id ? { ...a, date, time, status: "confirmed" } : a,
        ),
      })),

    toggleFavorite: (doctorId) =>
      patch((s) => ({
        favorites: s.favorites.includes(doctorId)
          ? s.favorites.filter((f) => f !== doctorId)
          : [...s.favorites, doctorId],
      })),

    addFamilyMember: (m) =>
      patch((s) => ({
        family: [
          ...s.family,
          { ...m, id: `fam-${Date.now()}`, patientId: user?.linkedId ?? "pat-1" },
        ],
      })),

    removeFamilyMember: (id) => patch((s) => ({ family: s.family.filter((f) => f.id !== id) })),

    addRecord: ({ name, type, familyMemberId }) =>
      patch((s) => ({
        records: [
          {
            id: `mr-${Date.now()}`,
            patientId: user?.linkedId ?? "pat-1",
            familyMemberId,
            name,
            type,
            doctorId: null,
            date: new Date().toISOString().slice(0, 10),
            size: `${(200 + Math.random() * 1800).toFixed(0)} KB`,
          },
          ...s.records,
        ],
      })),

    deleteRecord: (id) => patch((s) => ({ records: s.records.filter((r) => r.id !== id) })),

    addReview: ({ doctorId, appointmentId, rating, categories, comment }) =>
      patch((s) => ({
        reviews: [
          {
            id: `rev-${Date.now()}`,
            doctorId,
            patientId: user?.linkedId ?? "pat-1",
            patientName: user?.name ?? "Patient",
            rating,
            categories,
            comment,
            date: new Date().toISOString().slice(0, 10),
            verifiedVisit: true,
            doctorReply: null,
            status: "published",
          },
          ...s.reviews,
        ],
        appointments: s.appointments.map((a) =>
          a.id === appointmentId ? { ...a, reviewed: true } : a,
        ),
      })),

    replyToReview: (reviewId, reply) =>
      patch((s) => ({
        reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, doctorReply: reply } : r)),
      })),

    setReviewStatus: (reviewId, status) =>
      patch((s) => ({ reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, status } : r)) })),

    addPrescription: (rx) => {
      const created: Prescription = { ...rx, id: `RX-${Math.floor(3000 + Math.random() * 6999)}` };
      patch((s) => ({ prescriptions: [created, ...s.prescriptions] }));
      pushNotification("usr-p1", {
        title: "Prescription available",
        body: `${created.id} is ready to download.`,
        kind: "prescription",
      });
      return created;
    },

    setVerification: (doctorId, status) =>
      patch((s) => ({ verification: { ...s.verification, [doctorId]: status } })),

    setAppointmentStatus: (id, status) =>
      patch((s) => ({
        appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
      })),

    refundPayment: (paymentId) =>
      patch((s) => ({
        payments: s.payments.map((p) => (p.id === paymentId ? { ...p, status: "Refunded" } : p)),
      })),

    sendMessage: (doctorId, patientId, from, body) =>
      patch((s) => ({
        messages: [
          ...s.messages,
          {
            id: `m-${Date.now()}`,
            threadId: `${doctorId}-${patientId}`,
            doctorId,
            patientId,
            from,
            body,
            at: new Date().toISOString().slice(0, 16),
          },
        ],
      })),

    markAllRead: () =>
      patch((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

    notify: (n) => pushNotification(n.userId, n),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Read-only reference data (never mutated). */
export const ref = {
  doctors: seed.doctors,
  specialties: seed.specialties,
  clinics: seed.clinics,
  hospitals: seed.hospitals,
  patients: seed.patients,
  articles: seed.articles,
  tickets: seed.supportTickets,
  auditLogs: seed.auditLogs,
};

export const findDoctor = (id: string) => ref.doctors.find((d) => d.id === id);
export const findClinic = (id: string) => ref.clinics.find((c) => c.id === id);
export const findSpecialty = (id: string) => ref.specialties.find((s) => s.id === id);
export const specialtyName = (id: string) => findSpecialty(id)?.name ?? "Specialist";
