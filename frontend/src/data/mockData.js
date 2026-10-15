// Comprehensive Mock Data for FemCare Application

export const INITIAL_USER_PROFILE = {
  id: "usr_101",
  name: "Shreya Patel",
  email: "shreya.patel@example.com",
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  lastPeriodStartDate: "2026-09-17",
  theme: "light", // light, dark, lavender, ocean, forest, sunset
  textSize: "normal", // normal, large, x-large
  privacyMode: "discreet", // explicit, neutral, discreet
  locationApproved: true,
  city: "San Francisco, CA",
  joinedDate: "2026-01-15",
};

export const EMPOWERMENT_QUOTES = [
  {
    quote: "Each time a woman stands up for herself, she stands up for all women.",
    author: "Maya Angelou"
  },
  {
    quote: "Caring for myself is not self-indulgence, it is self-preservation.",
    author: "Audre Lorde"
  },
  {
    quote: "You have been criticizing yourself for years and it hasn’t worked. Try approving of yourself and see what happens.",
    author: "Louise Hay"
  },
  {
    quote: "Nourishing yourself is a necessity, not a luxury. Honor your body’s natural rhythm.",
    author: "Wellness Wisdom"
  },
  {
    quote: "A woman in harmony with her spirit is like a river flowing. She goes where she will without pretense.",
    author: "Maya Angelou"
  },
  {
    quote: "Listen to your body. It is constantly communicating with you with clarity and intelligence.",
    author: "Dr. Christiane Northrup"
  }
];

export const INITIAL_CYCLES = [
  {
    id: "cyc_004",
    startDate: "2026-09-17",
    endDate: "2026-09-21",
    length: 28,
    periodDuration: 5,
    status: "current",
    phase: "Follicular Phase",
    flowLogs: [
      { date: "2026-09-17", flow: "Heavy", icon: "🩸" },
      { date: "2026-09-18", flow: "Medium", icon: "🩸" },
      { date: "2026-09-19", flow: "Medium", icon: "🩸" },
      { date: "2026-09-20", flow: "Light", icon: "💧" },
      { date: "2026-09-21", flow: "Light", icon: "💧" },
    ],
    notes: "Normal cycle start, slight cramps on day 1."
  },
  {
    id: "cyc_003",
    startDate: "2026-08-20",
    endDate: "2026-08-24",
    length: 28,
    periodDuration: 5,
    status: "completed",
    phase: "Luteal Phase",
    flowLogs: [
      { date: "2026-08-20", flow: "Heavy", icon: "🩸" },
      { date: "2026-08-21", flow: "Heavy", icon: "🩸" },
      { date: "2026-08-22", flow: "Medium", icon: "🩸" },
      { date: "2026-08-23", flow: "Light", icon: "💧" },
      { date: "2026-08-24", flow: "Light", icon: "💧" },
    ],
    notes: "Felt fatigued during days 1-2."
  },
  {
    id: "cyc_002",
    startDate: "2026-07-23",
    endDate: "2026-07-27",
    length: 28,
    periodDuration: 5,
    status: "completed",
    phase: "Luteal Phase",
    flowLogs: [
      { date: "2026-07-23", flow: "Medium", icon: "🩸" },
      { date: "2026-07-24", flow: "Heavy", icon: "🩸" },
      { date: "2026-07-25", flow: "Medium", icon: "🩸" },
      { date: "2026-07-26", flow: "Light", icon: "💧" },
      { date: "2026-07-27", flow: "Light", icon: "💧" },
    ],
    notes: "Stayed well hydrated."
  }
];

export const SYMPTOM_CATEGORIES = [
  {
    id: "pain",
    name: "Pain & Discomfort",
    symptoms: [
      { id: "cramps", label: "Abdominal Cramps", icon: "⚡" },
      { id: "headache", label: "Headache / Migraine", icon: "🤕" },
      { id: "backpain", label: "Lower Back Pain", icon: "🦴" },
      { id: "breast", label: "Breast Tenderness", icon: "🌸" }
    ]
  },
  {
    id: "digestive",
    name: "Digestive & Body",
    symptoms: [
      { id: "bloating", label: "Bloating", icon: "🎈" },
      { id: "nausea", label: "Nausea", icon: "🤢" },
      { id: "cravings", label: "Food Cravings", icon: "🍫" }
    ]
  },
  {
    id: "energy",
    name: "Energy & Mood",
    symptoms: [
      { id: "fatigue", label: "Fatigue & Low Energy", icon: "😴" },
      { id: "acne", label: "Acne Breakouts", icon: "✨" },
      { id: "hotflashes", label: "Temperature Flushes", icon: "🌡️" }
    ]
  }
];

