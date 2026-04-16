import { createClient } from "@supabase/supabase-js";
import type { BookingRow } from "@/types/booking";
import type { BookingAddOn } from "@/types/booking";
import type { ContactSubmissionRow, NewsletterSignupRow } from "@/types/leads";
import type {
  AdminCredentialRow,
  AdminCustomerRow,
  ClerkCustomerProfileRow,
} from "@/types/admin";
import { bookingFromRow } from "@/types/booking";
import { fromZonedTime } from "date-fns-tz";
import { normalizeSupabaseUrl } from "@/lib/supabase/env";

const BOOKING_TZ = "Europe/London";

function isMissingColumnError(
  error: { code?: string; message?: string } | null,
  table: string,
  column: string
): boolean {
  if (!error) return false;
  const message = error.message ?? "";
  return (
    error.code === "PGRST204" &&
    message.includes(`'${column}'`) &&
    message.includes(`'${table}'`)
  );
}

function getSupabaseUrl(): string {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return url;
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return key;
}

/** Service-role client for API routes and server-only code (bypasses RLS). */
export function getSupabaseAdmin() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type InsertBookingInput = {
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
  clerk_user_id?: string | null;
  subtotal_pence: number;
  discount_pence: number;
  coupon_id?: string | null;
  coupon_code?: string | null;
  add_ons?: BookingAddOn[];
};

export async function insertBooking(data: InsertBookingInput): Promise<BookingRow> {
  const supabase = getSupabaseAdmin();

  const payload = {
    service: data.service,
    property_size: data.property_size,
    date: data.date,
    time: data.time,
    name: data.name,
    email: data.email,
    phone: data.phone,
    postcode: data.postcode ?? null,
    address: data.address,
    notes: data.notes,
    price: data.price,
    payment_status: data.payment_status,
    clerk_user_id: data.clerk_user_id ?? null,
    subtotal_pence: data.subtotal_pence,
    discount_pence: data.discount_pence,
    coupon_id: data.coupon_id ?? null,
    coupon_code: data.coupon_code ?? null,
    add_ons: data.add_ons ?? [],
  };

  const { data: row, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (isMissingColumnError(error, "bookings", "postcode")) {
      const { postcode, ...fallbackPayload } = payload;
      void postcode;
      const { data: retryRow, error: retryError } = await supabase
        .from("bookings")
        .insert(fallbackPayload)
        .select()
        .single();

      if (retryError) throw retryError;
      return retryRow as BookingRow;
    }
    throw error;
  }
  return row as BookingRow;
}

export async function updateBookingStripeSession(
  bookingId: string,
  stripeSessionId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("bookings")
    .update({ stripe_session_id: stripeSessionId })
    .eq("id", bookingId);

  if (error) throw error;
}

export async function listBookingsDesc(limit: number): Promise<BookingRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as BookingRow[];
}

/** Bookings whose appointment `date` falls on this calendar day in Europe/London. Excludes failed payments (slot released). */
export async function listBookingsOnLocalCalendarDay(
  ymd: string
): Promise<BookingRow[]> {
  const start = fromZonedTime(`${ymd}T00:00:00`, BOOKING_TZ);
  const end = fromZonedTime(`${ymd}T23:59:59.999`, BOOKING_TZ);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .gte("date", start.toISOString())
    .lte("date", end.toISOString())
    .neq("payment_status", "failed");

  if (error) throw error;
  return (data ?? []) as BookingRow[];
}

/** Bookings for a Clerk user (appointment date ordering is applied in the app). */
export async function listBookingsForClerkUser(
  clerkUserId: string,
  limit = 200
): Promise<BookingRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listBookingsForClerkUser]", error.message, error);
    throw error;
  }
  return (data ?? []) as BookingRow[];
}

/** Bookings for known customer emails (useful for guest checkout history). */
export async function listBookingsForEmails(
  emails: string[],
  limit = 200
): Promise<BookingRow[]> {
  const unique = Array.from(
    new Set(
      emails
        .map((email) => email.trim())
        .filter(Boolean)
    )
  );
  if (unique.length === 0) return [];

  const supabase = getSupabaseAdmin();
  const emailOrFilter = unique.map((email) => `email.ilike.${email}`).join(",");
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .or(emailOrFilter)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listBookingsForEmails]", error.message, error);
    throw error;
  }
  return (data ?? []) as BookingRow[];
}

