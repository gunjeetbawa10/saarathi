import type { Metadata } from "next";
import { format } from "date-fns";
import { getAdminCustomerDirectory } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Customers",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  let customers: Awaited<ReturnType<typeof getAdminCustomerDirectory>> = [];
  try {
    customers = await getAdminCustomerDirectory();
  } catch {
    return (
      <div className="px-4 py-10 md:px-8">
        <h1 className="font-display text-3xl text-primary">Customers</h1>
        <p className="mt-4 text-ink/70">Could not load data from Supabase.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-primary">Customers</h1>
      <p className="mt-2 text-sm text-ink/60">
        Unique emails merged from bookings, newsletter signups, contact form messages, and Clerk
        accounts (webhook + visiting “My bookings”). “Last activity” is the most recent event
        across those sources. Refresh the page to see updates.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Last activity</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Newsletter</th>
              <th className="px-4 py-3">Contact msgs</th>
              <th className="px-4 py-3">Clerk</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-primary/5">
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {format(c.lastActivityAt, "dd MMM yyyy HH:mm")}
                </td>
                <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                <td className="px-4 py-3 text-ink/80">{c.email}</td>
                <td className="px-4 py-3 text-ink/70">{c.phone}</td>
                <td className="px-4 py-3">{c.bookingCount}</td>
                <td className="px-4 py-3 text-ink/80">
                  {c.newsletterSignup ? "Yes" : "—"}
                </td>
                <td className="px-4 py-3">{c.contactSubmissions}</td>
                <td className="px-4 py-3 text-ink/80">
                  {c.clerkAccount ? "Yes" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">
            No leads yet — bookings, newsletter signups, and contact form submissions
            will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
