import type { ServiceType } from "@/types/booking";

export type ServiceSlug = "deep-clean" | "airbnb" | "standard" | "office";

export const SERVICE_SLUGS: Record<ServiceType, ServiceSlug> = {
  DEEP_CLEAN: "deep-clean",
  AIRBNB: "airbnb",
  STANDARD: "standard",
  OFFICE: "office",
};

export const SLUG_TO_SERVICE: Record<ServiceSlug, ServiceType> = {
  "deep-clean": "DEEP_CLEAN",
  airbnb: "AIRBNB",
  standard: "STANDARD",
  office: "OFFICE",
};

export type ServiceCard = {
  slug: ServiceSlug;
  service: ServiceType;
  title: string;
  tagline: string;
  description: string;
  priceGbp: number;
  image: string;
  highlights?: string[];
};

export const SERVICE_CARDS: ServiceCard[] = [
  {
    slug: "deep-clean",
    service: "DEEP_CLEAN",
    title: "Deep Clean",
    tagline: "The complete reset",
    description:
      "Top-to-bottom detail for homes that deserve a fresh start: fixtures, floors, and finishes brought back to showroom calm.",
    priceGbp: 100,
    highlights: [
      "1 Bedroom (Base): £100",
      "2 Bedrooms: £120",
      "3 Bedrooms: £140",
      "4 Bedrooms: £160",
    ],
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
  },
  {
    slug: "airbnb",
    service: "AIRBNB",
    title: "Airbnb Turnover",
    tagline: "Guest-ready in hours",
    description:
      "Rapid, hotel-standard turnovers: linens, surfaces, and staging so your next five-star review is effortless.",
    priceGbp: 50,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  },
  {
    slug: "standard",
    service: "STANDARD",
    title: "Standard Cleaning",
    tagline: "Consistent excellence",
    description:
      "Recurring care tailored to your rhythm: polished living spaces without the operational noise.",
    priceGbp: 60,
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
  },
  {
    slug: "office",
    service: "OFFICE",
    title: "Executive Office Cleaning",
    tagline: "Boardroom quiet. Discreet after-hours service.",
    description:
      "Premium after-hours care for workspaces that need quiet, consistent standards and a spotless first impression every morning.",
    priceGbp: 70,
    highlights: [
      "Small Office (1-2 Rooms): From £70",
      "Medium Office (3-5 Rooms): From £110",
      "Large Office (6+ Rooms): Contact for Quote",
    ],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
];