/** Sets `paid` only if still `pending`; returns the updated row or null if no change. */
export async function markBookingPaidIfPending(
  bookingId: string,
  stripeSessionId: string
): Promise<BookingRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      stripe_session_id: stripeSessionId,
    })
    .eq("id", bookingId)
    .eq("payment_status", "pending")
    .select()
    .maybeSingle();

  if (error) throw error;
  return data ? (data as BookingRow) : null;
}

export async function getBookingById(bookingId: string): Promise<BookingRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error) throw error;
  return data ? (data as BookingRow) : null;
}

export async function insertContactSubmission(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("contact_submissions").insert({
    name: input.name,
    email: input.email,
    message: input.message,
  });
  if (error) throw error;
}

export async function insertNewsletterSignup(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("newsletter_signups").insert({ email });
  if (error) throw error;
}

export async function listContactSubmissionsDesc(
  limit: number
): Promise<ContactSubmissionRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ContactSubmissionRow[];
}

export async function listNewsletterSignupsDesc(
  limit: number
): Promise<NewsletterSignupRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("newsletter_signups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as NewsletterSignupRow[];
}

function emailKey(email: string): string | null {
  const k = email.trim().toLowerCase();
  return k.length ? k : null;
}

function clerkProfileDisplayName(p: ClerkCustomerProfileRow): string {
  const n = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return n || "-";
}

/** PostgREST: table not exposed / migration `007_clerk_customer_profiles.sql` not applied yet. */
function isClerkProfilesTableMissing(error: { code?: string } | null): boolean {
  return error?.code === "PGRST205";
}

export async function upsertClerkCustomerProfile(input: {
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("clerk_customer_profiles").upsert(
    {
      clerk_user_id: input.clerk_user_id,
      email: input.email.trim(),
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" }
  );
  if (error) {
    if (isClerkProfilesTableMissing(error)) return;
    throw error;
  }
}

export async function deleteClerkCustomerProfile(clerkUserId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("clerk_customer_profiles")
    .delete()
    .eq("clerk_user_id", clerkUserId);
  if (error) {
    if (isClerkProfilesTableMissing(error)) return;
    throw error;
  }
}

async function listClerkCustomerProfilesForDirectory(
  limit = 5000
): Promise<ClerkCustomerProfileRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("clerk_customer_profiles")
    .select("clerk_user_id, email, first_name, last_name, phone, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isClerkProfilesTableMissing(error)) return [];
    throw error;
  }
  return (data ?? []) as ClerkCustomerProfileRow[];
}

/**
 * Merges unique emails from bookings, newsletter, contact form, and Clerk profile mirror.
 * Bookings drive name/phone when present; “last activity” is the newest timestamp across sources.
 */
export async function getAdminCustomerDirectory(): Promise<AdminCustomerRow[]> {
  const bookingRows = await listBookingsDesc(5000);

  let newsletterRows: NewsletterSignupRow[] = [];
  try {
    newsletterRows = await listNewsletterSignupsDesc(5000);
  } catch (e) {
    console.error("[getAdminCustomerDirectory] newsletter_signups", e);
  }

  let contactRows: ContactSubmissionRow[] = [];
  try {
    contactRows = await listContactSubmissionsDesc(5000);
  } catch (e) {
    console.error("[getAdminCustomerDirectory] contact_submissions", e);
  }

  let clerkRows: ClerkCustomerProfileRow[] = [];
  try {
    clerkRows = await listClerkCustomerProfilesForDirectory(5000);
  } catch (e) {
    console.error("[getAdminCustomerDirectory] clerk_customer_profiles", e);
  }

  const bookings = bookingRows.map(bookingFromRow);
  const map = new Map<
    string,
    {
      email: string;
      name: string;
      phone: string;
      lastActivityAt: Date;
      bookingCount: number;
      newsletterSignup: boolean;
      contactSubmissions: number;
      clerkAccount: boolean;
    }
  >();

  for (const b of bookings) {
    const key = emailKey(b.email);
    if (!key) continue;
    const created = b.createdAt;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        email: b.email.trim(),
        name: b.name,
        phone: b.phone,
        lastActivityAt: created,
        bookingCount: 1,
        newsletterSignup: false,
        contactSubmissions: 0,
        clerkAccount: false,
      });
    } else {
      existing.bookingCount += 1;
      if (created > existing.lastActivityAt) {
        existing.lastActivityAt = created;
        existing.name = b.name;
        existing.phone = b.phone;
      }
    }
  }

  for (const n of newsletterRows) {
    const key = emailKey(n.email);
    if (!key) continue;
    const ns = new Date(n.created_at);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        email: n.email.trim(),
        name: "-",
        phone: "-",
        lastActivityAt: ns,
        bookingCount: 0,
        newsletterSignup: true,
        contactSubmissions: 0,
        clerkAccount: false,
      });
    } else {
      existing.newsletterSignup = true;
      if (ns > existing.lastActivityAt) {
        existing.lastActivityAt = ns;
      }
    }
  }

  const contactsByKey = new Map<
    string,
    { count: number; last: Date; name: string; email: string }
  >();

  for (const c of contactRows) {
    const key = emailKey(c.email);
    if (!key) continue;
    const last = new Date(c.created_at);
    const prev = contactsByKey.get(key);
    if (!prev) {
      contactsByKey.set(key, {
        count: 1,
        last,
        name: c.name,
        email: c.email.trim(),
      });
    } else {
      prev.count += 1;
      if (last > prev.last) {
        prev.last = last;
        prev.name = c.name;
      }
    }
  }

  for (const [key, c] of Array.from(contactsByKey.entries())) {
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        email: c.email,
        name: c.name,
        phone: "-",
        lastActivityAt: c.last,
        bookingCount: 0,
        newsletterSignup: false,
        contactSubmissions: c.count,
        clerkAccount: false,
      });
    } else {
      existing.contactSubmissions = c.count;
      if (c.last > existing.lastActivityAt) {
        existing.lastActivityAt = c.last;
      }
      if (
        existing.bookingCount === 0 &&
        (existing.name === "-" || !existing.name.trim())
      ) {
        existing.name = c.name;
      }
    }
  }

  for (const p of clerkRows) {
    const key = emailKey(p.email);
    if (!key) continue;
    const at = new Date(p.updated_at);
    const displayName = clerkProfileDisplayName(p);
    const phone = p.phone?.trim() || "-";
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        email: p.email.trim(),
        name: displayName,
        phone,
        lastActivityAt: at,
        bookingCount: 0,
        newsletterSignup: false,
        contactSubmissions: 0,
        clerkAccount: true,
      });
    } else {
      existing.clerkAccount = true;
      if (at > existing.lastActivityAt) {
        existing.lastActivityAt = at;
      }
      if (!existing.phone || existing.phone === "-") {
        existing.phone = phone;
      }
      if (existing.name === "-" || !existing.name.trim()) {
        existing.name = displayName;
      }
    }
  }

  return Array.from(map.values())
    .map(
      (r): AdminCustomerRow => ({
        email: r.email,
        name: r.name,
        phone: r.phone,
        lastActivityAt: r.lastActivityAt,
        bookingCount: r.bookingCount,
        newsletterSignup: r.newsletterSignup,
        contactSubmissions: r.contactSubmissions,
        clerkAccount: r.clerkAccount,
      })
    )
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
}

