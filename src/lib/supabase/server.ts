import { createClient } from "@supabase/supabase-js";
import type { BookingRow } from "@/types/booking";
import type { ContactSubmissionRow, NewsletterSignupRow } from "@/types/leads";
import type { AdminCredentialRow, AdminCustomerRow } from "@/types/admin";
import { bookingFromRow } from "@/types/booking";
import { normalizeSupabaseUrl } from "@/lib/supabase/env";

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
  address: string;
  notes: string | null;
  price: number;
  payment_status: string;
  clerk_user_id?: string | null;
};

export async function insertBooking(data: InsertBookingInput): Promise<BookingRow> {
  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("bookings")
    .insert({
      service: data.service,
      property_size: data.property_size,
      date: data.date,
      time: data.time,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes,
      price: data.price,
      payment_status: data.payment_status,
      clerk_user_id: data.clerk_user_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
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

/**
 * Merges unique emails from bookings, newsletter signups, and contact form submissions.
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
        name: "—",
        phone: "—",
        lastActivityAt: ns,
        bookingCount: 0,
        newsletterSignup: true,
        contactSubmissions: 0,
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
        phone: "—",
        lastActivityAt: c.last,
        bookingCount: 0,
        newsletterSignup: false,
        contactSubmissions: c.count,
      });
    } else {
      existing.contactSubmissions = c.count;
      if (c.last > existing.lastActivityAt) {
        existing.lastActivityAt = c.last;
      }
      if (
        existing.bookingCount === 0 &&
        (existing.name === "—" || !existing.name.trim())
      ) {
        existing.name = c.name;
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
