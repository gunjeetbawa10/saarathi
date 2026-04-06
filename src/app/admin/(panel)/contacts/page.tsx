import type { Metadata } from "next";
import { format } from "date-fns";
import { listContactSubmissionsDesc } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Contact form",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  let rows: Awaited<ReturnType<typeof listContactSubmissionsDesc>> = [];
  try {
    rows = await listContactSubmissionsDesc(500);
  } catch {
    return (
      <div className="px-4 py-10 md:px-8">
        <h1 className="font-display text-3xl text-primary">Contact form</h1>
        <p className="mt-4 text-ink/70">
          Could not load submissions. Apply migration{" "}
          <code className="rounded bg-primary/10 px-1">003_admin_leads.sql</code>{" "}
          in Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-primary">Contact form</h1>
      <p className="mt-2 text-sm text-ink/60">
        Messages submitted via the website contact form.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-primary/5 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {format(new Date(r.created_at), "dd MMM yyyy HH:mm")}
                </td>
                <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                <td className="px-4 py-3 text-ink/80">{r.email}</td>
                <td className="max-w-md px-4 py-3 text-ink/80">
                  <span className="line-clamp-4 whitespace-pre-wrap">{r.message}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">No submissions yet.</p>
        )}
      </div>
    </div>
  );
}
