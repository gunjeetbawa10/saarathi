import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { listBookingsForClerkUser } from "@/lib/supabase/server";
import { bookingFromRow } from "@/types/booking";
import { partitionUpcomingAndPast } from "@/lib/booking-lists";
import { Reveal } from "@/components/motion/Reveal";
import { MyBookingsEmptyCta, MyBookingsTable } from "@/components/account/MyBookingsTable";

export const metadata: Metadata = {
  title: "My bookings",
  description: "Your upcoming and past Saarathi Services bookings.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountBookingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent("/account/bookings")}`);
  }

  let upcoming: ReturnType<typeof bookingFromRow>[] = [];
  let past: ReturnType<typeof bookingFromRow>[] = [];
  let loadError: string | null = null;

  try {
    const rows = await listBookingsForClerkUser(userId);
    const bookings = rows.map(bookingFromRow);
    const split = partitionUpcomingAndPast(bookings);
    upcoming = split.upcoming;
    past = split.past;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load bookings.";
  }

  if (loadError) {
    const isDev = process.env.NODE_ENV === "development";
    return (
      <div className="bg-cream px-4 py-14 md:px-6">
        <div className="mx-auto max-w-3xl text-ink/80">
          <h1 className="font-display text-2xl text-primary">My bookings</h1>
          <p className="mt-4">
            Could not load bookings. This usually means the database is missing the{" "}
            <code className="rounded bg-primary/10 px-1">clerk_user_id</code> column. In Supabase
            → <strong>SQL Editor</strong>, run the full script from{" "}
            <code className="rounded bg-primary/10 px-1">supabase/migrations/002_clerk_user.sql</code>{" "}
            (copy the file contents, paste, Run). Then refresh this page.
          </p>
          <p className="mt-4 text-sm text-ink/60">
            Also confirm <code className="rounded bg-primary/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and <code className="rounded bg-primary/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code> are
            set in your environment (same as for the booking API).
          </p>
          {isDev && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-mono text-xs text-red-900">
              {loadError}
            </p>
          )}
        </div>
      </div>
    );
  }

  const hasAny = upcoming.length > 0 || past.length > 0;

  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Account</p>
            <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">My bookings</h1>
            <p className="mt-4 max-w-2xl text-ink/70">
              Upcoming visits and your history. Bookings you complete while signed in are listed
              here; guest checkouts are not linked to your account.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-14 px-4 py-12 md:px-6 md:py-16">
        <section>
          <h2 className="font-display text-xl text-primary">Upcoming</h2>
          <p className="mt-1 text-sm text-ink/55">Appointments from today onward.</p>
          <div className="mt-6">
            <MyBookingsTable
              bookings={upcoming}
              emptyMessage="No upcoming bookings. Make one while signed in so it appears here."
            />
            {!hasAny && <MyBookingsEmptyCta />}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-primary">Past</h2>
          <p className="mt-1 text-sm text-ink/55">Earlier appointments.</p>
          <div className="mt-6">
            <MyBookingsTable
              bookings={past}
              emptyMessage="No past bookings yet — your completed visits will show here."
            />
          </div>
        </section>

        <p className="text-center text-sm text-ink/50">
          <Link href="/booking" className="font-medium text-primary hover:underline">
            Book another visit
          </Link>
        </p>
      </div>
    </div>
  );
}
