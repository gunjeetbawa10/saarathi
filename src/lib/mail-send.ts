import nodemailer from "nodemailer";
import { getResend } from "./resend";

export type SendMailInput = {
  from: string;
  to: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
};

export function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(user && pass);
}

function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/**
 * Sends transactional mail. Priority: Google Workspace / SMTP (if SMTP_USER + SMTP_PASS), else Resend.
 */
export async function sendTransactionalMail(input: SendMailInput): Promise<void> {
  if (isSmtpConfigured()) {
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || "587");
    const secure =
      process.env.SMTP_SECURE === "true" || port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER!.trim(),
        pass: process.env.SMTP_PASS!.trim(),
      },
    });

    await transporter.sendMail({
      from: input.from,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      html: input.html,
    });
    return;
  }

  if (hasResend()) {
    const resend = getResend();
    const to = Array.isArray(input.to) ? input.to : [input.to];
    await resend.emails.send({
      from: input.from,
      to,
      replyTo: input.replyTo,
      subject: input.subject,
      html: input.html,
    });
    return;
  }

  throw new Error(
    "Mail not configured: set SMTP_USER + SMTP_PASS (Workspace SMTP) or RESEND_API_KEY + use RESEND_FROM_EMAIL in callers"
  );
}

/** From address for booking emails: SMTP_FROM or SMTP_USER, else Resend when API key exists. */
export function getTransactionalFromEmail(): string | null {
  if (isSmtpConfigured()) {
    const explicit = process.env.SMTP_FROM?.trim();
    if (explicit) return explicit;
    const user = process.env.SMTP_USER?.trim();
    return user || null;
  }
  if (hasResend()) {
    return process.env.RESEND_FROM_EMAIL?.trim() || null;
  }
  return null;
}
