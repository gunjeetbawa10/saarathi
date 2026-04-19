import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAdminSession } from "@/lib/admin-session";
import { cancelBookingById, getBookingById } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

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

    if (booking.payment_status === "paid" && booking.stripe_session_id) {
      try {
        const session = await getStripe().checkout.sessions.retrieve(
          booking.stripe_session_id
        );
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        if (!paymentIntentId) {
          return NextResponse.json(
            { error: "Could not locate Stripe payment to refund." },
            { status: 409 }
          );
        }

        const existingRefunds = await getStripe().refunds.list({
          payment_intent: paymentIntentId,
          limit: 1,
        });

        if (existingRefunds.data.length === 0) {
          await getStripe().refunds.create({
            payment_intent: paymentIntentId,
            reason: "requested_by_customer",
            metadata: { bookingId: booking.id },
          });
        }
      } catch (e) {
        console.error("[api/bookings/:id/cancel] refund failed", e);
        return NextResponse.json(
          { error: "Could not process Stripe refund for this booking." },
          { status: 502 }
        );
      }
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
