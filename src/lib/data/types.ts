// MediBook domain model. Mirrors the relational schema (Users, Doctors, Clinics,
// Appointments, Prescriptions, MedicalRecords, Reviews, Payments, ...).

export type Role = "patient" | "doctor" | "admin";

export type VerificationStatus = "Pending" | "Under Review" | "Verified" | "Rejected" | "Suspended";

export type AppointmentType = "in-clinic" | "video" | "audio";
export type AppointmentStatus =
  "upcoming" | "confirmed" | "completed" | "cancelled" | "rescheduled";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded" | "Partially refunded";

export interface Specialty {
  id: string;
  name: string;
  icon: string;
  description: string;
  doctorCount: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  beds: number;
  rating: number;
  image: string;
  facilities: string[];
}

export interface Clinic {
  id: string;
  name: string;
  hospitalId: string | null;
  city: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  openingHours: string;
  image: string;
  facilities: string[];
  services: string[];
}

export interface DoctorEducation {
  degree: string;
  institute: string;
  year: number;
}

export interface DoctorExperienceItem {
  role: string;
  place: string;
  period: string;
}

export interface DoctorClinicLink {
  clinicId: string;
  fee: number;
  days: number[]; // 0=Sun .. 6=Sat
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  gender: "male" | "female";
  photo: string;
  specialtyId: string;
  subSpecialties: string[];
  qualifications: string[];
  education: DoctorEducation[];
  experienceItems: DoctorExperienceItem[];
  awards: string[];
  publications: string[];
  about: string;
  years: number;
  languages: string[];
  city: string;
  rating: number;
  reviewCount: number;
  fee: number;
  onlineFee: number;
  onlineConsultation: boolean;
  insurances: string[];
  clinics: DoctorClinicLink[];
  verification: VerificationStatus;
  licenseNumber: string;
  services: { name: string; price: number }[];
  workingHours: { day: number; blocks: [string, string][] }[];
  blockedDates: string[];
  patientsTreated: number;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  dob: string;
  bloodGroup: string;
  city: string;
  avatar: string;
}

export interface FamilyMember {
  id: string;
  patientId: string;
  name: string;
  relation: "Father" | "Mother" | "Son" | "Daughter" | "Spouse" | "Other" | string;
  relationship?: string;
  dob: string;
  gender: "male" | "female";
  bloodGroup: string;
  phone?: string;
  allergies?: string[];
  medicalConditions?: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  forName: string;
  familyMemberId: string | null;
  clinicId: string;
  type: AppointmentType;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  status: AppointmentStatus;
  reason: string;
  fee: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  documents: string[];
  reviewed?: boolean;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  tests: string[];
  advice: string;
  followUp: string | null;
}

export type RecordType =
  "Blood test" | "X-ray" | "MRI" | "CT scan" | "Prescription" | "Medical report" | "Other";

export interface MedicalRecord {
  id: string;
  patientId: string;
  familyMemberId: string | null;
  name: string;
  type: RecordType;
  doctorId: string | null;
  date: string;
  size: string;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  categories: {
    behaviour: number;
    waiting: number;
    cleanliness: number;
    staff: number;
    treatment: number;
  };
  comment: string;
  date: string;
  verifiedVisit: boolean;
  doctorReply: string | null;
  status: "published" | "pending" | "hidden";
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  amount: number;
  tax: number;
  method: string;
  status: PaymentStatus;
  date: string;
  transactionId: string;
}

export interface Message {
  id: string;
  threadId: string;
  doctorId: string;
  patientId: string;
  from: "doctor" | "patient";
  body: string;
  at: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "appointment" | "payment" | "prescription" | "message" | "review" | "system";
}

export interface SupportTicket {
  id: string;
  subject: string;
  requester: string;
  role: Role;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In progress" | "Resolved";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  reviewer: string;
  date: string;
  readingTime: number;
  excerpt: string;
  body: string[];
  image: string;
}

export interface Account {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  linkedId: string; // patientId / doctorId / "admin"
  avatar: string;
}
