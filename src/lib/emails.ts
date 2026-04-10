import { format } from "date-fns";
import type { Booking, PropertySize } from "@/types/booking";
import { getResend } from "./resend";
import { CONTACT, SITE_NAME, SITE_URL } from "./constants";
import { formatGbpFromPence, serviceLabel } from "./booking-pricing";

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
    <p><strong>Amount paid:</strong> ${formatGbpFromPence(b.price)}</p>
    ${b.notes ? `<p><strong>Notes:</strong> ${b.notes}</p>` : ""}
  `;
}

export async function sendBookingConfirmedToCustomer(booking: Booking) {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    console.warn("RESEND_FROM_EMAIL not set; skipping customer email");
    return;
  }
  const resend = getResend();
  await resend.emails.send({
    from,
    to: booking.email,
    subject: `Your ${SITE_NAME} booking is confirmed`,
    html: `
      <div style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6;">
        <h1 style="color: #0b3b24;">Booking confirmed</h1>
        <p>Thank you, ${booking.name}. Your payment was received and your appointment is confirmed.</p>
        ${bookingDetailsHtml(booking)}
        <p style="margin-top: 2rem;">Questions? Reply to this email or call us at ${CONTACT.phoneDisplay}.</p>
        <p style="color: #666; font-size: 12px;">${SITE_NAME} · ${CONTACT.location}</p>
      </div>
    `,
  });
}

export async function sendNewBookingToAdmin(booking: Booking) {
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? CONTACT.email;
  if (!from) {
    console.warn("RESEND_FROM_EMAIL not set; skipping admin email");
    return;
  }
  const resend = getResend();
  await resend.emails.send({
    from,
    to,
    subject: `New paid booking: ${serviceLabel(booking.service)}`,
    html: `
      <div style="font-family: sans-serif; color: #1a1a1a;">
        <h2>New booking received</h2>
        <p><strong>${booking.name}</strong> · ${booking.email} · ${booking.phone}</p>
        ${bookingDetailsHtml(booking)}
        <p><a href="${SITE_URL}/admin/bookings">Open admin bookings</a> (use your configured secret in the URL if required).</p>
      </div>
    `,
  });
}
