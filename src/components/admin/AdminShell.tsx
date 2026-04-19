"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/bookings/new", label: "Create booking" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/transactions", label: "Payments" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/contacts", label: "Contact form" },
  { href: "/admin/newsletter", label: "Newsletter" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="shrink-0 border-b border-primary/10 bg-white px-4 py-6 md:w-56 md:border-b-0 md:border-r">
        <p className="font-display text-lg text-primary">Admin</p>
        <nav className="mt-4 flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-ink/80 transition hover:bg-cream hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-6 w-full rounded-lg border border-primary/15 px-3 py-2 text-left text-sm text-ink/70 transition hover:bg-cream hover:text-primary"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
