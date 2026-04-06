import type { PropertySize, ServiceType } from "@/types/booking";

const BASE_PRICES: Record<ServiceType, number> = {
  DEEP_CLEAN: 15000,
  AIRBNB: 6500,
  STANDARD: 8500,
  OFFICE: 9500,
};

const SIZE_ADDONS: Record<PropertySize, number> = {
  ONE_BED: 0,
  TWO_BED: 2000,
  THREE_BED: 4000,
  FOUR_PLUS: 6000,
};

/** Returns total price in pence (Stripe integer units). */
export function calculateBookingPricePence(
  service: ServiceType,
  propertySize: PropertySize
): number {
  return BASE_PRICES[service] + SIZE_ADDONS[propertySize];
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