export const INITIAL_SYMPTOM_LOGS = [
  {
    id: "sym_001",
    date: "2026-09-30",
    symptomId: "cramps",
    symptomName: "Abdominal Cramps",
    category: "Pain & Discomfort",
    severity: "Moderate",
    timeLogged: "09:30 AM",
    notes: "Noticed after morning walk."
  },
  {
    id: "sym_002",
    date: "2026-09-29",
    symptomId: "bloating",
    symptomName: "Bloating",
    category: "Digestive & Body",
    severity: "Mild",
    timeLogged: "02:15 PM",
    notes: "Felt full after lunch."
  }
];

export const MOOD_OPTIONS = [
  { id: "great", label: "Great", emoji: "😊" },
  { id: "good", label: "Good", emoji: "🙂" },
  { id: "okay", label: "Okay", emoji: "😐" },
  { id: "low", label: "Low", emoji: "😔" },
  { id: "irritated", label: "Irritated", emoji: "😣" },
  { id: "stressed", label: "Stressed", emoji: "😫" }
];

export const INITIAL_MOOD_LOGS = [
  { id: "m_001", date: "2026-09-30", moodId: "good", label: "Good", emoji: "🙂", time: "08:15 AM", note: "Feeling energetic today." },
  { id: "m_002", date: "2026-09-29", moodId: "okay", label: "Okay", emoji: "😐", time: "07:45 PM", note: "Calm evening." }
];

export const INITIAL_HYDRATION_LOG = {
  date: "2026-09-30",
  currentMl: 1250,
  goalMl: 2000,
  glasses: 5,
  targetGlasses: 8,
  history: [
    { time: "08:00 AM", amountMl: 250 },
    { time: "10:30 AM", amountMl: 250 },
    { time: "12:15 PM", amountMl: 250 },
    { time: "02:00 PM", amountMl: 250 },
    { time: "03:45 PM", amountMl: 250 },
  ]
};

export const INITIAL_SLEEP_LOGS = [
  { id: "slp_001", date: "2026-09-30", hours: 7, minutes: 20, quality: "Good", qualityEmoji: "😊" },
  { id: "slp_002", date: "2026-09-29", hours: 6, minutes: 45, quality: "Fair", qualityEmoji: "🙂" }
];

export const INITIAL_ACTIVITY_LOGS = [
  { id: "act_001", date: "2026-09-30", steps: 5400, stepGoal: 8000, type: "Morning Walk", durationMins: 30 },
  { id: "act_002", date: "2026-09-29", steps: 6800, stepGoal: 8000, type: "Yoga Flow", durationMins: 35 }
];

export const INITIAL_FOOD_LOGS = [
  { id: "food_001", date: "2026-09-30", mealType: "Breakfast", description: "Oatmeal with berries and chia seeds", tag: "Iron-rich" },
  { id: "food_002", date: "2026-09-30", mealType: "Lunch", description: "Spinach salad with grilled chicken and quinoa", tag: "Balanced" }
];

export const INITIAL_MEDICATIONS = [
  {
    id: "med_001",
    name: "Vitamin D3",
    dosage: "1 capsule (1000 IU)",
    scheduleTime: "08:00 AM",
    reminderEnabled: true
  },
  {
    id: "med_002",
    name: "Magnesium Glycinate",
    dosage: "200 mg",
    scheduleTime: "09:00 PM",
    reminderEnabled: true
  }
];

export const INITIAL_INSIGHTS = [
  {
    id: "ins_001",
    title: "Consistent Sleep Quality",
    category: "Sleep & Recovery",
    summary: "Your sleep duration has averaged 7.4 hours over the past week, contributing to steady mood levels.",
    detail: "Maintaining regular sleep times helps mitigate cycle-related fatigue, especially during your follicular phase.",
    date: "Today",
    icon: "😴"
  },
  {
    id: "ins_002",
    title: "Hydration Milestone",
    category: "Hydration",
    summary: "You met your daily 2,000 ml water target 5 times this week!",
    detail: "Proper hydration reduces bloating and abdominal cramping discomfort during your luteal phase.",
    date: "Yesterday",
    icon: "💧"
  },
  {
    id: "ins_003",
    title: "Cycle Regularity",
    category: "Cycle Analysis",
    summary: "Your last 3 cycle lengths vary by less than 1 day (Average: 28 days).",
    detail: "Predictability allows clear planning. Keep logging flow start dates to maintain personal analytics.",
    date: "2 days ago",
    icon: "🌸"
  }
];

export const UNUSUAL_PATTERN_ALERT = {
  detected: false,
  title: "Cycle Duration Pattern Insight",
  message: "Your recent cycle data displays standard regularity. If you notice persistent heavy flow or unusual pain across consecutive cycles, consider consulting a healthcare professional.",
  disclaimer: "General wellness information — not a medical diagnosis."
};

