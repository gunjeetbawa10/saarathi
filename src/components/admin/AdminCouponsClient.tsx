"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import type { CouponRow } from "@/types/coupon";
import { formatGbpFromPence } from "@/lib/booking-pricing";
import { Button } from "@/components/ui/Button";

export function AdminCouponsClient({ initialCoupons }: { initialCoupons: CouponRow[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [percent, setPercent] = useState(10);
  const [fixedPounds, setFixedPounds] = useState("5");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");

  async function refresh() {
    const res = await fetch("/api/admin/coupons");
    const data = (await res.json()) as { coupons?: CouponRow[] };
    if (res.ok && data.coupons) setCoupons(data.coupons);
    router.refresh();
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const body: Record<string, unknown> = {
        code,
        discount_type: discountType,
        active: true,
      };
      if (discountType === "percent") {
        body.discount_percent = percent;
        body.discount_amount_pence = null;
      } else {
        const pence = Math.round(Number.parseFloat(fixedPounds) * 100);
        if (Number.isNaN(pence) || pence < 1) {
          setError("Enter a valid fixed amount in pounds.");
          setPending(false);
          return;
        }
        body.discount_amount_pence = pence;
        body.discount_percent = null;
      }
      if (maxUses.trim()) {
        const n = Number.parseInt(maxUses, 10);
        if (Number.isNaN(n) || n < 1) {
          setError("Max uses must be a positive number.");
          setPending(false);
          return;
        }
        body.max_uses = n;
      } else {
        body.max_uses = null;
      }
      body.valid_until = validUntil.trim() || null;

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create coupon");
        return;
      }
      setCode("");
      await refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-primary">Coupons</h1>
      <p className="mt-2 text-sm text-ink/60">
        Create discount codes. Usage counts increase when a booking is paid (Stripe
        webhook). Minimum charge at checkout is 30p after discount.
      </p>

      <form
        onSubmit={onCreate}
        className="mt-8 max-w-xl space-y-4 rounded-2xl border border-primary/10 bg-white p-6 shadow-card"
      >
        <h2 className="font-display text-lg text-primary">New coupon</h2>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-ink/50">
            Code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2 text-sm"
            placeholder="e.g. SPRING20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-ink/50">
            Type
          </label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
            className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2 text-sm"
          >
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off (GBP)</option>
          </select>
        </div>
        {discountType === "percent" ? (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink/50">
              Percent (1–100)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2 text-sm"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink/50">
              Amount (£)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={fixedPounds}
              onChange={(e) => setFixedPounds(e.target.value)}
              className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2 text-sm"
              placeholder="5.00"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-ink/50">
            Max uses (optional)
          </label>
          <input
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2 text-sm"
            placeholder="Unlimited if empty"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-ink/50">
            Valid until (optional)
          </label>
          <input
            type="datetime-local"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create coupon"}
        </Button>
      </form>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-primary/5">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discount_type === "percent"
                    ? `${c.discount_percent}%`
                    : formatGbpFromPence(c.discount_amount_pence ?? 0)}
                </td>
                <td className="px-4 py-3">
                  {c.uses_count}
                  {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {c.valid_until ? format(new Date(c.valid_until), "dd MMM yyyy HH:mm") : "—"}
                </td>
                <td className="px-4 py-3">{c.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">No coupons yet.</p>
        )}
      </div>
    </div>
  );
}
