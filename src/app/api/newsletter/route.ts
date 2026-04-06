import { NextResponse } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";
import { CONTACT, SITE_NAME } from "@/lib/constants";
import { insertNewsletterSignup } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email } = parsed.data;

    try {
      await insertNewsletterSignup(email);
    } catch (dbErr) {
      console.error("[newsletter] persist failed", dbErr);
      return NextResponse.json(
        {
          error:
            "Could not save your signup. Ask the site owner to run the Supabase migration for newsletter_signups (003_admin_leads.sql).",
        },
        { status: 503 }
      );
    }

    const from = process.env.RESEND_FROM_EMAIL?.trim();
    const canEmail = Boolean(from && process.env.RESEND_API_KEY?.trim());

    if (canEmail && from) {
      try {
        const resend = getResend();
        await resend.emails.send({
          from,
          to: CONTACT.email,
          subject: `Newsletter signup — ${SITE_NAME}`,
          html: `<p>New subscriber: <strong>${email}</strong></p>`,
        });
        await resend.emails.send({
          from,
          to: email,
          subject: `You’re on the list — ${SITE_NAME}`,
          html: `
        <div style="font-family: Georgia, serif; color: #1a1a1a;">
          <p>Thank you for joining our insights list. Expect calm, practical notes on keeping exceptional spaces — never noise.</p>
          <p style="color:#666;font-size:12px;">${SITE_NAME} · ${CONTACT.location}</p>
        </div>
      `,
        });
      } catch (e) {
        console.error("[newsletter] optional email failed", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
  }
}
