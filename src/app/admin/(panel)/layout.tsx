import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/admin-session";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-sm text-ink/60 md:px-8">Loading…</div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
