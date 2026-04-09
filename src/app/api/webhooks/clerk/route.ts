import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { deleteClerkCustomerProfile, upsertClerkCustomerProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClerkLikeUser = Record<string, unknown>;

function parseWebhookUser(data: ClerkLikeUser): {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
} | null {
  const id = typeof data.id === "string" ? data.id : null;
  if (!id || !id.startsWith("user_")) return null;

  const emailsRaw = data.email_addresses ?? data.emailAddresses;
  const emails = emailsRaw as
    | Array<{ id: string; email_address?: string; emailAddress?: string }>
    | undefined;
  const primaryId = (data.primary_email_address_id ?? data.primaryEmailAddressId) as
    | string
    | undefined;

  let email: string | null = null;
  if (emails?.length) {
    const pick = primaryId ? emails.find((e) => e.id === primaryId) : undefined;
    const raw = pick ?? emails[0];
    email = raw.email_address ?? raw.emailAddress ?? null;
  }

  const firstName =
    (data.first_name as string | undefined) ?? (data.firstName as string | undefined) ?? null;
  const lastName =
    (data.last_name as string | undefined) ?? (data.lastName as string | undefined) ?? null;

  const phonesRaw = data.phone_numbers ?? data.phoneNumbers;
  const phones = phonesRaw as
    | Array<{ phone_number?: string; phoneNumber?: string }>
    | undefined;
  const phone = phones?.[0]?.phone_number ?? phones?.[0]?.phoneNumber ?? null;

  return {
    id,
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
  };
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not set" },
      { status: 501 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  let evt: { type: string; data: ClerkLikeUser };
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: ClerkLikeUser };
  } catch (e) {
    console.error("[clerk webhook] verify failed", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (evt.type === "user.deleted") {
      const id = typeof evt.data.id === "string" ? evt.data.id : null;
      if (id) await deleteClerkCustomerProfile(id);
      return NextResponse.json({ ok: true });
    }

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const parsed = parseWebhookUser(evt.data);
      if (!parsed?.email) {
        return NextResponse.json({ ok: true, skipped: true });
      }
      await upsertClerkCustomerProfile({
        clerk_user_id: parsed.id,
        email: parsed.email,
        first_name: parsed.first_name,
        last_name: parsed.last_name,
        phone: parsed.phone,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: evt.type });
  } catch (e) {
    console.error("[clerk webhook]", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
