import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, isAdminSessionConfigured } from "@/lib/admin-session";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin: Sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const session = await getAdminSession();
  if (session) {
    const next = normalizeNext(searchParams.next);
    redirect(next);
  }

  if (!isAdminSessionConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-ink/80">
        <h1 className="font-display text-2xl text-primary">Admin</h1>
        <p className="mt-4">
          Set <code className="rounded bg-primary/10 px-1">ADMIN_SESSION_SECRET</code>{" "}
          (or legacy <code className="rounded bg-primary/10 px-1">ADMIN_SECRET</code>) in
          your environment: a long random string used to sign session cookies.
        </p>
      </div>
    );
  }

  const nextDefault = normalizeNext(searchParams.next);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-2xl text-primary">Admin sign in</h1>
      <AdminLoginForm nextPath={nextDefault} />
    </div>
  );
}

function normalizeNext(next: string | undefined): string {
  if (!next || !next.startsWith("/admin")) return "/admin/dashboard";
  if (next.startsWith("/admin/login")) return "/admin/dashboard";
  return next;
}
