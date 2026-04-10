import type { Metadata } from "next";
import { AdminCouponsClient } from "@/components/admin/AdminCouponsClient";
import { listCouponsDesc } from "@/lib/coupon-db";

export const metadata: Metadata = {
  title: "Admin: Coupons",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  let coupons: Awaited<ReturnType<typeof listCouponsDesc>> = [];
  try {
    coupons = await listCouponsDesc();
  } catch {
    return (
      <div className="px-4 py-10 md:px-8">
        <h1 className="font-display text-3xl text-primary">Coupons</h1>
        <p className="mt-4 text-ink/70">
          Could not load coupons. Run{" "}
          <code className="rounded bg-primary/10 px-1">005_coupons.sql</code> in Supabase.
        </p>
      </div>
    );
  }

  return <AdminCouponsClient initialCoupons={coupons} />;
}
