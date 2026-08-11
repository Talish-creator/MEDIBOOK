export type ArticleCategory =
  | "All"
  | "General Health"
  | "Heart Health"
  | "Diabetes"
  | "Nutrition"
  | "Mental Health"
  | "Women's Health"
  | "Men's Health"
  | "Children's Health"
  | "Skin & Hair"
  | "Dental Health"
  | "Fitness"
  | "Sleep"
  | "Chronic Conditions"
  | "Preventive Care"
  | "Medicines";

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: ArticleCategory;
  tags: string[];
  image: string;
  author: string;
  reviewer: string;
  reviewerSpecialty: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number; // in minutes
  doctorReviewed: boolean;
  featured: boolean;
  popular: boolean;
  viewsCount: number;
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "All",
  "General Health",
  "Heart Health",
  "Diabetes",
  "Nutrition",
  "Mental Health",
  "Women's Health",
  "Men's Health",
  "Children's Health",
  "Skin & Hair",
  "Dental Health",
  "Fitness",
  "Sleep",
  "Chronic Conditions",
  "Preventive Care",
  "Medicines",
];

export const HEALTH_TOPICS = [
  { name: "Heart Health", iconName: "HeartPulse", count: 18 },
  { name: "Diabetes", iconName: "Activity", count: 14 },
  { name: "Nutrition", iconName: "Apple", count: 22 },
  { name: "Mental Health", iconName: "Smile", count: 16 },
  { name: "Women's Health", iconName: "UserCheck", count: 15 },
  { name: "Children's Health", iconName: "Baby", count: 12 },
  { name: "Skin & Hair", iconName: "Sparkles", count: 20 },
  { name: "Dental Health", iconName: "Smile", count: 11 },
  { name: "Sleep", iconName: "Wind", count: 10 },
  { name: "Fitness", iconName: "Dumbbell", count: 13 },
];

