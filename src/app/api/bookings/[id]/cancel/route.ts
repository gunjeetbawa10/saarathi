import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAdminSession } from "@/lib/admin-session";
import { cancelBookingById, getBookingById } from "@/lib/supabase/server";

function isAllowedForUser(
  booking: { clerk_user_id: string | null; email: string },
  userId: string | null,
  emails: Set<string>
): boolean {
  if (!userId) return false;
  if (booking.clerk_user_id && booking.clerk_user_id === userId) return true;
  return emails.has(booking.email.trim().toLowerCase());
}

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const adminSession = await getAdminSession();
    const { userId } = await auth();

    let allowed = Boolean(adminSession);
    if (!allowed) {
      const user = await currentUser();
      const emailSet = new Set(
        (user?.emailAddresses ?? [])
          .map((e) => e.emailAddress.trim().toLowerCase())
          .filter(Boolean)
      );
      allowed = isAllowedForUser(booking, userId, emailSet);
    }

    if (!allowed) {
      return NextResponse.json({ error: "Not authorized to cancel this booking." }, { status: 403 });
    }

    if (booking.payment_status === "cancelled") {
      return NextResponse.json({ ok: true, status: "cancelled" });
    }

    const cancelled = await cancelBookingById(params.id);
    if (!cancelled) {
      return NextResponse.json(
        { error: "Only pending or paid bookings can be cancelled." },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, status: "cancelled" });
  } catch (e) {
    const msg =
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: string }).code === "23514"
        ? "Database migration required: allow 'cancelled' in bookings.payment_status."
        : "Could not cancel booking.";
    console.error("[api/bookings/:id/cancel]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
