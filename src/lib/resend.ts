import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export function getResend(): Resend {
  if (!apiKey || !resend) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return resend;
}
