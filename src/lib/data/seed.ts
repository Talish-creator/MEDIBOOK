import type {
  Account,
  Appointment,
  Article,
  AuditLog,
  Clinic,
  Doctor,
  FamilyMember,
  Hospital,
  MedicalRecord,
  Message,
  Notification,
  Patient,
  Payment,
  Prescription,
  Review,
  Specialty,
  SupportTicket,
} from "./types";

/** Deterministic PRNG so the demo data is stable across renders and SSR. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const r = rng(20260811);
const pick = <T>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)]!;
const int = (min: number, max: number) => min + Math.floor(r() * (max - min + 1));
const round1 = (n: number) => Math.round(n * 10) / 10;

export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const today = () => iso(new Date());
export const shiftDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return iso(d);
};

export const CITIES = ["Dammam", "Riyadh", "Jeddah", "Khobar", "Dhahran", "Makkah"] as const;
export const LANGUAGES = ["Arabic", "English", "Urdu", "French", "Hindi"] as const;
export const INSURERS = ["Bupa Arabia", "Tawuniya", "MedGulf", "Al Rajhi Takaful"] as const;

export const specialties: Specialty[] = [
  ["General Physician", "Stethoscope", "Everyday health concerns, check-ups and referrals."],
  ["Dentist", "Smile", "Teeth, gums, whitening, implants and orthodontics."],
  ["Dermatologist", "Sun", "Skin, hair, nails, acne, laser and cosmetic care."],
  ["Cardiologist", "HeartPulse", "Heart health, blood pressure, ECG and cardiac imaging."],
  ["Orthopedic", "Bone", "Bones, joints, sports injuries and spine care."],
  ["Pediatrician", "Baby", "Children's growth, vaccination and childhood illness."],
  ["Gynecologist", "Flower2", "Women's health, pregnancy and fertility care."],
  ["Neurologist", "Brain", "Headache, epilepsy, nerve and memory disorders."],
  ["Ophthalmologist", "Eye", "Vision, retina, cataract and LASIK."],
  ["ENT", "Ear", "Ear, nose, throat, sinus and hearing."],
  ["Psychiatrist", "HeartHandshake", "Anxiety, depression, sleep and therapy."],
  ["Urologist", "Droplets", "Kidney, bladder and men's health."],
].map(([name, icon, description], i) => ({
  id: `sp-${i + 1}`,
  name: name!,
  icon: icon!,
  description: description!,
  doctorCount: 0,
}));

export const hospitals: Hospital[] = [
  ["Al Mana General Hospital", "Dammam"],
  ["Saudi German Hospital", "Riyadh"],
  ["International Medical Center", "Jeddah"],
  ["Almoosa Specialist Hospital", "Khobar"],
  ["Dhahran Health Center", "Dhahran"],
].map(([name, city], i) => ({
  id: `hos-${i + 1}`,
  name: name!,
  city: city!,
  address: `King Fahd Road, ${city}`,
  beds: int(120, 640),
  rating: round1(4 + r() * 0.9),
  image: `https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=60&sig=${i}`,
  facilities: ["Emergency 24/7", "ICU", "Pharmacy", "Radiology", "Laboratory", "Parking"],
}));

const clinicNames = [
  "ABC Medical Center",
  "Noor Polyclinic",
  "Gulf Care Clinic",
  "Wellness Medical Complex",
  "Andalus Dental & Skin Center",
  "Corniche Family Clinic",
  "Rawdah Specialist Clinic",
  "Sahara Medical Center",
  "Ithra Health Clinic",
  "Bayt Al Shifa Clinic",
];

export const clinics: Clinic[] = clinicNames.map((name, i) => {
  const city = CITIES[i % CITIES.length]!;
  return {
    id: `cl-${i + 1}`,
    name,
    hospitalId: i < 5 ? `hos-${i + 1}` : null,
    city,
    address: `${int(100, 990)} Prince Sultan St, ${city}`,
    phone: `+966 13 ${int(200, 899)} ${int(1000, 9999)}`,
    rating: round1(4 + r() * 0.9),
    reviews: int(80, 940),
    openingHours: "Sat–Thu 09:00–13:00, 16:00–21:00",
    image: `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=60&sig=${i}`,
    facilities: ["Wheelchair access", "Pharmacy", "Lab on site", "Waiting lounge", "Parking"],
    services: ["Consultation", "Follow-up", "Lab tests", "Vaccination"],
  };
});

const maleFirst = [
  "Ahmed",
  "Khalid",
  "Omar",
  "Faisal",
  "Yousef",
  "Tariq",
  "Bilal",
  "Hassan",
  "Ibrahim",
  "Saad",
];
const femaleFirst = [
  "Sarah",
  "Layla",
  "Noura",
  "Huda",
  "Reem",
  "Maha",
  "Amina",
  "Fatima",
  "Dana",
  "Salma",
];
const last = [
  "Ahmed",
  "Al Qahtani",
  "Al Harbi",
  "Khan",
  "Al Otaibi",
  "Nasser",
  "Al Ghamdi",
  "Siddiqui",
  "Al Dosari",
  "Farouk",
];

const aboutTemplates = [
  "focuses on evidence-based care with a calm, unhurried consultation style.",
  "has a special interest in preventive care and long-term patient follow-up.",
  "combines advanced diagnostics with a conservative, patient-first treatment plan.",
  "is known for clear explanations and involving patients in every decision.",
];

export const doctors: Doctor[] = Array.from({ length: 32 }, (_, i) => {
  const gender: "male" | "female" = r() > 0.45 ? "male" : "female";
  const first = gender === "male" ? pick(maleFirst) : pick(femaleFirst);
  const name = `Dr. ${first} ${pick(last)}`;
  const sp = specialties[i % specialties.length]!;
  const city = CITIES[i % CITIES.length]!;
  const years = int(4, 27);
  const fee = int(3, 9) * 50;
  const clinicA = int(0, clinics.length - 1);
  const clinicB = (clinicA + int(1, 4)) % clinics.length;
  const verification =
    i < 26
      ? "Verified"
      : i < 29
        ? "Under Review"
        : i === 29
          ? "Pending"
          : i === 30
            ? "Rejected"
            : "Suspended";
  return {
    id: `doc-${i + 1}`,
    userId: `usr-d${i + 1}`,
    name,
    gender,
    photo: `https://i.pravatar.cc/300?img=${gender === "male" ? 11 + (i % 40) : 20 + (i % 40)}`,
    specialtyId: sp.id,
    subSpecialties: [`${sp.name} — advanced`, "Preventive care", "Chronic case management"].slice(
      0,
      int(2, 3),
    ),
    qualifications: [
      pick(["MBBS", "MD"]),
      pick(["FRCS", "MRCP", "MSc Dermatology", "Board Certified"]),
    ],
    education: [
      { degree: "MBBS", institute: "King Saud University", year: 2026 - years - 6 },
      {
        degree: `Residency — ${sp.name}`,
        institute: "King Faisal Specialist Hospital",
        year: 2026 - years - 1,
      },
    ],
    experienceItems: [
      {
        role: `Consultant ${sp.name}`,
        place: clinics[clinicA]!.name,
        period: `${2026 - Math.floor(years / 2)} — Present`,
      },
      {
        role: `Specialist ${sp.name}`,
        place: hospitals[i % hospitals.length]!.name,
        period: `${2026 - years} — ${2026 - Math.floor(years / 2)}`,
      },
    ],
    awards: ["Best Patient Experience Award", "Excellence in Clinical Research"].slice(
      0,
      int(1, 2),
    ),
    publications: [`Outcomes in modern ${sp.name.toLowerCase()} care — Saudi Medical Journal`],
    about: `${name} is a ${sp.name.toLowerCase()} with ${years} years of experience and ${aboutTemplates[i % aboutTemplates.length]}`,
    years,
    languages: ["Arabic", "English", ...(r() > 0.6 ? [pick(LANGUAGES)] : [])].filter(
      (v, idx, a) => a.indexOf(v) === idx,
    ),
    city,
    rating: round1(3.8 + r() * 1.2),
    reviewCount: int(24, 620),
    fee,
    onlineFee: fee - 50 > 100 ? fee - 50 : 100,
    onlineConsultation: r() > 0.25,
    insurances: [pick(INSURERS), pick(INSURERS)].filter((v, idx, a) => a.indexOf(v) === idx),
    clinics: [
      { clinicId: clinics[clinicA]!.id, fee, days: [0, 1, 2, 3] },
      { clinicId: clinics[clinicB]!.id, fee: fee + 50, days: [4, 5, 6] },
    ],
    verification: verification as Doctor["verification"],
    licenseNumber: `SCFHS-${int(100000, 999999)}`,
    services: [
      { name: "Initial consultation", price: fee },
      { name: "Follow-up visit", price: Math.round(fee * 0.6) },
      { name: `${sp.name} procedure`, price: fee * 3 },
      { name: "Online consultation", price: fee - 50 > 100 ? fee - 50 : 100 },
    ],
    workingHours: [0, 1, 2, 3, 4].map((day) => ({
      day,
      blocks: [
        ["09:00", "13:00"],
        ["16:00", "20:00"],
      ] as [string, string][],
    })),
    blockedDates: [shiftDays(int(6, 20))],
    patientsTreated: int(300, 6400),
  };
});

specialties.forEach((s) => {
  s.doctorCount = doctors.filter((d) => d.specialtyId === s.id).length * int(18, 60);
});

export const patients: Patient[] = Array.from({ length: 50 }, (_, i) => {
  const gender: "male" | "female" = r() > 0.5 ? "male" : "female";
  const first = gender === "male" ? pick(maleFirst) : pick(femaleFirst);
  const name = `${first} ${pick(last)}`;
  return {
    id: `pat-${i + 1}`,
    userId: `usr-p${i + 1}`,
    name,
    email: `${first.toLowerCase()}${i + 1}@example.com`,
    phone: `+966 5${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
    gender,
    dob: `19${int(60, 99)}-0${int(1, 9)}-1${int(0, 9)}`,
    bloodGroup: pick(["A+", "A-", "B+", "O+", "O-", "AB+"]),
    city: pick(CITIES),
    avatar: `https://i.pravatar.cc/200?img=${50 + (i % 20)}`,
  };
});

export const familyMembers: FamilyMember[] = [
  {
    id: "fam-1",
    patientId: "pat-1",
    name: "Yasmin Ahmed",
    relation: "Daughter",
    dob: "2018-04-12",
    gender: "female",
    bloodGroup: "A+",
  },
  {
    id: "fam-2",
    patientId: "pat-1",
    name: "Mona Ahmed",
    relation: "Spouse",
    dob: "1990-09-02",
    gender: "female",
    bloodGroup: "O+",
  },
  {
    id: "fam-3",
    patientId: "pat-1",
    name: "Abdullah Ahmed",
    relation: "Father",
    dob: "1958-01-20",
    gender: "male",
    bloodGroup: "B+",
  },
];

const reasons = [
  "Persistent skin rash on forearms",
  "Routine annual check-up",
  "Toothache and sensitivity",
  "Follow-up on blood pressure medication",
  "Knee pain after running",
  "Child vaccination schedule",
  "Recurring migraine episodes",
  "Blurred vision while reading",
];

const slotTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:30",
  "19:00",
];

export const appointments: Appointment[] = Array.from({ length: 104 }, (_, i) => {
  const doctor = doctors[i % doctors.length]!;
  const patient = patients[i % patients.length]!;
  const offset = i < 26 ? int(0, 18) : -int(1, 120);
  const status: Appointment["status"] =
    offset >= 0 ? (r() > 0.15 ? "confirmed" : "upcoming") : r() > 0.14 ? "completed" : "cancelled";
  const type = r() > 0.62 ? (r() > 0.5 ? "video" : "audio") : "in-clinic";
  const fee = type === "in-clinic" ? doctor.fee : doctor.onlineFee;
  return {
    id: `APT-${100340 + i}`,
    doctorId: doctor.id,
    patientId: patient.id,
    forName: patient.name,
    familyMemberId: null,
    clinicId: doctor.clinics[0]!.clinicId,
    type: type as Appointment["type"],
    date: shiftDays(offset),
    time: slotTimes[i % slotTimes.length]!,
    status,
    reason: reasons[i % reasons.length]!,
    fee,
    paymentStatus: status === "cancelled" ? "Refunded" : "Paid",
    paymentMethod: pick(["Credit card", "Apple Pay", "Mada debit", "Google Pay"]),
    createdAt: shiftDays(offset - int(2, 12)),
    documents: [],
    reviewed: status === "completed" && r() > 0.5,
  };
});

// Demo patient (pat-1) gets a rich, guaranteed history.
appointments.unshift(
  {
    id: "APT-100301",
    doctorId: "doc-3",
    patientId: "pat-1",
    forName: patients[0]!.name,
    familyMemberId: null,
    clinicId: doctors[2]!.clinics[0]!.clinicId,
    type: "in-clinic",
    date: shiftDays(2),
    time: "16:30",
    status: "confirmed",
    reason: "Persistent skin rash on forearms",
    fee: doctors[2]!.fee,
    paymentStatus: "Paid",
    paymentMethod: "Credit card",
    createdAt: shiftDays(-3),
    documents: ["Previous_lab_results.pdf"],
  },
  {
    id: "APT-100302",
    doctorId: "doc-4",
    patientId: "pat-1",
    forName: patients[0]!.name,
    familyMemberId: null,
    clinicId: doctors[3]!.clinics[0]!.clinicId,
    type: "video",
    date: shiftDays(6),
    time: "19:00",
    status: "confirmed",
    reason: "Follow-up on blood pressure medication",
    fee: doctors[3]!.onlineFee,
    paymentStatus: "Paid",
    paymentMethod: "Apple Pay",
    createdAt: shiftDays(-1),
    documents: [],
  },
  {
    id: "APT-100303",
    doctorId: "doc-2",
    patientId: "pat-1",
    forName: "Yasmin Ahmed",
    familyMemberId: "fam-1",
    clinicId: doctors[1]!.clinics[0]!.clinicId,
    type: "in-clinic",
    date: shiftDays(-14),
    time: "10:00",
    status: "completed",
    reason: "Toothache and sensitivity",
    fee: doctors[1]!.fee,
    paymentStatus: "Paid",
    paymentMethod: "Mada debit",
    createdAt: shiftDays(-20),
    documents: [],
    reviewed: false,
  },
  {
    id: "APT-100304",
    doctorId: "doc-1",
    patientId: "pat-1",
    forName: patients[0]!.name,
    familyMemberId: null,
    clinicId: doctors[0]!.clinics[0]!.clinicId,
    type: "in-clinic",
    date: shiftDays(-48),
    time: "09:30",
    status: "completed",
    reason: "Routine annual check-up",
    fee: doctors[0]!.fee,
    paymentStatus: "Paid",
    paymentMethod: "Credit card",
    createdAt: shiftDays(-55),
    documents: [],
    reviewed: true,
  },
);

export const prescriptions: Prescription[] = [
  {
    id: "RX-2041",
    appointmentId: "APT-100303",
    doctorId: "doc-2",
    patientId: "pat-1",
    date: shiftDays(-14),
    diagnosis: "Dental caries, lower left molar with pulpal sensitivity",
    items: [
      {
        medicine: "Amoxicillin",
        dosage: "500 mg",
        frequency: "3 times daily",
        duration: "5 days",
        instructions: "After meals",
      },
      {
        medicine: "Paracetamol",
        dosage: "500 mg",
        frequency: "2 times daily",
        duration: "5 days",
        instructions: "After meals, if pain",
      },
    ],
    tests: ["Dental X-ray (periapical)"],
    advice: "Avoid very cold drinks. Use a soft toothbrush and fluoride toothpaste twice daily.",
    followUp: shiftDays(6),
  },
  {
    id: "RX-2042",
    appointmentId: "APT-100304",
    doctorId: "doc-1",
    patientId: "pat-1",
    date: shiftDays(-48),
    diagnosis: "Vitamin D deficiency; otherwise healthy annual review",
    items: [
      {
        medicine: "Cholecalciferol",
        dosage: "50,000 IU",
        frequency: "Once weekly",
        duration: "8 weeks",
        instructions: "With a fatty meal",
      },
    ],
    tests: ["CBC", "Vitamin D 25-OH", "Lipid profile"],
    advice: "20 minutes of daylight exposure daily and 150 minutes of moderate activity per week.",
    followUp: null,
  },
];

export const medicalRecords: MedicalRecord[] = [
  {
    id: "mr-1",
    patientId: "pat-1",
    familyMemberId: null,
    name: "CBC_and_Vitamin_D_results.pdf",
    type: "Blood test",
    doctorId: "doc-1",
    date: shiftDays(-46),
    size: "312 KB",
  },
  {
    id: "mr-2",
    patientId: "pat-1",
    familyMemberId: "fam-1",
    name: "Dental_periapical_xray.jpg",
    type: "X-ray",
    doctorId: "doc-2",
    date: shiftDays(-14),
    size: "1.4 MB",
  },
  {
    id: "mr-3",
    patientId: "pat-1",
    familyMemberId: null,
    name: "Chest_CT_report.pdf",
    type: "CT scan",
    doctorId: null,
    date: shiftDays(-120),
    size: "2.1 MB",
  },
  {
    id: "mr-4",
    patientId: "pat-1",
    familyMemberId: null,
    name: "Cardiology_summary.pdf",
    type: "Medical report",
    doctorId: "doc-4",
    date: shiftDays(-90),
    size: "180 KB",
  },
];

const comments = [
  "Very thorough and took time to explain everything. Waiting time was short.",
  "Excellent doctor. The clinic was spotless and the staff were friendly.",
  "Listened carefully and did not over-prescribe. Highly recommended.",
  "Good experience overall, though the appointment started 15 minutes late.",
  "My symptoms improved within days of following the treatment plan.",
];

export const reviews: Review[] = Array.from({ length: 120 }, (_, i) => {
  const doctor = doctors[i % doctors.length]!;
  const patient = patients[(i * 3) % patients.length]!;
  const rating = int(3, 5);
  return {
    id: `rev-${i + 1}`,
    doctorId: doctor.id,
    patientId: patient.id,
    patientName: patient.name,
    rating,
    categories: {
      behaviour: Math.min(5, rating + int(0, 1)),
      waiting: Math.max(2, rating - int(0, 1)),
      cleanliness: Math.min(5, rating + int(0, 1)),
      staff: rating,
      treatment: rating,
    },
    comment: comments[i % comments.length]!,
    date: shiftDays(-int(3, 200)),
    verifiedVisit: r() > 0.2,
    doctorReply:
      r() > 0.75 ? "Thank you for your kind feedback — wishing you continued good health." : null,
    status: i % 17 === 0 ? "pending" : "published",
  };
});

export const payments: Payment[] = appointments.map((a, i) => ({
  id: `INV-${52100 + i}`,
  appointmentId: a.id,
  patientId: a.patientId,
  doctorId: a.doctorId,
  amount: a.fee,
  tax: Math.round(a.fee * 0.15),
  method: a.paymentMethod,
  status: a.paymentStatus,
  date: a.createdAt,
  transactionId: `TXN${int(10000000, 99999999)}`,
}));

export const messages: Message[] = [
  {
    id: "m-1",
    threadId: "th-1",
    doctorId: "doc-3",
    patientId: "pat-1",
    from: "patient",
    body: "Hello doctor, the rash is spreading slightly on my left arm.",
    at: shiftDays(-2) + "T09:12",
  },
  {
    id: "m-2",
    threadId: "th-1",
    doctorId: "doc-3",
    patientId: "pat-1",
    from: "doctor",
    body: "Thank you for the update. Please continue the cream and send a photo before our visit.",
    at: shiftDays(-2) + "T10:04",
  },
  {
    id: "m-3",
    threadId: "th-2",
    doctorId: "doc-4",
    patientId: "pat-1",
    from: "doctor",
    body: "Your blood pressure log looks stable. Keep the same dose until we meet.",
    at: shiftDays(-1) + "T18:22",
  },
];

export const notifications: Notification[] = [
  {
    id: "n-1",
    userId: "usr-p1",
    title: "Appointment confirmed",
    body: "Your appointment with Dr. Sarah Ahmed is confirmed.",
    at: shiftDays(-3) + "T12:00",
    read: false,
    kind: "appointment",
  },
  {
    id: "n-2",
    userId: "usr-p1",
    title: "Payment successful",
    body: "SAR 200 paid for APT-100301.",
    at: shiftDays(-3) + "T12:01",
    read: false,
    kind: "payment",
  },
  {
    id: "n-3",
    userId: "usr-p1",
    title: "Prescription available",
    body: "RX-2041 is ready to download.",
    at: shiftDays(-14) + "T11:30",
    read: true,
    kind: "prescription",
  },
  {
    id: "n-4",
    userId: "usr-p1",
    title: "Appointment reminder",
    body: "Video consultation in 2 days at 7:00 PM.",
    at: shiftDays(-1) + "T08:00",
    read: false,
    kind: "appointment",
  },
];

export const supportTickets: SupportTicket[] = [
  {
    id: "TK-3001",
    subject: "Refund not received for cancelled appointment",
    requester: "Omar Al Harbi",
    role: "patient",
    priority: "High",
    status: "Open",
    createdAt: shiftDays(-2),
  },
  {
    id: "TK-3002",
    subject: "Cannot upload medical license certificate",
    requester: "Dr. Huda Nasser",
    role: "doctor",
    priority: "Medium",
    status: "In progress",
    createdAt: shiftDays(-4),
  },
  {
    id: "TK-3003",
    subject: "Request to merge duplicate clinic profiles",
    requester: "Gulf Care Clinic",
    role: "admin",
    priority: "Low",
    status: "Resolved",
    createdAt: shiftDays(-9),
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "al-1",
    actor: "admin@medibook.sa",
    action: "Verified doctor",
    target: "doc-12",
    at: shiftDays(-1) + "T09:40",
  },
  {
    id: "al-2",
    actor: "admin@medibook.sa",
    action: "Refunded payment",
    target: "INV-52104",
    at: shiftDays(-2) + "T14:10",
  },
  {
    id: "al-3",
    actor: "system",
    action: "Slot lock released",
    target: "doc-3 / 16:30",
    at: shiftDays(0) + "T07:55",
  },
  {
    id: "al-4",
    actor: "admin@medibook.sa",
    action: "Hid review",
    target: "rev-18",
    at: shiftDays(-5) + "T16:02",
  },
];

export const articles: Article[] = [
  {
    id: "art-1",
    title: "Adult acne: why it happens and what actually works",
    category: "Skin",
    author: "MediBook Editorial",
    reviewer: "Dr. Sarah Ahmed, Dermatologist",
    date: shiftDays(-6),
    readingTime: 6,
    excerpt:
      "Hormones, stress and the wrong routine are the usual suspects. Here is an evidence-based plan.",
    body: [
      "Acne after the age of 25 is common and rarely about hygiene. It is usually a mix of hormonal fluctuation, follicular blockage and inflammation.",
      "Start with a gentle cleanser twice daily, a non-comedogenic moisturiser and a topical retinoid at night. Give any routine at least 12 weeks before judging it.",
      "See a dermatologist early if you have deep painful nodules or any scarring — early treatment prevents permanent marks.",
    ],
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "art-2",
    title: "Blood pressure at home: how to measure it correctly",
    category: "Heart",
    author: "MediBook Editorial",
    reviewer: "Dr. Khalid Al Qahtani, Cardiologist",
    date: shiftDays(-12),
    readingTime: 5,
    excerpt: "Most home readings are wrong because of posture and timing, not the device.",
    body: [
      "Sit quietly for five minutes with your back supported and feet flat. Rest your arm at heart level.",
      "Take two readings one minute apart, morning and evening, and record the average for seven days.",
      "Bring the log to your appointment — trends matter far more than a single high reading.",
    ],
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "art-3",
    title: "Children's fever: when to worry and when to wait",
    category: "Children's health",
    author: "MediBook Editorial",
    reviewer: "Dr. Reem Al Otaibi, Pediatrician",
    date: shiftDays(-18),
    readingTime: 4,
    excerpt: "The number on the thermometer matters less than how your child looks and behaves.",
    body: [
      "Fever is a normal immune response. Focus on hydration, comfort and alertness rather than the exact temperature.",
      "Seek care urgently for infants under three months with any fever, for a stiff neck, a rash that does not fade with pressure, or difficulty breathing.",
      "Paracetamol dosing is by weight, not age — confirm the dose with your pediatrician.",
    ],
    image:
      "https://images.unsplash.com/photo-1632053002928-1919951e5a1a?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "art-4",
    title: "Managing anxiety without switching off your life",
    category: "Mental health",
    author: "MediBook Editorial",
    reviewer: "Dr. Layla Farouk, Psychiatrist",
    date: shiftDays(-25),
    readingTime: 7,
    excerpt:
      "Avoidance feels like relief and works like fuel. Small, graded exposure is the way out.",
    body: [
      "Anxiety becomes a disorder when avoidance starts shrinking your daily life.",
      "Structured breathing, sleep regularity and graded exposure outperform reassurance-seeking.",
      "Therapy and medication are not mutually exclusive; many people do best with both for a period.",
    ],
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "art-5",
    title: "A practical guide to protein and hydration in the Gulf summer",
    category: "Nutrition",
    author: "MediBook Editorial",
    reviewer: "Dr. Yousef Al Ghamdi, General Physician",
    date: shiftDays(-33),
    readingTime: 5,
    excerpt: "Heat changes your fluid needs more than most people account for.",
    body: [
      "Aim for pale-yellow urine as a simple hydration marker, and add electrolytes for outdoor work.",
      "Spread protein across the day, roughly 1.2–1.6 g/kg for active adults.",
      "Cut sugary iced drinks first — they are the biggest hidden calorie load in summer.",
    ],
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "art-6",
    title: "Six dental habits that prevent most emergency visits",
    category: "Dental",
    author: "MediBook Editorial",
    reviewer: "Dr. Omar Khan, Dentist",
    date: shiftDays(-41),
    readingTime: 4,
    excerpt: "Most painful dental emergencies begin as something that was painless for months.",
    body: [
      "Brush for two minutes twice daily with fluoride toothpaste and clean between teeth once a day.",
      "Do not rinse immediately after brushing — you wash the fluoride away.",
      "Book a check-up every six months; early caries is cheap and painless to treat.",
    ],
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=60",
  },
];

export const accounts: Account[] = [
  {
    id: "usr-p1",
    role: "patient",
    name: patients[0]!.name,
    email: "patient@medibook.sa",
    password: "demo1234",
    linkedId: "pat-1",
    avatar: patients[0]!.avatar,
  },
  {
    id: "usr-d3",
    role: "doctor",
    name: doctors[2]!.name,
    email: "doctor@medibook.sa",
    password: "demo1234",
    linkedId: "doc-3",
    avatar: doctors[2]!.photo,
  },
  {
    id: "usr-a1",
    role: "admin",
    name: "Platform Admin",
    email: "admin@medibook.sa",
    password: "demo1234",
    linkedId: "admin",
    avatar: "https://i.pravatar.cc/200?img=68",
  },
];