// COMMUNITY ANONYMOUS FORUM DATA
export const INITIAL_COMMUNITY_POSTS = [
  {
    id: "post_101",
    author: "Anonymous Sister",
    avatar: "🌺",
    category: "PCOS & Endometriosis",
    timeAgo: "2 hours ago",
    title: "Natural remedies that helped ease my day 1 cramping?",
    body: "Hi everyone! I used to struggle with severe cramps during the first 24 hours of my period. Switching to hot ginger-chamomile tea, applying a heated gel pad, and light stretching made a huge difference. What has worked for you?",
    likes: 24,
    liked: false,
    replies: [
      { id: "r_1", author: "CareSeeker22", timeAgo: "1 hour ago", text: "Magnesium glycinate at night was a game changer for me as well!" },
      { id: "r_2", author: "BloomWell", timeAgo: "45 mins ago", text: "A warm bath with Epsom salts helps relieve pelvic tension so much." }
    ]
  },
  {
    id: "post_102",
    author: "WellnessJourney",
    avatar: "🌙",
    category: "Mental Wellness",
    timeAgo: "5 hours ago",
    title: "Dealing with pre-period fatigue & brain fog",
    body: "Does anyone else notice their energy drop significantly around 4 days before their period starts? How do you manage work focus during luteal phase?",
    likes: 18,
    liked: true,
    replies: [
      { id: "r_3", author: "CalmFlow", timeAgo: "3 hours ago", text: "I schedule lower-intensity tasks during luteal phase and increase my iron intake!" }
    ]
  },
  {
    id: "post_103",
    author: "LunaTracker",
    avatar: "✨",
    category: "Cycle Health",
    timeAgo: "1 day ago",
    title: "Tracking ovulation symptoms naturally",
    body: "Noticed egg-white cervical fluid and mild one-sided twinges around day 14. It feels great to understand what my body is signaling every month!",
    likes: 31,
    liked: false,
    replies: []
  }
];

// NEARBY HEALTHCARE CLINICS & CONSULTATION DATA
export const INITIAL_HEALTHCARE_CLINICS = [
  {
    id: "cln_001",
    name: "Pacific Women's Health & Wellness Center",
    rating: 4.9,
    reviewsCount: 128,
    distanceKm: "1.2 km",
    address: "450 Sutter St, Suite 1200, San Francisco, CA",
    hours: "Open Today: 8:00 AM – 6:00 PM",
    phone: "+1 (415) 555-0192",
    doctors: ["Dr. Sarah Lin, MD (Gynecologist)", "Dr. Elena Rostova, ND (Naturopath)"],
    specialties: ["Comprehensive Gynecological Care", "PCOS Management", "Fertility Counseling"],
    availableSlots: [
      { id: "s1", date: "Tomorrow, Oct 1", time: "10:00 AM", type: "In-Person" },
      { id: "s2", date: "Tomorrow, Oct 1", time: "02:30 PM", type: "Online Tele-consult" },
      { id: "s3", date: "Friday, Oct 2", time: "11:15 AM", type: "In-Person" }
    ]
  },
  {
    id: "cln_002",
    name: "Lotus Holistic Gynecology & Reproductive Care",
    rating: 4.8,
    reviewsCount: 94,
    distanceKm: "2.8 km",
    address: "1800 Van Ness Ave, San Francisco, CA",
    hours: "Open Today: 9:00 AM – 5:00 PM",
    phone: "+1 (415) 555-0344",
    doctors: ["Dr. Maya Warren, MD (Obstetrician/Gynecologist)"],
    specialties: ["Endometriosis Care", "Hormonal Balance", "Routine Pap & Wellness Exams"],
    availableSlots: [
      { id: "s4", date: "Tomorrow, Oct 1", time: "04:00 PM", type: "Online Tele-consult" },
      { id: "s5", date: "Friday, Oct 2", time: "09:30 AM", type: "In-Person" }
    ]
  },
  {
    id: "cln_003",
    name: "Bay Area Community Women's Medical Clinic",
    rating: 4.7,
    reviewsCount: 210,
    distanceKm: "4.1 km",
    address: "2200 Mission St, San Francisco, CA",
    hours: "Open Today: 8:30 AM – 7:00 PM",
    phone: "+1 (415) 555-0881",
    doctors: ["Dr. Rachel Adams, MD", "Nurse Practitioner Jessica Vance"],
    specialties: ["Affordable Women's Health", "Cycle Irregularities", "Family Planning"],
    availableSlots: [
      { id: "s6", date: "Thursday, Oct 1", time: "01:00 PM", type: "In-Person" }
    ]
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: "bk_001",
    clinicName: "Pacific Women's Health Center",
    doctorName: "Dr. Sarah Lin, MD",
    type: "Online Tele-consultation",
    date: "2026-10-05",
    time: "02:30 PM",
    status: "Confirmed",
    notes: "Discuss cycle regularity & magnesium supplements."
  }
];

