import type { User } from "@clerk/nextjs/server";
import { upsertClerkCustomerProfile } from "@/lib/supabase/server";

/** Upsert the signed-in Clerk user into `clerk_customer_profiles` (for admin directory + webhook parity). */
export async function syncClerkUserToSupabase(user: User): Promise<void> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  ) {
    return;
  }

  const primary = user.primaryEmailAddressId
    ? user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
    : user.emailAddresses?.[0];
  const email = primary?.emailAddress;
  if (!email) return;

  await upsertClerkCustomerProfile({
    clerk_user_id: user.id,
    email,
    first_name: user.firstName,
    last_name: user.lastName,
    phone: user.phoneNumbers?.[0]?.phoneNumber ?? null,
  });
}
