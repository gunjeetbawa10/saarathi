import { format } from "date-fns";
import type { Booking, PropertySize } from "@/types/booking";
import {
  getTransactionalFromEmail,
  sendTransactionalMail,
} from "./mail-send";
import { CONTACT, SITE_NAME, SITE_URL } from "./constants";
import { formatGbpFromPence, serviceLabel } from "./booking-pricing";

/** Replies go here (e.g. your Google Workspace inbox). */
function replyToAddress(): string {
  const env =
    process.env.EMAIL_REPLY_TO?.trim() ??
    process.env.RESEND_REPLY_TO?.trim() ??
    "";
  return env.length > 0 ? env : CONTACT.email;
}

function propertyLabel(size: PropertySize): string {
  const m: Record<PropertySize, string> = {
    ONE_BED: "1 bedroom",
    TWO_BED: "2 bedrooms",
    THREE_BED: "3 bedrooms",
    FOUR_PLUS: "4+ bedrooms",
  };
  return m[size];
}

function bookingDetailsHtml(b: Booking): string {
  return `
    <p><strong>Service:</strong> ${serviceLabel(b.service)}</p>
    <p><strong>Property:</strong> ${propertyLabel(b.propertySize)}</p>
    <p><strong>Date:</strong> ${format(b.date, "EEEE, d MMMM yyyy")}</p>
    <p><strong>Time:</strong> ${b.time}</p>
    <p><strong>Postcode:</strong> ${b.postcode ?? "-"}</p>
    <p><strong>Address:</strong> ${b.address}</p>
    <p><strong>Booking total:</strong> ${formatGbpFromPence(b.price)}</p>
    ${b.notes ? `<p><strong>Notes:</strong> ${b.notes}</p>` : ""}
  `;
}

export async function sendBookingConfirmedToCustomer(booking: Booking) {
  const paid = booking.paymentStatus === "paid";
  const from = getTransactionalFromEmail();
  if (!from) {
    console.warn(
      "Mail from not set: add SMTP_USER+SMTP_PASS (+ optional SMTP_FROM) or RESEND_FROM_EMAIL; skipping customer email"
    );
    return;
  }
  try {
    await sendTransactionalMail({
      from,
      to: booking.email,
      replyTo: replyToAddress(),
      subject: paid
        ? `Your ${SITE_NAME} booking is confirmed`
        : `We received your ${SITE_NAME} booking`,
      html: `
      <div style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6;">
        <h1 style="color: #0b3b24;">${paid ? "Booking confirmed" : "Booking received"}</h1>
        <p>
          ${
            paid
              ? `Thank you, ${booking.name}. Your payment was received and your appointment is confirmed.`
              : `Thank you, ${booking.name}. We have received your booking request. Your appointment will be confirmed once payment is completed.`
          }
        </p>
        <p><strong>Payment status:</strong> ${booking.paymentStatus}</p>
        ${bookingDetailsHtml(booking)}
        <p style="margin-top: 2rem;">Questions? Reply to this email or call us at ${CONTACT.phoneDisplay}.</p>
        <p style="color: #666; font-size: 12px;">${SITE_NAME} · ${CONTACT.location}</p>
      </div>
    `,
    });
  } catch (e) {
    console.error("sendBookingConfirmedToCustomer failed", e);
    throw e;
  }
}

export async function sendNewBookingToAdmin(booking: Booking) {
  const paid = booking.paymentStatus === "paid";
  const from = getTransactionalFromEmail();
  const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? CONTACT.email;
  if (!from) {
    console.warn(
      "Mail from not set: add SMTP_USER+SMTP_PASS (+ optional SMTP_FROM) or RESEND_FROM_EMAIL; skipping admin email"
    );
    return;
  }
  try {
    await sendTransactionalMail({
      from,
      to,
      replyTo: replyToAddress(),
      subject: paid
        ? `Booking paid: ${serviceLabel(booking.service)}`
        : `New booking received: ${serviceLabel(booking.service)}`,
      html: `
      <div style="font-family: sans-serif; color: #1a1a1a;">
        <h2>${paid ? "Booking payment confirmed" : "New booking received"}</h2>
        <p><strong>Payment status:</strong> ${booking.paymentStatus}</p>
        <p><strong>${booking.name}</strong> · ${booking.email} · ${booking.phone}</p>
        ${bookingDetailsHtml(booking)}
        <p><a href="${SITE_URL}/admin/bookings">Open admin bookings</a> (use your configured secret in the URL if required).</p>
      </div>
    `,
    });
  } catch (e) {
    console.error("sendNewBookingToAdmin failed", e);
    throw e;
  }
}