// WELLNESS STORE PRODUCTS & ORDERS DATA
export const WELLNESS_STORE_CATEGORIES = [
  "All Products",
  "Period Care",
  "Supplements & Vitamins",
  "Comfort & Pain Relief",
  "Skincare & Self-Care"
];

export const WELLNESS_PRODUCTS = [
  {
    id: "prod_001",
    name: "Organic Cotton Ultra-Soft Pads (Pack of 24)",
    category: "Period Care",
    price: 12.99,
    rating: 4.9,
    reviews: 312,
    badge: "Bestseller",
    image: "📦",
    description: "100% certified organic cotton top-sheet, hypoallergenic, breathable, and zero harsh chemicals or synthetic fragrances.",
    benefits: ["Zero synthetic fragrance", "Ultra-absorbent core", "Biodegradable materials"]
  },
  {
    id: "prod_002",
    name: "Herbal Cramp Comfort Heat Gel Wrap",
    category: "Comfort & Pain Relief",
    price: 24.50,
    rating: 4.8,
    reviews: 184,
    badge: "Staff Pick",
    image: "🌿",
    description: "Reusable soothing microwaveable thermal pouch infused with real lavender and chamomile flowers to naturally ease uterine cramps.",
    benefits: ["Maintains heat for 45+ mins", "Ergonomic pelvic contour", "Machine-washable cover"]
  },
  {
    id: "prod_003",
    name: "Magnesium Glycinate + Vitamin B6 (90 Capsules)",
    category: "Supplements & Vitamins",
    price: 19.99,
    rating: 4.9,
    reviews: 240,
    badge: "Essential",
    image: "💊",
    description: "High-absorption chelating magnesium formulation specifically blended to relieve muscular tension, improve sleep quality, and balance mood.",
    benefits: ["Gentle on digestion", "Reduces pre-period cramps", "Promotes restful sleep"]
  },
  {
    id: "prod_004",
    name: "Organic Menstrual Disc (Medical-Grade Silicone)",
    category: "Period Care",
    price: 32.00,
    rating: 4.7,
    reviews: 96,
    badge: "Eco-Friendly",
    image: "🌸",
    description: "Ultra-flexible, reusable 12-hour leak-proof protection designed to fit naturally against the pubic bone for ultimate comfort.",
    benefits: ["Up to 12 hours wear", "Replaces 1,000+ disposable pads", "100% medical-grade silicone"]
  },
  {
    id: "prod_005",
    name: "Cycle Harmony Herbal Tea Blend (150g loose leaf)",
    category: "Comfort & Pain Relief",
    price: 16.50,
    rating: 4.9,
    reviews: 142,
    badge: "Organic",
    image: "🍵",
    description: "Organic blend of raspberry leaf, nettle, ginger root, peppermint, and rose petals crafted to support natural hormonal harmony.",
    benefits: ["Naturally caffeine-free", "Rich in plant iron", "Soothes digestion & bloating"]
  },
  {
    id: "prod_006",
    name: "Gentle Botanical Pelvic Massage Oil (100ml)",
    category: "Skincare & Self-Care",
    price: 21.00,
    rating: 4.8,
    reviews: 78,
    badge: "Self-Care",
    image: "✨",
    description: "Nourishing organic jojoba and evening primrose oil infused with clary sage and geranium essential oils for soothing self-massage.",
    benefits: ["Eases lower abdominal tension", "Deeply moisturizing", "100% pure botanical oils"]
  }
];

export const INITIAL_STORE_ORDERS = [
  {
    id: "ord_9901",
    date: "2026-09-22",
    total: 37.49,
    status: "Delivered",
    items: [
      { name: "Organic Cotton Ultra-Soft Pads", quantity: 1, price: 12.99 },
      { name: "Herbal Cramp Comfort Heat Gel Wrap", quantity: 1, price: 24.50 }
    ]
  }
];

export const INITIAL_NOTIFICATION_PREFS = [
  { id: "period_rem", name: "Period Prediction Reminders", enabled: true, time: "1 day before" },
  { id: "med_rem", name: "Medication Reminders", enabled: true, time: "Scheduled time" },
  { id: "water_rem", name: "Hydration Check-ins", enabled: true, time: "Every 3 hours" },
  { id: "sleep_rem", name: "Bedtime Wind-down Alert", enabled: false, time: "10:00 PM" },
  { id: "activity_rem", name: "Daily Activity Encouragement", enabled: true, time: "05:00 PM" }
];

export const AI_SUGGESTED_QUESTIONS = [
  "What can cause period cramps?",
  "How can I stay hydrated during my period?",
  "What does cycle day 14 mean?",
  "What symptoms have I logged this month?",
  "How does sleep affect my menstrual cycle?"
];
