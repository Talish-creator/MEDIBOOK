export type OfferCategory =
  | "All"
  | "Full Body Checkup"
  | "Heart Health"
  | "Diabetes"
  | "Women's Health"
  | "Men's Health"
  | "Children"
  | "Dental"
  | "Skin & Hair"
  | "Vitamin Tests"
  | "Cancer Screening"
  | "Liver & Kidney"
  | "Fitness & Nutrition"
  | "Diagnostic Tests"
  | "Seasonal Offers";

export type PackageType =
  | "Full body"
  | "Diagnostic"
  | "Screening"
  | "Wellness"
  | "Dental"
  | "Women's health"
  | "Men's health"
  | "Children";

export type ProviderType = "Hospital" | "Clinic" | "Diagnostic Center" | "Laboratory";

export interface HealthOffer {
  id: string;
  slug: string;
  name: string;
  category: OfferCategory;
  packageType: PackageType;
  providerType: ProviderType;
  description: string;
  image: string;
  provider: string;
  facilityId: string;
  city: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  savings: number;
  includedTests: string[];
  testCount: number;
  duration: string;
  validUntil: string;
  preparationInstructions: string;
  suitableFor: string;
  featured: boolean;
  popular: boolean;
  rating: number;
  reviewCount: number;
  availability: "today" | "week";
}

export const SAUDI_CITIES = [
  "Riyadh",
  "Jeddah",
  "Dammam",
  "Khobar",
  "Dhahran",
  "Makkah",
  "Madinah",
  "Taif",
  "Abha",
  "Tabuk",
  "Jubail",
  "Al Ahsa",
];

export const OFFER_CATEGORIES: OfferCategory[] = [
  "All",
  "Full Body Checkup",
  "Heart Health",
  "Diabetes",
  "Women's Health",
  "Men's Health",
  "Children",
  "Dental",
  "Skin & Hair",
  "Vitamin Tests",
  "Cancer Screening",
  "Liver & Kidney",
  "Fitness & Nutrition",
  "Diagnostic Tests",
  "Seasonal Offers",
];

export const PARTNER_FACILITIES = [
  {
    id: "fac-1",
    name: "MediCare Medical Center",
    city: "Riyadh",
    rating: 4.9,
    reviewCount: 340,
    packagesCount: 8,
    logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "fac-2",
    name: "Dr. Sulaiman Al Habib Medical Group",
    city: "Riyadh",
    rating: 4.8,
    reviewCount: 512,
    packagesCount: 12,
    logo: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "fac-3",
    name: "Saudi German Health",
    city: "Jeddah",
    rating: 4.7,
    reviewCount: 428,
    packagesCount: 9,
    logo: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "fac-4",
    name: "Mouwasat Hospital",
    city: "Dammam",
    rating: 4.8,
    reviewCount: 290,
    packagesCount: 6,
    logo: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=200&q=80",
  },
];

