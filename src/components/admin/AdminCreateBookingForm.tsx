"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addDays, format } from "date-fns";
import { useRouter } from "next/navigation";
import type { BookingAddOn, PropertySize, ServiceType } from "@/types/booking";
import {
  addOnLabel,
  calculateBookingPricePence,
  formatGbpFromPence,
  serviceLabel,
} from "@/lib/booking-pricing";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const services: { value: ServiceType; label: string }[] = [
  { value: "DEEP_CLEAN", label: "Deep Clean" },
  { value: "AIRBNB", label: "Airbnb Turnover" },
  { value: "STANDARD", label: "Standard Cleaning" },
  { value: "OFFICE", label: "Executive Office Cleaning" },
];

const sizes: { value: PropertySize; label: string }[] = [
  { value: "ONE_BED", label: "1 bedroom" },
  { value: "TWO_BED", label: "2 bedrooms (+£20)" },
  { value: "THREE_BED", label: "3 bedrooms (+£40)" },
  { value: "FOUR_PLUS", label: "4+ bedrooms (+£60)" },
];

const addOnChoices: {
  value: BookingAddOn;
  label: string;
  priceLabel: string;
}[] = [
  { value: "FRIDGE_FREEZER_CLEAN", label: "Fridge / Freezer Clean", priceLabel: "+£20" },
  { value: "OVEN_DEEP_CLEAN", label: "Oven Deep Clean", priceLabel: "+£25" },
  { value: "EXTRA_BATHROOM", label: "Extra Toilet/Bathroom", priceLabel: "+£20" },
  { value: "MICROWAVE_INTERNAL", label: "Microwave (Internal)", priceLabel: "+£10" },
  { value: "INTERIOR_WINDOWS", label: "Interior Windows", priceLabel: "From +£20" },
  { value: "CARPET_DEEP_CLEAN", label: "Deep Clean Carpet", priceLabel: "From +£30" },
  {
    value: "PET_HOUSE_SINGLE_ROOM_DEEP_CLEAN",
    label: "Pet House Deep Clean (Single Room)",
    priceLabel: "From +£100",
  },
];

type PaymentStatusInput = "pending" | "paid";

type CreateResponse = {
  ok?: boolean;
  bookingId?: string;
  error?: string;
};

type AvailabilityResponse = {
  slots?: string[];
  error?: string;
};

function fieldClass(err?: boolean) {
  return cn(
    "mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
    err ? "border-red-400" : "border-primary/15"
  );
}

function tomorrowYmd(): string {
  return format(addDays(new Date(), 1), "yyyy-MM-dd");
}

export function AdminCreateBookingForm() {
  const router = useRouter();
  const [service, setService] = useState<ServiceType>("STANDARD");
  const [propertySize, setPropertySize] = useState<PropertySize>("ONE_BED");
  const [date, setDate] = useState(tomorrowYmd());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusInput>("pending");
  const [addOns, setAddOns] = useState<BookingAddOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);

  const selectedAddOns = useMemo(
    () => Array.from(new Set(addOns)),
    [addOns]
  );
  const subtotal = useMemo(
    () => calculateBookingPricePence(service, propertySize, selectedAddOns),
    [service, propertySize, selectedAddOns]
  );

  const canSubmit =
    !loading &&
    Boolean(time) &&
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    phone.trim().length >= 10 &&
    postcode.trim().length > 0 &&
    address.trim().length >= 8 &&
    slots.length > 0;

  useEffect(() => {
    let cancelled = false;
    setTime("");
    setSlotsLoading(true);
    setSlotsError(null);
    fetch(`/api/bookings/availability?date=${encodeURIComponent(date)}`)
      .then(async (res) => {
        const data = (await res.json()) as AvailabilityResponse;
        if (!res.ok) {
          if (!cancelled) {
            setSlots([]);
            setSlotsError(data.error ?? "Could not load times");
          }
          return;
        }
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError("Could not load times");
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  function toggleAddOn(next: BookingAddOn, checked: boolean) {
    setAddOns((prev) =>
      checked ? Array.from(new Set([...prev, next])) : prev.filter((item) => item !== next)
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          propertySize,
          date,
          time,
          name,
          email,
          phone,
          postcode,
          address,
          notes,
          couponCode,
          addOns: selectedAddOns,
          paymentStatus,
        }),
      });
      const data = (await res.json()) as CreateResponse;
      if (!res.ok || !data.bookingId) {
        setError(data.error ?? "Could not create booking");
        return;
      }
      router.push(`/admin/bookings/${data.bookingId}`);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Service
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as ServiceType)}
              className={fieldClass()}
            >
              {services.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Property size
            </label>
            <select
              value={propertySize}
              onChange={(e) => setPropertySize(e.target.value as PropertySize)}
              className={fieldClass()}
            >
              {sizes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Date
            </label>
            <input
              type="date"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
              className={fieldClass()}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Time slot
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={slotsLoading || slots.length === 0}
              className={fieldClass()}
            >
              <option value="">
                {slotsLoading
                  ? "Loading available times…"
                  : slots.length === 0
                    ? "No slots left that day"
                    : "Select a window"}
              </option>
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {slotsError && <p className="mt-1 text-sm text-red-600">{slotsError}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Full name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass()} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass()}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Phone
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass()} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Payment status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatusInput)}
              className={fieldClass()}
            >
              <option value="pending">pending</option>
              <option value="paid">paid</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Service postcode
            </label>
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className={fieldClass()}
              placeholder="UK postcode"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Coupon code (optional)
            </label>
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className={fieldClass()}
              placeholder="e.g. SPRING20"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Service address
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={fieldClass()}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Notes (optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={fieldClass()}
          />
        </div>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Additional services & add-ons
          </legend>
          <div className="mt-3 space-y-2">
            {addOnChoices.map((choice) => {
              const checked = selectedAddOns.includes(choice.value);
              return (
                <label
                  key={choice.value}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-white px-4 py-3"
                >
                  <span className="flex items-center gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleAddOn(choice.value, e.target.checked)}
                      className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/30"
                    />
                    {choice.label}
                  </span>
                  <span className="text-sm font-semibold text-primary">{choice.priceLabel}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <Button type="submit" variant="secondary" disabled={!canSubmit}>
          {loading ? "Creating booking…" : "Create booking"}
        </Button>
      </div>

      <aside className="h-fit rounded-3xl border border-primary/10 bg-white p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Summary
        </p>
        <p className="mt-4 font-display text-2xl text-primary">{serviceLabel(service)}</p>
        <p className="mt-2 text-sm text-ink/70">
          {date ? format(new Date(`${date}T12:00:00`), "EEEE, d MMMM yyyy") : "Pick a date"}
        </p>
        <div className="mt-6 border-t border-primary/10 pt-4">
          <p className="text-sm text-ink/70">Subtotal: {formatGbpFromPence(subtotal)}</p>
          {selectedAddOns.length > 0 && (
            <p className="mt-2 text-sm text-ink/70">
              Add-ons: {selectedAddOns.map((a) => addOnLabel(a)).join(", ")}
            </p>
          )}
          <p className="mt-4 text-sm text-ink/60">
            Final total may change if a coupon code is valid.
          </p>
        </div>
      </aside>
    </form>
  );
}
