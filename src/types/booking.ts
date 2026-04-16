/** App + DB enums (mirror `supabase/migrations/001_bookings.sql`). */

export const ServiceTypeEnum = {
  DEEP_CLEAN: "DEEP_CLEAN",
  AIRBNB: "AIRBNB",
  STANDARD: "STANDARD",
  OFFICE: "OFFICE",
} as const;

export type ServiceType = (typeof ServiceTypeEnum)[keyof typeof ServiceTypeEnum];

export const PropertySizeEnum = {
  ONE_BED: "ONE_BED",
  TWO_BED: "TWO_BED",
  THREE_BED: "THREE_BED",
  FOUR_PLUS: "FOUR_PLUS",
} as const;

export type PropertySize = (typeof PropertySizeEnum)[keyof typeof PropertySizeEnum];

export const BookingAddOnEnum = {
  FRIDGE_FREEZER_CLEAN: "FRIDGE_FREEZER_CLEAN",
  OVEN_DEEP_CLEAN: "OVEN_DEEP_CLEAN",
  EXTRA_BATHROOM: "EXTRA_BATHROOM",
  MICROWAVE_INTERNAL: "MICROWAVE_INTERNAL",
  INTERIOR_WINDOWS: "INTERIOR_WINDOWS",
} as const;

export type BookingAddOn = (typeof BookingAddOnEnum)[keyof typeof BookingAddOnEnum];

export const PaymentStatusEnum = {
  pending: "pending",
  paid: "paid",
  failed: "failed",
} as const;

export type PaymentStatus = (typeof PaymentStatusEnum)[keyof typeof PaymentStatusEnum];

/** Row shape from Supabase (`bookings` table, snake_case). */
export type BookingRow = {
  id: string;
  clerk_user_id: string | null;
  service: string;
  property_size: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  postcode: string | null;
  address: string;
  notes: string | null;
  price: number;
  payment_status: string;
  stripe_session_id: string | null;
  created_at: string;
  subtotal_pence: number | null;
  discount_pence: number;
  coupon_id: string | null;
  coupon_code: string | null;
  add_ons: string[] | null;
};

/** CamelCase booking used in the app (emails, admin UI). */
export type Booking = {
  id: string;
  clerkUserId: string | null;
  service: ServiceType;
  propertySize: PropertySize;
  date: Date;
  time: string;
  name: string;
  email: string;
  phone: string;
  postcode: string | null;
  address: string;
  notes: string | null;
  price: number;
  paymentStatus: PaymentStatus;
  stripeSessionId: string | null;
  createdAt: Date;
  subtotalPence: number | null;
  discountPence: number;
  couponId: string | null;
  couponCode: string | null;
  addOns: BookingAddOn[];
};

function toKnownAddOns(raw: string[] | null | undefined): BookingAddOn[] {
  if (!raw) return [];
  const allowed = new Set(Object.values(BookingAddOnEnum));
  return raw.filter((item): item is BookingAddOn => allowed.has(item as BookingAddOn));
}

export function bookingFromRow(row: BookingRow): Booking {
  return {
    id: row.id,
    clerkUserId: row.clerk_user_id ?? null,
    service: row.service as ServiceType,
    propertySize: row.property_size as PropertySize,
    date: new Date(row.date),
    time: row.time,
    name: row.name,
    email: row.email,
    phone: row.phone,
    postcode: row.postcode ?? null,
    address: row.address,
    notes: row.notes,
    price: row.price,
    paymentStatus: row.payment_status as PaymentStatus,
    stripeSessionId: row.stripe_session_id,
    createdAt: new Date(row.created_at),
    subtotalPence: row.subtotal_pence ?? null,
    discountPence: row.discount_pence ?? 0,
    couponId: row.coupon_id ?? null,
    couponCode: row.coupon_code ?? null,
    addOns: toKnownAddOns(row.add_ons),
  };
}
