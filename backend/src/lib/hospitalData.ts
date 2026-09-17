export interface Hospital {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  phone: string;
  emergencyPhone: string;
  ambulancePhone: string;
  rating: number;
  reviewsCount: number;
  open24_7: boolean;
  icuBedsAvailable: number;
  totalBeds: number;
  specializations: string[];
  facilities: string[];
  imageUrl: string;
  distanceKm?: number;
}

export const SPECIALIZATIONS_LIST = [
  "All",
  "Cardiology",
  "Neurology & Neurosurgery",
  "Orthopedics",
  "Oncology & Cancer Care",
  "Pediatrics & Child Care",
  "Emergency & Trauma (24/7)",
  "Gynecology & Obstetrics",
  "Nephrology & Dialysis",
  "Pulmonology & Chest Care",
  "Gastroenterology",
  "General Medicine"
];

export const SAMPLE_HOSPITALS: Hospital[] = [
  {
    id: "hosp-1",
    name: "AIIMS Apex Multispeciality Hospital",
    tagline: "Premier Institute of Medical Sciences & Emergency Trauma",
    address: "Ansari Nagar, Ring Road",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110029",
    lat: 28.5672,
    lng: 77.2100,
    phone: "+91 11 2658 8500",
    emergencyPhone: "102 / 011-26594405",
    ambulancePhone: "+91 98110 01100",
    rating: 4.8,
    reviewsCount: 14200,
    open24_7: true,
    icuBedsAvailable: 14,
    totalBeds: 2478,
    specializations: [
      "Cardiology",
      "Neurology & Neurosurgery",
      "Oncology & Cancer Care",
      "Emergency & Trauma (24/7)",
      "Pediatrics & Child Care",
      "Nephrology & Dialysis",
      "General Medicine"
    ],
    facilities: ["24/7 Emergency ICU", "Advanced Cath Lab", "Blood Bank", "Helipad", "Pharmacy"],
    imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp-2",
    name: "Apollo Multispeciality Healthcare",
    tagline: "World-Class Cardiac, Transplant & Robotic Surgery",
    address: "Sarita Vihar, Delhi Mathura Road",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110076",
    lat: 28.5372,
    lng: 77.2910,
    phone: "+91 11 2692 5858",
    emergencyPhone: "1066",
    ambulancePhone: "+91 11 2987 1066",
    rating: 4.7,
    reviewsCount: 9850,
    open24_7: true,
    icuBedsAvailable: 8,
    totalBeds: 710,
    specializations: [
      "Cardiology",
      "Orthopedics",
      "Oncology & Cancer Care",
      "Gynecology & Obstetrics",
      "Gastroenterology",
      "Emergency & Trauma (24/7)"
    ],
    facilities: ["Apollo 1066 Emergency", "Robotic DaVinci Surgery", "24/7 Diagnostic Lab", "Organ Transplant"],
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp-3",
    name: "Max Super Speciality Hospital",
    tagline: "Center of Excellence in Neurosciences, Cardiac & Critical Care",
    address: "1, 2 Press Enclave Marg, Saket",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110017",
    lat: 28.5284,
    lng: 77.2120,
    phone: "+91 11 2651 5050",
    emergencyPhone: "+91 11 4055 4055",
    ambulancePhone: "+91 11 4055 4000",
    rating: 4.6,
    reviewsCount: 7600,
    open24_7: true,
    icuBedsAvailable: 12,
    totalBeds: 530,
    specializations: [
      "Neurology & Neurosurgery",
      "Cardiology",
      "Orthopedics",
      "Pulmonology & Chest Care",
      "Emergency & Trauma (24/7)"
    ],
    facilities: ["Stroke Ready Unit", "Level 1 Trauma Center", "Cath Lab", "Advanced MRI 3T"],
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp-4",
    name: "Fortis Memorial Research Institute",
    tagline: "Next-Gen Healthcare, Oncology & Pediatric Super Speciality",
    address: "Sector 44, Opposite HUDA City Centre",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    lat: 28.4595,
    lng: 77.0725,
    phone: "+91 124 496 2200",
    emergencyPhone: "105010",
    ambulancePhone: "+91 124 496 2222",
    rating: 4.6,
    reviewsCount: 6400,
    open24_7: true,
    icuBedsAvailable: 6,
    totalBeds: 1000,
    specializations: [
      "Pediatrics & Child Care",
      "Oncology & Cancer Care",
      "Cardiology",
      "Nephrology & Dialysis",
      "Gynecology & Obstetrics"
    ],
    facilities: ["Pediatric ICU (PICU)", "Bone Marrow Transplant", "Radiotherapy CyberKnife", "24/7 Pharmacy"],
    imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp-5",
    name: "Medanta - The Medicity",
    tagline: "Integrated Multi-Super Specialty Institute with High Precision Care",
    address: "CH Bakhtawar Singh Road, Sector 38",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122001",
    lat: 28.4398,
    lng: 77.0426,
    phone: "+91 124 414 1414",
    emergencyPhone: "1068",
    ambulancePhone: "+91 124 4834 000",
    rating: 4.8,
    reviewsCount: 16000,
    open24_7: true,
    icuBedsAvailable: 19,
    totalBeds: 1250,
    specializations: [
      "Cardiology",
      "Neurology & Neurosurgery",
      "Orthopedics",
      "Oncology & Cancer Care",
      "Pulmonology & Chest Care",
      "Gastroenterology",
      "Emergency & Trauma (24/7)"
    ],
    facilities: ["Air Ambulance Services", "Critical Care ECMO", "Hybrid Operation Theaters", "Blood Bank"],
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp-6",
    name: "Manipal Hospital & Children’s Center",
    tagline: "Comprehensive Pediatric, Mother & Child, and Family Wellness",
    address: "Palam Vihar Colony, Sector 6, Dwarka",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110075",
    lat: 28.5878,
    lng: 77.0583,
    phone: "+91 11 4967 4967",
    emergencyPhone: "+91 11 4967 4999",
    ambulancePhone: "+91 11 4967 4990",
    rating: 4.5,
    reviewsCount: 4200,
    open24_7: true,
    icuBedsAvailable: 7,
    totalBeds: 380,
    specializations: [
      "Pediatrics & Child Care",
      "Gynecology & Obstetrics",
      "General Medicine",
      "Orthopedics",
      "Emergency & Trauma (24/7)"
    ],
    facilities: ["NICU Level III", "Labour Delivery Suites", "Child Psychology", "24/7 Emergency"],
    imageUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80"
  }
];

