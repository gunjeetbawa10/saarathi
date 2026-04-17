export const SITE_NAME = "Saarathi Services";
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://saarathiservices.co.uk";
export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

/** First-visit welcome popup; create a matching active coupon in admin for checkout. */
export const WELCOME_COUPON_CODE = "WELCOME10";
export const WELCOME_COUPON_PERCENT = 10;

export const WELCOME_POPUP_COOKIE = "saarthi_welcome_popup_seen";

export const CONTACT = {
  /** E.164 for tel: links */
  phone: "+447375575049",
  phoneDisplay: "+44 7375 575049",
  email: "info@saarathiservices.co.uk",
  location: "LL61 6YG, Anglesey, Wales, UK",
} as const;

/** Footer social links (override TikTok via env if needed). */
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61574260469688",
  tiktok:
    process.env.NEXT_PUBLIC_TIKTOK_URL?.trim() ||
    "https://www.tiktok.com/@saarathi.services",
} as const;

function numEnv(key: string, fallback: number): number {
  const v = process.env[key];
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Hub for service-area checks (LL59 5LP, Menai Bridge). Override via env if needed. */
export const SERVICE_AREA_CENTRE_LAT = numEnv("SERVICE_AREA_CENTRE_LAT", 53.232315);
export const SERVICE_AREA_CENTRE_LNG = numEnv("SERVICE_AREA_CENTRE_LNG", -4.174055);
export const SERVICE_AREA_CENTRE_POSTCODE = "LL59 5LP";
/** ~20 mi keeps most visits within about 30 minutes of the hub. Override via env. */
export const SERVICE_AREA_RADIUS_MILES = numEnv("SERVICE_AREA_RADIUS_MILES", 20);

export const SERVICE_AREA_OUTSIDE_MESSAGE =
  "We’re not in operation at that postcode yet. We’re expanding across North Wales and beyond. Check back soon, or contact us to register your interest.";

/** Time slots are generated in `booking-slots.ts` and filtered per day via GET /api/bookings/availability. */
