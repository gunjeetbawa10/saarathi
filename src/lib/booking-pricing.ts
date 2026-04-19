import type { BookingAddOn, PropertySize, ServiceType } from "@/types/booking";

const BASE_PRICES: Record<ServiceType, number> = {
  DEEP_CLEAN: 10000,
  AIRBNB: 5000,
  STANDARD: 6000,
  OFFICE: 7000,
};

const SIZE_ADDONS: Record<PropertySize, number> = {
  ONE_BED: 0,
  TWO_BED: 2000,
  THREE_BED: 4000,
  FOUR_PLUS: 6000,
};

const EXTRA_ADDON_PRICES: Record<BookingAddOn, number> = {
  FRIDGE_FREEZER_CLEAN: 2000,
  OVEN_DEEP_CLEAN: 2500,
  EXTRA_BATHROOM: 2000,
  MICROWAVE_INTERNAL: 1000,
  INTERIOR_WINDOWS: 2000,
  CARPET_DEEP_CLEAN: 3000,
  PET_HOUSE_SINGLE_ROOM_DEEP_CLEAN: 10000,
};

const EXTRA_ADDON_LABELS: Record<BookingAddOn, string> = {
  FRIDGE_FREEZER_CLEAN: "Fridge / Freezer Clean",
  OVEN_DEEP_CLEAN: "Oven Deep Clean",
  EXTRA_BATHROOM: "Extra Toilet/Bathroom",
  MICROWAVE_INTERNAL: "Microwave (Internal)",
  INTERIOR_WINDOWS: "Interior Windows",
  CARPET_DEEP_CLEAN: "Deep Clean Carpet",
  PET_HOUSE_SINGLE_ROOM_DEEP_CLEAN: "Pet House Deep Clean (Single Room)",
};

/** Returns total price in pence (Stripe integer units). */
export function calculateBookingPricePence(
  service: ServiceType,
  propertySize: PropertySize,
  addOns: BookingAddOn[] = []
): number {
  return (
    BASE_PRICES[service] +
    SIZE_ADDONS[propertySize] +
    addOns.reduce((sum, addOn) => sum + EXTRA_ADDON_PRICES[addOn], 0)
  );
}

/** Display price in GBP from pence. */
export function formatGbpFromPence(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export function serviceLabel(service: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    DEEP_CLEAN: "Deep Clean",
    AIRBNB: "Airbnb Turnover",
    STANDARD: "Standard Cleaning",
    OFFICE: "Executive Office Cleaning",
  };
  return labels[service];
}

export function addOnLabel(addOn: BookingAddOn): string {
  return EXTRA_ADDON_LABELS[addOn];
}

export function addOnPricePence(addOn: BookingAddOn): number {
  return EXTRA_ADDON_PRICES[addOn];
}