export const ARTICLES_DATA: ArticleData[] = [
  // --- FEATURED ARTICLE ---
  {
    id: "art-1",
    slug: "understanding-high-blood-pressure-causes-symptoms-prevention",
    title: "Understanding High Blood Pressure: Causes, Symptoms and Prevention",
    excerpt:
      "Learn what your blood pressure numbers mean, key risk factors to watch for, and proven daily lifestyle habits to maintain a healthy cardiovascular system.",
    content: [
      "High blood pressure, clinically known as hypertension, is often called a 'silent killer' because it can cause serious cardiovascular damage over time without showing obvious symptoms.",
      "A normal reading is typically below 120/80 mmHg. When blood pressure remains consistently elevated, the heart works harder to pump blood through stiffened or narrowed arteries.",
      "Key lifestyle modifications including reducing dietary sodium, engaging in 150 minutes of moderate aerobic exercise per week, managing stress, and maintaining a balanced diet rich in potassium can significantly lower blood pressure numbers.",
    ],
    category: "Heart Health",
    tags: ["Hypertension", "Heart Health", "Blood Pressure", "Prevention"],
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    author: "Dr. Ahmed Khan",
    reviewer: "Dr. Ahmed Khan",
    reviewerSpecialty: "Cardiologist",
    publishedAt: "20 Aug 2026",
    updatedAt: "20 Aug 2026",
    readingTime: 8,
    doctorReviewed: true,
    featured: true,
    popular: true,
    viewsCount: 4820,
  },

  // --- POPULAR ARTICLES ---
  {
    id: "art-2",
    slug: "10-early-signs-of-diabetes-you-should-know",
    title: "10 Early Signs of Diabetes You Should Know",
    excerpt:
      "Recognizing early symptoms of type 2 diabetes like increased thirst, fatigue, and frequent urination can lead to timely diagnosis and prevention of long-term complications.",
    content: [
      "Early detection of type 2 diabetes is vital for protecting nerve endings, microvascular blood vessels, and kidney health.",
      "Common warning signs include unexplained weight loss, blurred vision, slow-healing cuts, and persistent tingling sensations in the hands or feet.",
    ],
    category: "Diabetes",
    tags: ["Diabetes", "Blood Sugar", "Early Signs", "Endocrinology"],
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    author: "MediBook Medical Team",
    reviewer: "Dr. Mona Al-Harbi",
    reviewerSpecialty: "Endocrinologist",
    publishedAt: "18 Aug 2026",
    readingTime: 6,
    doctorReviewed: true,
    featured: false,
    popular: true,
    viewsCount: 3940,
  },
  {
    id: "art-3",
    slug: "how-to-keep-your-heart-healthy",
    title: "How to Keep Your Heart Healthy: A Doctor's Guide",
    excerpt:
      "Discover evidence-based strategies for heart health, including dietary advice, optimal sleeping routines, cholesterol management, and routine screening schedules.",
    content: [
      "Cardiovascular wellness requires a multi-faceted approach. Incorporating Mediterranean diet principles—rich in olive oil, fish, vegetables, and whole grains—lowers LDL cholesterol.",
    ],
    category: "Heart Health",
    tags: ["Heart", "Cholesterol", "Fitness", "Diet"],
    image:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Faisal Al-Zahrani",
    reviewer: "Dr. Faisal Al-Zahrani",
    reviewerSpecialty: "Cardiologist",
    publishedAt: "15 Aug 2026",
    readingTime: 7,
    doctorReviewed: true,
    featured: false,
    popular: true,
    viewsCount: 3410,
  },
  {
    id: "art-4",
    slug: "understanding-vitamin-d-deficiency",
    title: "Understanding Vitamin D Deficiency: Risk Factors & Symptoms",
    excerpt:
      "Vitamin D is essential for bone density, immune function, and mood regulation. Learn why deficiency is widespread and how to safely optimize your levels.",
    content: [
      "Vitamin D functions more like a hormone than a traditional vitamin. Sunlight exposure triggers synthesis in the skin, but indoor lifestyle habits often lead to deficiency.",
    ],
    category: "Nutrition",
    tags: ["Vitamin D", "Nutrition", "Immunity", "Bones"],
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Zainab Al-Sharif",
    reviewer: "Dr. Zainab Al-Sharif",
    reviewerSpecialty: "Clinical Dietitian",
    publishedAt: "12 Aug 2026",
    readingTime: 5,
    doctorReviewed: true,
    featured: false,
    popular: true,
    viewsCount: 2980,
  },
  {
    id: "art-5",
    slug: "when-should-you-see-a-dermatologist",
    title: "When Should You See a Dermatologist for Skin Conditions?",
    excerpt:
      "From changing moles to adult acne and persistent rashes, understand which skin changes warrant an evaluation by a board-certified dermatologist.",
    content: [
      "The ABCDE rule is crucial for evaluating moles: Asymmetry, Border irregularity, Color variation, Diameter greater than 6mm, and Evolving shape over time.",
    ],
    category: "Skin & Hair",
    tags: ["Dermatology", "Skin Care", "Moles", "Acne"],
    image:
      "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Sarah Ahmed",
    reviewer: "Dr. Sarah Ahmed",
    reviewerSpecialty: "Dermatologist",
    publishedAt: "10 Aug 2026",
    readingTime: 6,
    doctorReviewed: true,
    featured: false,
    popular: true,
    viewsCount: 2750,
  },
  {
    id: "art-6",
    slug: "simple-habits-for-better-sleep",
    title: "7 Simple Habits for Better Sleep & Circadian Rhythm",
    excerpt:
      "Improve your sleep quality naturally with proven sleep hygiene techniques, evening light management, and consistent wake-up schedules.",
    content: [
      "Quality sleep is vital for cellular repair, brain memory consolidation, and metabolic balance. Avoiding blue light screens 60 minutes before bed enhances melatonin release.",
    ],
    category: "Sleep",
    tags: ["Sleep", "Insomnia", "Wellness", "Circadian"],
    image:
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Tariq Al-Mansoor",
    reviewer: "Dr. Tariq Al-Mansoor",
    reviewerSpecialty: "Family Physician",
    publishedAt: "08 Aug 2026",
    readingTime: 5,
    doctorReviewed: true,
    featured: false,
    popular: true,
    viewsCount: 3120,
  },
  {
    id: "art-7",
    slug: "how-to-manage-stress-and-anxiety",
    title: "How to Manage Stress and Anxiety in Everyday Life",
    excerpt:
      "Practical cognitive tools, mindfulness techniques, and physical routines to lower stress hormones and protect long-term mental health.",
    content: [
      "Chronic stress elevates cortisol and adrenaline levels, impacting blood pressure, digestion, and mood. Controlled deep breathing exercises activate the parasympathetic nervous system.",
    ],
    category: "Mental Health",
    tags: ["Mental Health", "Stress", "Anxiety", "Psychology"],
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Omar Al-Qhtani",
    reviewer: "Dr. Omar Al-Qhtani",
    reviewerSpecialty: "Clinical Psychologist",
    publishedAt: "05 Aug 2026",
    readingTime: 7,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 2640,
  },

  // --- LATEST ARTICLES ---
  {
    id: "art-8",
    slug: "understanding-your-blood-pressure-numbers",
    title: "Understanding Your Blood Pressure Numbers: Systolic vs Diastolic",
    excerpt:
      "A clear breakdown of what systolic and diastolic measurements represent, and what blood pressure ranges mean for your cardiovascular health.",
    content: [
      "Systolic blood pressure (the top number) measures arterial pressure when the heart beats, while diastolic (the bottom number) measures pressure between beats.",
    ],
    category: "Heart Health",
    tags: ["Blood Pressure", "Heart", "General Health"],
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Ahmed Khan",
    reviewer: "Dr. Ahmed Khan",
    reviewerSpecialty: "Cardiologist",
    publishedAt: "04 Aug 2026",
    readingTime: 6,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 2210,
  },
  {
    id: "art-9",
    slug: "foods-that-support-a-healthy-heart",
    title: "10 Superfoods That Support a Healthy Heart",
    excerpt:
      "Incorporate leafy greens, berries, walnuts, fatty fish, and dark chocolate into your diet to lower cholesterol and protect blood vessels.",
    content: [
      "Nutrient-dense foods rich in omega-3 fatty acids, antioxidants, and dietary fiber lower systemic inflammation and support arterial elasticity.",
    ],
    category: "Nutrition",
    tags: ["Nutrition", "Heart Health", "Superfoods", "Diet"],
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Zainab Al-Sharif",
    reviewer: "Dr. Zainab Al-Sharif",
    reviewerSpecialty: "Clinical Dietitian",
    publishedAt: "02 Aug 2026",
    readingTime: 5,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 1980,
  },
  {
    id: "art-10",
    slug: "common-causes-of-hair-loss-in-men-and-women",
    title: "Common Causes of Hair Loss in Men & Women",
    excerpt:
      "Differentiating between androgenetic alopecia, stress-induced telogen effluvium, and nutritional deficiencies, plus modern medical treatments.",
    content: [
      "Hair thinning can stem from hormonal shifts, genetic predisposition, thyroid imbalance, or intense physical stress.",
    ],
    category: "Skin & Hair",
    tags: ["Hair Loss", "Dermatology", "Scalp Care"],
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Sarah Ahmed",
    reviewer: "Dr. Sarah Ahmed",
    reviewerSpecialty: "Dermatologist",
    publishedAt: "01 Aug 2026",
    readingTime: 6,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 2150,
  },
  {
    id: "art-11",
    slug: "how-often-should-you-visit-the-dentist",
    title: "How Often Should You Visit the Dentist? Prevention Guide",
    excerpt:
      "Why twice-yearly routine dental checkups prevent tartar buildup, gum inflammation, and costly dental procedures later on.",
    content: [
      "Regular dental cleanings remove plaque that standard brushing cannot reach, preserving gum tissue and preventing cavities.",
    ],
    category: "Dental Health",
    tags: ["Dentistry", "Teeth", "Oral Care", "Prevention"],
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    author: "MediBook Dental Team",
    reviewer: "Dr. Sulaiman Al-Habib",
    reviewerSpecialty: "Dental Specialist",
    publishedAt: "30 Jul 2026",
    readingTime: 4,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 1840,
  },
  {
    id: "art-12",
    slug: "signs-your-child-may-need-medical-attention",
    title: "Signs Your Child May Need Urgent Medical Attention",
    excerpt:
      "A pediatrician's advice on identifying high fever, dehydration, breathing difficulty, and lethargy in infants and children.",
    content: [
      "Fever in infants under 3 months of age requires immediate emergency medical evaluation. Watch for signs of rapid breathing or chest retractions.",
    ],
    category: "Children's Health",
    tags: ["Pediatrics", "Children", "Fever", "Urgent Care"],
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Layla Hassan",
    reviewer: "Dr. Layla Hassan",
    reviewerSpecialty: "Pediatrician",
    publishedAt: "28 Jul 2026",
    readingTime: 6,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 2510,
  },
  {
    id: "art-13",
    slug: "managing-everyday-stress-mindfulness-tools",
    title: "Managing Everyday Stress: Simple Mindfulness Tools",
    excerpt:
      "Incorporate brief breathing breaks, progressive muscle relaxation, and cognitive reframing into your daily routine.",
    content: [
      "Mindfulness techniques help anchor awareness in the present moment, deactivating stress response circuits in the amygdala.",
    ],
    category: "Mental Health",
    tags: ["Stress", "Mindfulness", "Mental Health"],
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Omar Al-Qhtani",
    reviewer: "Dr. Omar Al-Qhtani",
    reviewerSpecialty: "Clinical Psychologist",
    publishedAt: "26 Jul 2026",
    readingTime: 5,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 1720,
  },
  {
    id: "art-14",
    slug: "understanding-migraine-triggers-and-relief",
    title: "Understanding Migraine Triggers and Relief Strategies",
    excerpt:
      "Differentiating migraines from tension headaches, tracking personal triggers, and evaluating preventative medications.",
    content: [
      "Migraines involve neurovascular events causing throbbing headache pain, sensitivity to light/sound, and sometimes aura visual disturbances.",
    ],
    category: "General Health",
    tags: ["Migraine", "Headache", "Neurology", "Pain"],
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Fatima Al-Kindi",
    reviewer: "Dr. Fatima Al-Kindi",
    reviewerSpecialty: "Neurologist",
    publishedAt: "24 Jul 2026",
    readingTime: 7,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 2040,
  },
  {
    id: "art-15",
    slug: "healthy-eating-for-busy-adults",
    title: "Healthy Eating Habits for Busy Working Adults",
    excerpt:
      "Meal prep strategies, smart snack choices, and nutrient timing tips to maintain high energy levels throughout demanding workdays.",
    content: [
      "Planning balanced meals containing complex carbohydrates, lean protein, and healthy fats prevents blood sugar spikes and mid-afternoon fatigue.",
    ],
    category: "Nutrition",
    tags: ["Nutrition", "Meal Prep", "Diet", "Energy"],
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Zainab Al-Sharif",
    reviewer: "Dr. Zainab Al-Sharif",
    reviewerSpecialty: "Clinical Dietitian",
    publishedAt: "22 Jul 2026",
    readingTime: 5,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 1890,
  },
  {
    id: "art-16",
    slug: "preventing-type-2-diabetes-lifestyle-guide",
    title: "Preventing Type 2 Diabetes: A Doctor-Reviewed Guide",
    excerpt:
      "Learn how regular physical activity, body weight management, and refined sugar reduction drastically lower prediabetes progression risks.",
    content: [
      "Prediabetes is often reversible through structured lifestyle interventions focusing on glycemic control and muscle insulin sensitivity.",
    ],
    category: "Diabetes",
    tags: ["Diabetes", "Prevention", "Diet", "Endocrinology"],
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Mona Al-Harbi",
    reviewer: "Dr. Mona Al-Harbi",
    reviewerSpecialty: "Endocrinologist",
    publishedAt: "20 Jul 2026",
    readingTime: 6,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 2300,
  },
  {
    id: "art-17",
    slug: "common-skin-problems-when-to-see-a-doctor",
    title: "Common Skin Problems & When to Consult a Specialist",
    excerpt:
      "Identifying rosacea, psoriasis, fungal infections, and hives, plus when prescription topical treatments are needed.",
    content: [
      "Persistent skin redness, scaling, or chronic itching should be evaluated by a dermatologist for accurate diagnosis and prescription therapies.",
    ],
    category: "Skin & Hair",
    tags: ["Dermatology", "Skin Care", "Psoriasis", "Eczema"],
    image:
      "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Sarah Ahmed",
    reviewer: "Dr. Sarah Ahmed",
    reviewerSpecialty: "Dermatologist",
    publishedAt: "18 Jul 2026",
    readingTime: 6,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 1950,
  },
  {
    id: "art-18",
    slug: "why-regular-health-checkups-matter",
    title: "Why Regular Health Checkups & Screenings Matter",
    excerpt:
      "An overview of essential age-appropriate health screenings for blood pressure, blood lipids, diabetes, and early disease detection.",
    content: [
      "Routine annual wellness exams provide baseline health metrics, allowing physicians to detect metabolic or cardiovascular changes early.",
    ],
    category: "Preventive Care",
    tags: ["Preventive Care", "Health Checkup", "Screening"],
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Tariq Al-Mansoor",
    reviewer: "Dr. Tariq Al-Mansoor",
    reviewerSpecialty: "Family Physician",
    publishedAt: "15 Jul 2026",
    readingTime: 5,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 2180,
  },
  {
    id: "art-19",
    slug: "essential-womens-health-screenings-by-age",
    title: "Essential Women's Health Screenings by Age",
    excerpt:
      "From Pap smears and mammograms to bone density DEXA scans, understand key screening milestones for women's wellness.",
    content: [
      "Regular gynecological checkups and age-recommended mammograms play a critical role in early detection and reproductive health.",
    ],
    category: "Women's Health",
    tags: ["Women's Health", "Gynecology", "Mammogram", "Wellness"],
    image:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Noura Al-Otaibi",
    reviewer: "Dr. Noura Al-Otaibi",
    reviewerSpecialty: "Gynecologist",
    publishedAt: "12 Jul 2026",
    readingTime: 7,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 2410,
  },
  {
    id: "art-20",
    slug: "exercise-and-joint-health-posture-tips",
    title: "Exercise & Joint Health: Posture Tips for Desk Workers",
    excerpt:
      "Prevent neck strain, lower back stiffness, and joint fatigue with ergonomic workspace setups and gentle daily stretches.",
    content: [
      "Prolonged sedentary posture increases intradiscal pressure in the lumbar spine. Taking micro-movement breaks every 45 minutes relieves joint stress.",
    ],
    category: "Fitness",
    tags: ["Fitness", "Joint Health", "Posture", "Ergonomics"],
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    author: "Dr. Yousef Al-Ghamdi",
    reviewer: "Dr. Yousef Al-Ghamdi",
    reviewerSpecialty: "Orthopedic Specialist",
    publishedAt: "10 Jul 2026",
    readingTime: 5,
    doctorReviewed: true,
    featured: false,
    popular: false,
    viewsCount: 1890,
  },
];
