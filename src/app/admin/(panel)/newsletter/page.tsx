import type { Metadata } from "next";
import { format } from "date-fns";
import { listNewsletterSignupsDesc } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin: Newsletter",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  let rows: Awaited<ReturnType<typeof listNewsletterSignupsDesc>> = [];
  try {
    rows = await listNewsletterSignupsDesc(500);
  } catch {
    return (
      <div className="px-4 py-10 md:px-8">
        <h1 className="font-display text-3xl text-primary">Newsletter</h1>
        <p className="mt-4 text-ink/70">
          Could not load signups. Apply migration{" "}
          <code className="rounded bg-primary/10 px-1">003_admin_leads.sql</code>{" "}
          in Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-primary">Newsletter</h1>
      <p className="mt-2 text-sm text-ink/60">
        Email addresses saved when visitors submit the homepage newsletter form (stored in
        Supabase).
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Signed up</th>
              <th className="px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-primary/5">
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {format(new Date(r.created_at), "dd MMM yyyy HH:mm")}
                </td>
                <td className="px-4 py-3 text-ink">{r.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">No signups yet.</p>
        )}
      </div>
    </div>
  );
}
