import type { Metadata } from "next";
import Link from "next/link";
import { formatGbpFromPence } from "@/lib/booking-pricing";
import { getAdminDashboardStats } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin: Overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wider text-ink/50">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  let stats: Awaited<ReturnType<typeof getAdminDashboardStats>> | null = null;
  try {
    stats = await getAdminDashboardStats();
  } catch {
    return (
      <div className="px-4 py-10 md:px-8">
        <h1 className="font-display text-3xl text-primary">Overview</h1>
        <p className="mt-4 text-ink/70">
          Could not load stats. Check Supabase env vars and run migrations
          (including <code className="rounded bg-primary/10 px-1">003_admin_leads.sql</code>
          ).
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-primary">Overview</h1>
      <p className="mt-2 text-sm text-ink/60">
        Hidden area. Do not link from public navigation.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total bookings"
          value={String(stats.totalBookings)}
          hint={`${stats.paidBookings} paid · ${stats.pendingBookings} pending`}
        />
        <StatCard
          label="Revenue (paid)"
          value={formatGbpFromPence(stats.revenuePence)}
        />
        <StatCard
          label="Contact messages"
          value={String(stats.contactCount)}
        />
        <StatCard
          label="Newsletter signups"
          value={String(stats.newsletterCount)}
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/bookings"
          className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-cream"
        >
          All bookings
        </Link>
        <Link
          href="/admin/customers"
          className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-cream"
        >
          Customers
        </Link>
        <Link
          href="/admin/transactions"
          className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-cream"
        >
          Payments
        </Link>
        <Link
          href="/admin/contacts"
          className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-cream"
        >
          Contact form
        </Link>
        <Link
          href="/admin/newsletter"
          className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-cream"
        >
          Newsletter
        </Link>
      </div>
    </div>
  );
}
