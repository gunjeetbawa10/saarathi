import { NextResponse } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";
import { CONTACT } from "@/lib/constants";
import { insertContactSubmission } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check your details" }, { status: 400 });
    }

    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      return NextResponse.json({ error: "Contact form unavailable" }, { status: 503 });
    }

    const { name, email, message } = parsed.data;
    const resend = getResend();

    await resend.emails.send({
      from,
      to: CONTACT.email,
      replyTo: email,
      subject: `Website enquiry: ${name}`,
      html: `<p><strong>${name}</strong> &lt;${email}&gt;</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
    });

    try {
      await insertContactSubmission({ name, email, message });
    } catch (dbErr) {
      console.error("[contact] persist failed", dbErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}