export type AdminDashboardStats = {
  totalBookings: number;
  paidBookings: number;
  pendingBookings: number;
  failedBookings: number;
  revenuePence: number;
  contactCount: number;
  newsletterCount: number;
};

export async function getAdminByUsername(
  username: string
): Promise<AdminCredentialRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_credentials")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return data ? (data as AdminCredentialRow) : null;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = getSupabaseAdmin();

  const [
    totalRes,
    paidRes,
    pendingRes,
    failedRes,
    paidPrices,
    contactRes,
    newsletterRes,
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("payment_status", "paid"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("payment_status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("payment_status", "failed"),
    supabase.from("bookings").select("price").eq("payment_status", "paid"),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_signups").select("*", { count: "exact", head: true }),
  ]);

  if (totalRes.error) throw totalRes.error;
  if (paidRes.error) throw paidRes.error;
  if (pendingRes.error) throw pendingRes.error;
  if (failedRes.error) throw failedRes.error;
  if (paidPrices.error) throw paidPrices.error;
  if (contactRes.error) throw contactRes.error;
  if (newsletterRes.error) throw newsletterRes.error;

  const rows = paidPrices.data ?? [];
  const revenuePence = rows.reduce((sum, r) => sum + (r.price ?? 0), 0);

  return {
    totalBookings: totalRes.count ?? 0,
    paidBookings: paidRes.count ?? 0,
    pendingBookings: pendingRes.count ?? 0,
    failedBookings: failedRes.count ?? 0,
    revenuePence,
    contactCount: contactRes.count ?? 0,
    newsletterCount: newsletterRes.count ?? 0,
  };
}
