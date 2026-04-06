export const SITE_NAME = "Saarathi Services";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const CONTACT = {
  phone: "07375575049",
  phoneDisplay: "07375 575049",
  email: "info@saarathiservices.co.uk",
  location: "Bangor LL57, UK",
} as const;

export const TIME_SLOTS = [
  "08:00 – 10:00",
  "10:00 – 12:00",
  "12:00 – 14:00",
  "14:00 – 16:00",
  "16:00 – 18:00",
] as const;