export const HEALTH_OFFERS: HealthOffer[] = [
  // --- FEATURED OFFER ---
  {
    id: "off-1",
    slug: "comprehensive-full-body-checkup",
    name: "Comprehensive Full Body Checkup",
    category: "Full Body Checkup",
    packageType: "Full body",
    providerType: "Clinic",
    description:
      "An all-inclusive screening package covering 45+ essential biomarkers including liver, kidney, blood sugar, lipid panel, and cardiac risk markers.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
    provider: "MediCare Medical Center",
    facilityId: "fac-1",
    city: "Riyadh",
    originalPrice: 499,
    offerPrice: 299,
    discountPercentage: 40,
    savings: 200,
    testCount: 45,
    includedTests: [
      "Complete Blood Count (CBC)",
      "Fasting Blood Sugar",
      "HbA1c (3-Month Sugar)",
      "Lipid Profile (Cholesterol & Triglycerides)",
      "Liver Function Tests (ALT, AST, Bilirubin)",
      "Kidney Function Tests (Creatinine, Urea, Uric Acid)",
      "Thyroid Stimulating Hormone (TSH)",
      "Vitamin D3 & Calcium",
      "Urine Analysis Routine",
      "Resting Electrocardiogram (ECG)",
    ],
    duration: "45 mins",
    validUntil: "30 Sep 2026",
    preparationInstructions: "10-12 hours fasting required prior to appointment. Water allowed.",
    suitableFor: "Adults aged 18-65 looking for routine wellness screening.",
    featured: true,
    popular: true,
    rating: 4.9,
    reviewCount: 420,
    availability: "today",
  },

  // --- POPULAR OFFERS ---
  {
    id: "off-2",
    slug: "advanced-cardiac-heart-health-checkup",
    name: "Advanced Heart Health Checkup",
    category: "Heart Health",
    packageType: "Screening",
    providerType: "Hospital",
    description:
      "Comprehensive cardiac assessment including ECG, lipid profile, cardiac enzyme markers, and a 1-on-1 consultation with a consultant cardiologist.",
    image:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
    provider: "Dr. Sulaiman Al Habib Medical Group",
    facilityId: "fac-2",
    city: "Riyadh",
    originalPrice: 399,
    offerPrice: 249,
    discountPercentage: 38,
    savings: 150,
    testCount: 12,
    includedTests: [
      "Resting Electrocardiogram (ECG)",
      "Comprehensive Lipid Profile",
      "High-Sensitivity C-Reactive Protein (hs-CRP)",
      "Blood Pressure Assessment",
      "Fasting Blood Glucose",
      "Cardiologist Consultation",
    ],
    duration: "60 mins",
    validUntil: "15 Oct 2026",
    preparationInstructions:
      "12 hours fasting required. Avoid heavy physical exercise the morning of the test.",
    suitableFor: "Individuals with family history of heart disease or hypertension.",
    featured: false,
    popular: true,
    rating: 4.8,
    reviewCount: 310,
    availability: "today",
  },
  {
    id: "off-3",
    slug: "diabetes-screening-and-control-package",
    name: "Diabetes Screening & Control Package",
    category: "Diabetes",
    packageType: "Screening",
    providerType: "Diagnostic Center",
    description:
      "Targeted metabolic assessment to screen for prediabetes or evaluate current blood sugar management and kidney health.",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    provider: "Saudi German Health",
    facilityId: "fac-3",
    city: "Jeddah",
    originalPrice: 249,
    offerPrice: 149,
    discountPercentage: 40,
    savings: 100,
    testCount: 8,
    includedTests: [
      "Fasting Blood Sugar",
      "HbA1c Glycated Hemoglobin",
      "Microalbumin / Creatinine Ratio",
      "Lipid Profile",
      "Endocrinologist Review",
    ],
    duration: "30 mins",
    validUntil: "31 Oct 2026",
    preparationInstructions: "10 hours fasting required.",
    suitableFor: "Anyone monitoring blood sugar levels or experiencing increased thirst/fatigue.",
    featured: false,
    popular: true,
    rating: 4.9,
    reviewCount: 280,
    availability: "today",
  },
  {
    id: "off-4",
    slug: "womens-wellness-screening-package",
    name: "Women's Wellness & Hormonal Package",
    category: "Women's Health",
    packageType: "Women's health",
    providerType: "Hospital",
    description:
      "Dedicated health screening for women evaluating anemia markers, Vitamin D, thyroid panel, hormone levels, and pelvic ultrasound.",
    image:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80",
    provider: "Saudi German Health",
    facilityId: "fac-3",
    city: "Jeddah",
    originalPrice: 449,
    offerPrice: 299,
    discountPercentage: 33,
    savings: 150,
    testCount: 18,
    includedTests: [
      "Complete Blood Count (Anemia Check)",
      "Vitamin D3 & Vitamin B12",
      "Thyroid Profile (FT3, FT4, TSH)",
      "Serum Iron & Ferritin",
      "Pelvic Ultrasound",
      "Gynecologist Consultation",
    ],
    duration: "60 mins",
    validUntil: "25 Sep 2026",
    preparationInstructions: "No special fasting required unless specified for blood drawn.",
    suitableFor: "Women of all ages seeking preventive screening and hormonal evaluation.",
    featured: false,
    popular: true,
    rating: 4.9,
    reviewCount: 395,
    availability: "week",
  },
  {
    id: "off-5",
    slug: "mens-executive-wellness-package",
    name: "Men's Executive Wellness Package",
    category: "Men's Health",
    packageType: "Men's health",
    providerType: "Hospital",
    description:
      "Comprehensive health review tailored for men, including PSA prostate screening, uric acid, cardiac biomarkers, and liver/kidney profiles.",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    provider: "Mouwasat Hospital",
    facilityId: "fac-4",
    city: "Dammam",
    originalPrice: 499,
    offerPrice: 329,
    discountPercentage: 34,
    savings: 170,
    testCount: 22,
    includedTests: [
      "PSA (Prostate Specific Antigen)",
      "Complete Lipid Profile",
      "Liver & Kidney Function Panel",
      "Uric Acid (Gout Check)",
      "Fasting Blood Sugar",
      "Internal Medicine Consultation",
    ],
    duration: "45 mins",
    validUntil: "30 Sep 2026",
    preparationInstructions: "10-12 hours fasting required.",
    suitableFor: "Men aged 35+ focusing on cardiac, prostate, and metabolic health.",
    featured: false,
    popular: true,
    rating: 4.8,
    reviewCount: 210,
    availability: "today",
  },
  {
    id: "off-6",
    slug: "essential-vitamin-and-mineral-panel",
    name: "Essential Vitamin & Mineral Panel",
    category: "Vitamin Tests",
    packageType: "Diagnostic",
    providerType: "Laboratory",
    description:
      "Detect key nutrient deficiencies affecting energy, immune resilience, hair strength, and bone density.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    provider: "MediCare Medical Center",
    facilityId: "fac-1",
    city: "Riyadh",
    originalPrice: 299,
    offerPrice: 179,
    discountPercentage: 40,
    savings: 120,
    testCount: 6,
    includedTests: [
      "Vitamin D3 (25-OH)",
      "Vitamin B12",
      "Serum Iron & Ferritin",
      "Calcium & Magnesium",
      "Zinc Level",
    ],
    duration: "20 mins",
    validUntil: "15 Oct 2026",
    preparationInstructions: "No fasting required.",
    suitableFor: "Anyone suffering from unexplained chronic fatigue, hair fall, or bone aches.",
    featured: false,
    popular: true,
    rating: 4.9,
    reviewCount: 480,
    availability: "today",
  },

  // --- ADDITIONAL ALL PACKAGES ---
  {
    id: "off-7",
    slug: "complete-dental-cleaning-and-whitening",
    name: "Premium Dental Cleaning & Scaling Package",
    category: "Dental",
    packageType: "Dental",
    providerType: "Clinic",
    description:
      "Professional dental scaling, deep stain removal, fluoride treatment, and digital intraoral X-ray assessment.",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    provider: "Dr. Sulaiman Al Habib Medical Group",
    facilityId: "fac-2",
    city: "Khobar",
    originalPrice: 350,
    offerPrice: 199,
    discountPercentage: 43,
    savings: 151,
    testCount: 4,
    includedTests: [
      "Ultrasonic Scaling & Cleaning",
      "Polishing & Stain Removal",
      "Digital X-Ray Assessment",
      "Dentist Examination",
    ],
    duration: "45 mins",
    validUntil: "30 Nov 2026",
    preparationInstructions: "No special preparation required.",
    suitableFor: "Anyone due for routine oral hygiene care.",
    featured: false,
    popular: false,
    rating: 4.7,
    reviewCount: 165,
    availability: "today",
  },
  {
    id: "off-8",
    slug: "pediatric-growth-and-immunity-checkup",
    name: "Pediatric Growth & Immunity Checkup",
    category: "Children",
    packageType: "Children",
    providerType: "Clinic",
    description:
      "Gentle child wellness assessment examining physical development milestones, CBC anemia screening, and Vitamin D levels.",
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80",
    provider: "MediCare Medical Center",
    facilityId: "fac-1",
    city: "Riyadh",
    originalPrice: 220,
    offerPrice: 139,
    discountPercentage: 36,
    savings: 81,
    testCount: 5,
    includedTests: [
      "Complete Blood Count (CBC)",
      "Pediatric Height & Weight Percentiles",
      "Vitamin D Check",
      "Vision & Hearing Screening",
      "Pediatrician Consultation",
    ],
    duration: "30 mins",
    validUntil: "31 Oct 2026",
    preparationInstructions: "Bring child vaccination records.",
    suitableFor: "Children aged 1-12 years.",
    featured: false,
    popular: false,
    rating: 4.9,
    reviewCount: 190,
    availability: "week",
  },
  {
    id: "off-9",
    slug: "dermatology-skin-health-analysis",
    name: "Dermatology Skin Health & Mole Check",
    category: "Skin & Hair",
    packageType: "Diagnostic",
    providerType: "Clinic",
    description:
      "Dermoscopic examination of skin moles, facial acne evaluation, skin moisture analysis, and custom skincare routine setup.",
    image:
      "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=800&q=80",
    provider: "Saudi German Health",
    facilityId: "fac-3",
    city: "Jeddah",
    originalPrice: 300,
    offerPrice: 180,
    discountPercentage: 40,
    savings: 120,
    testCount: 3,
    includedTests: [
      "Full Dermoscopy Skin Examination",
      "Facial Skin Hydration Analysis",
      "Dermatologist Consultation",
    ],
    duration: "30 mins",
    validUntil: "15 Nov 2026",
    preparationInstructions: "Remove heavy face makeup prior to examination.",
    suitableFor:
      "Individuals dealing with persistent acne, pigmentation, or suspicious skin spots.",
    featured: false,
    popular: false,
    rating: 4.8,
    reviewCount: 225,
    availability: "today",
  },
  {
    id: "off-10",
    slug: "liver-and-kidney-function-package",
    name: "Liver & Kidney Function Protection Package",
    category: "Liver & Kidney",
    packageType: "Diagnostic",
    providerType: "Laboratory",
    description:
      "Key biochemical panel evaluating liver enzymes, bilirubin, renal clearance, and electrolyte balance.",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
    provider: "Mouwasat Hospital",
    facilityId: "fac-4",
    city: "Dammam",
    originalPrice: 280,
    offerPrice: 169,
    discountPercentage: 39,
    savings: 111,
    testCount: 10,
    includedTests: [
      "SGPT (ALT) & SGOT (AST)",
      "Total & Direct Bilirubin",
      "Serum Creatinine & Blood Urea",
      "Uric Acid",
      "Electrolytes (Sodium, Potassium, Chloride)",
    ],
    duration: "25 mins",
    validUntil: "31 Oct 2026",
    preparationInstructions: "8-10 hours fasting required.",
    suitableFor: "Patients taking long-term medications or monitoring renal/hepatic health.",
    featured: false,
    popular: false,
    rating: 4.7,
    reviewCount: 140,
    availability: "today",
  },
  {
    id: "off-11",
    slug: "seasonal-flu-vaccination-and-wellness",
    name: "Seasonal Flu Vaccination & Immune Booster",
    category: "Seasonal Offers",
    packageType: "Wellness",
    providerType: "Clinic",
    description:
      "Annual quadrivalent influenza vaccination plus Vitamin C immune booster shot and quick vitals check.",
    image:
      "https://images.unsplash.com/photo-1618961734760-466979ce35b0?auto=format&fit=crop&w=800&q=80",
    provider: "MediCare Medical Center",
    facilityId: "fac-1",
    city: "Makkah",
    originalPrice: 150,
    offerPrice: 89,
    discountPercentage: 40,
    savings: 61,
    testCount: 3,
    includedTests: [
      "Quadrivalent Flu Vaccine Shot",
      "Vitamin C Immune Shot",
      "Vital Signs Screening",
    ],
    duration: "15 mins",
    validUntil: "30 Dec 2026",
    preparationInstructions: "No fasting required.",
    suitableFor: "Anyone seeking autumn/winter seasonal flu protection.",
    featured: false,
    popular: false,
    rating: 4.9,
    reviewCount: 520,
    availability: "today",
  },
  {
    id: "off-12",
    slug: "athletes-sports-fitness-screening",
    name: "Athlete & Sports Fitness Screening",
    category: "Fitness & Nutrition",
    packageType: "Wellness",
    providerType: "Diagnostic Center",
    description:
      "Designed for gym enthusiasts and active runners checking hemoglobin levels, hydration electrolytes, muscle enzymes, and joint health.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    provider: "Dr. Sulaiman Al Habib Medical Group",
    facilityId: "fac-2",
    city: "Riyadh",
    originalPrice: 380,
    offerPrice: 229,
    discountPercentage: 39,
    savings: 151,
    testCount: 14,
    includedTests: [
      "CPK Muscle Enzyme",
      "Electrolytes & Hydration Panel",
      "Hemoglobin & Ferritin",
      "Resting ECG",
      "Sports Physician Review",
    ],
    duration: "40 mins",
    validUntil: "15 Nov 2026",
    preparationInstructions: "Avoid strenuous exercise 24 hours prior to blood test.",
    suitableFor: "Athletes and fitness enthusiasts.",
    featured: false,
    popular: false,
    rating: 4.8,
    reviewCount: 180,
    availability: "today",
  },
];
