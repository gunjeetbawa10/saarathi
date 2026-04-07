export const SITE_NAME = "Saarathi Services";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const CONTACT = {
  phone: "07375575049",
  phoneDisplay: "07375 575049",
  email: "info@saarathiservices.co.uk",
  location: "Bangor LL57, UK",
} as const;

/** Time slots are generated in `booking-slots.ts` and filtered per day via GET /api/bookings/availability. */