// Haversine formula to compute great-circle distance between two GPS coordinates in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export function filterHospitals(
  userLat?: number,
  userLng?: number,
  specialization?: string,
  maxRadiusKm?: number,
  searchQuery?: string
): Hospital[] {
  let list = [...SAMPLE_HOSPITALS];

  // If user coordinates provided, compute distance and sort by proximity
  if (typeof userLat === "number" && typeof userLng === "number") {
    list = list.map((hosp) => ({
      ...hosp,
      distanceKm: calculateDistanceKm(userLat, userLng, hosp.lat, hosp.lng)
    }));

    if (maxRadiusKm && maxRadiusKm > 0) {
      list = list.filter((hosp) => hosp.distanceKm! <= maxRadiusKm);
    }

    list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  } else {
    // Default simulated distances from city center
    list = list.map((hosp, i) => ({
      ...hosp,
      distanceKm: Math.round((2.4 + i * 1.8) * 10) / 10
    }));
  }

  // Filter by Specialization
  if (specialization && specialization !== "All") {
    list = list.filter((hosp) =>
      hosp.specializations.some(
        (s) => s.toLowerCase().includes(specialization.toLowerCase()) || specialization.toLowerCase().includes(s.toLowerCase())
      )
    );
  }

  // Filter by Search text
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (hosp) =>
        hosp.name.toLowerCase().includes(q) ||
        hosp.city.toLowerCase().includes(q) ||
        hosp.specializations.some((s) => s.toLowerCase().includes(q)) ||
        hosp.address.toLowerCase().includes(q)
    );
  }

  return list;
}
