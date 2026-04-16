"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DayPicker } from "react-day-picker";
import { addDays, format, startOfDay } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { BookingAddOn, PropertySize, ServiceType } from "@/types/booking";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/validation/booking";
import {
  addOnLabel,
  addOnPricePence,
  calculateBookingPricePence,
  formatGbpFromPence,
  serviceLabel,
} from "@/lib/booking-pricing";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
type ServiceAreaUi =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok"; distanceMiles: number }
  | { status: "fail"; message: string };

type AddressLookupUi =
  | { status: "idle"; suggestions: string[]; error: null }
  | { status: "loading"; suggestions: string[]; error: null }
  | { status: "ok"; suggestions: string[]; error: null }
  | { status: "fail"; suggestions: string[]; error: string };

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
  detail?: string;
}[] = [
  {
    value: "FRIDGE_FREEZER_CLEAN",
    label: "Fridge / Freezer Clean",
    priceLabel: "+£20",
    detail: "Internal deep clean & sanitisation",
  },
  { value: "OVEN_DEEP_CLEAN", label: "Oven Deep Clean", priceLabel: "+£25" },
  { value: "EXTRA_BATHROOM", label: "Extra Toilet/Bathroom", priceLabel: "+£20" },
  { value: "MICROWAVE_INTERNAL", label: "Microwave (Internal)", priceLabel: "+£10" },
  { value: "INTERIOR_WINDOWS", label: "Interior Windows", priceLabel: "From +£20" },
];

const TZ = "Europe/London";

function fieldClass(err?: boolean) {
  return cn(
    "mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
    err ? "border-red-400" : "border-primary/15"
  );
}

export function BookingForm({
  defaultService,
}: {
  defaultService?: ServiceType;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [couponPreview, setCouponPreview] = useState<{
    discountPence: number;
    finalPence: number;
    couponCode: string | null;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [serviceArea, setServiceArea] = useState<ServiceAreaUi>({ status: "idle" });
  const [addressLookup, setAddressLookup] = useState<AddressLookupUi>({
    status: "idle",
    suggestions: [],
    error: null,
  });

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      service: defaultService ?? "STANDARD",
      propertySize: "ONE_BED",
      date: addDays(startOfDay(new Date()), 1),
      time: "",
      name: "",
      email: "",
      phone: "",
      postcode: "",
      address: "",
      notes: "",
      couponCode: "",
      addOns: [],
    },
  });

  const service = form.watch("service");
  const propertySize = form.watch("propertySize");
  const selectedDate = form.watch("date");
  const postcodeField = form.watch("postcode");
  const addOns = form.watch("addOns");
  const postcodeTrimmed = postcodeField.trim();
  const selectedAddOns = useMemo(
    () => Array.from(new Set((addOns ?? []) as BookingAddOn[])),
    [addOns]
  );

  const pricePence = useMemo(
    () => calculateBookingPricePence(service, propertySize, selectedAddOns),
    [service, propertySize, selectedAddOns]
  );

  const finalPence = couponPreview?.finalPence ?? pricePence;
  const discountPence = couponPreview?.discountPence ?? 0;

  const postcodeOk =
    postcodeField.trim().length > 0 && serviceArea.status === "ok";

  useEffect(() => {
    setCouponPreview(null);
    setCouponError(null);
  }, [service, propertySize, selectedAddOns]);

  async function applyCoupon() {
    setCouponError(null);
    setCouponApplying(true);
    try {
      const code = form.getValues("couponCode")?.trim();
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code || undefined,
          service: form.getValues("service"),
          propertySize: form.getValues("propertySize"),
          addOns: form.getValues("addOns"),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        discountPence?: number;
        finalPence?: number;
        couponCode?: string | null;
      };
      if (!res.ok) {
        setCouponPreview(null);
        setCouponError(data.error ?? "Could not apply coupon");
        return;
      }
      setCouponPreview({
        discountPence: data.discountPence ?? 0,
        finalPence: data.finalPence ?? pricePence,
        couponCode: data.couponCode ?? null,
      });
    } catch {
      setCouponPreview(null);
      setCouponError("Network error");
    } finally {
      setCouponApplying(false);
    }
  }

  useEffect(() => {
    form.setValue("time", "");
  }, [selectedDate, form]);

  useEffect(() => {
    const raw = postcodeTrimmed;
    if (!raw) {
      setServiceArea({ status: "idle" });
      return;
    }
    setServiceArea({ status: "idle" });
    const handle = window.setTimeout(() => {
      void (async () => {
        setServiceArea({ status: "checking" });
        try {
          const res = await fetch("/api/bookings/service-area", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postcode: raw }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            message?: string;
            distanceMiles?: number;
          };
          if (res.ok && data.ok) {
            setServiceArea({
              status: "ok",
              distanceMiles: data.distanceMiles ?? 0,
            });
            return;
          }
          setServiceArea({
            status: "fail",
            message: data.message ?? "We could not confirm coverage for this postcode.",
          });
        } catch {
          setServiceArea({
            status: "fail",
            message: "Could not verify postcode. Try again.",
          });
        }
      })();
    }, 450);
    return () => window.clearTimeout(handle);
  }, [postcodeTrimmed]);

  useEffect(() => {
    const raw = postcodeTrimmed;
    if (raw.length < 5) {
      setAddressLookup({ status: "idle", suggestions: [], error: null });
      return;
    }

    let cancelled = false;
    setAddressLookup((prev) => ({
      status: "loading",
      suggestions: prev.suggestions,
      error: null,
    }));

    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/bookings/address-lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postcode: raw }),
          });
          const data = (await res.json()) as {
            error?: string;
            suggestions?: string[];
          };
          if (cancelled) return;
          if (!res.ok) {
            setAddressLookup({
              status: "fail",
              suggestions: [],
              error: data.error ?? "Could not fetch address suggestions.",
            });
            return;
          }
          const suggestions = (data.suggestions ?? []).slice(0, 6);
          setAddressLookup({
            status: "ok",
            suggestions,
            error: null,
          });
        } catch {
          if (cancelled) return;
          setAddressLookup({
            status: "fail",
            suggestions: [],
            error: "Could not fetch address suggestions.",
          });
        }
      })();
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [postcodeTrimmed]);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);
    const ymd = formatInTimeZone(selectedDate, TZ, "yyyy-MM-dd");
    fetch(`/api/bookings/availability?date=${encodeURIComponent(ymd)}`)
      .then(async (res) => {
        const data = (await res.json()) as { slots?: string[]; error?: string };
        if (!res.ok) {
          if (!cancelled) {
            setSlotsError(data.error ?? "Could not load times");
            setSlots([]);
          }
          return;
        }
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setSlotsError("Could not load times");
          setSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  async function onSubmit(values: BookingFormValues) {
    setSubmitError(null);
    setLoading(true);
    try {
      const verifyRes = await fetch("/api/bookings/service-area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: values.postcode }),
      });
      const verifyData = (await verifyRes.json()) as {
        ok?: boolean;
        message?: string;
        distanceMiles?: number;
      };
      if (!verifyRes.ok || !verifyData.ok) {
        setServiceArea({
          status: "fail",
          message:
            verifyData.message ??
            "We could not confirm coverage for this postcode.",
        });
        setSubmitError(
          verifyData.message ??
            "We could not confirm coverage for this postcode."
        );
        setLoading(false);
        return;
      }
      setServiceArea({
        status: "ok",
        distanceMiles: verifyData.distanceMiles ?? 0,
      });

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          date: values.date.toISOString(),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setSubmitError("No checkout URL returned");
    } catch {
      setSubmitError("Network error. Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-10 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Service
          </label>
          <select {...form.register("service")} className={fieldClass(!!form.formState.errors.service)}>
            {services.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Property size
          </label>
          <select
            {...form.register("propertySize")}
            className={fieldClass(!!form.formState.errors.propertySize)}
          >
            {sizes.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Coupon code (optional)
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              {...form.register("couponCode")}
              className={fieldClass(false)}
              placeholder="e.g. SPRING20"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              className="shrink-0"
              onClick={() => void applyCoupon()}
              disabled={couponApplying}
            >
              {couponApplying ? "Checking…" : "Apply"}
            </Button>
          </div>
          {couponError && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {couponError}
            </p>
          )}
          {discountPence > 0 && couponPreview?.couponCode && (
            <p className="mt-1 text-sm text-primary">
              {couponPreview.couponCode} applied. You save {formatGbpFromPence(discountPence)}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Additional services & add-ons
          </legend>
          <p className="mt-1 text-sm text-ink/60">
            Customise your clean with these specific extras.
          </p>
          <div className="mt-3 space-y-2">
            {addOnChoices.map((choice) => (
              <label
                key={choice.value}
                className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-primary/10 bg-white px-4 py-3"
              >
                <span className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    value={choice.value}
                    {...form.register("addOns")}
                    className="mt-1 h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/30"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">{choice.label}</span>
                    {choice.detail && (
                      <span className="block text-xs text-ink/60">{choice.detail}</span>
                    )}
                  </span>
                </span>
                <span className="text-sm font-semibold text-primary">{choice.priceLabel}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Preferred date
          </p>
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <div className="mt-2 rounded-2xl border border-primary/15 bg-white p-3 shadow-sm">
                <DayPicker
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={{ before: new Date() }}
                  className="mx-auto"
                />
              </div>
            )}
          />
          {form.formState.errors.date?.message && (
            <p className="mt-1 text-sm text-red-600">
              {String(form.formState.errors.date.message)}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Time slot
          </label>
          <select
            {...form.register("time")}
            disabled={slotsLoading || slots.length === 0}
            className={fieldClass(!!form.formState.errors.time)}
          >
            <option value="">
              {slotsLoading
                ? "Loading available times…"
                : slots.length === 0
                  ? "No slots left that day"
                  : "Select a window"}
            </option>
            {slots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {slotsError && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {slotsError}
            </p>
          )}
          {form.formState.errors.time?.message && (
            <p className="mt-1 text-sm text-red-600">
              {String(form.formState.errors.time.message)}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Full name
            </label>
            <input {...form.register("name")} className={fieldClass(!!form.formState.errors.name)} />
            {form.formState.errors.name?.message && (
              <p className="mt-1 text-sm text-red-600">
                {String(form.formState.errors.name.message)}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Email
            </label>
            <input
              type="email"
              {...form.register("email")}
              className={fieldClass(!!form.formState.errors.email)}
            />
            {form.formState.errors.email?.message && (
              <p className="mt-1 text-sm text-red-600">
                {String(form.formState.errors.email.message)}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Phone
          </label>
          <input {...form.register("phone")} className={fieldClass(!!form.formState.errors.phone)} />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Service postcode
          </label>
          <input
            {...form.register("postcode")}
            className={fieldClass(!!form.formState.errors.postcode)}
            placeholder="UK postcode"
            autoComplete="postal-code"
          />
          {form.formState.errors.postcode?.message && (
            <p className="mt-1 text-sm text-red-600">
              {String(form.formState.errors.postcode.message)}
            </p>
          )}
          {serviceArea.status === "checking" && (
            <p className="mt-2 text-sm text-ink/60">Checking coverage…</p>
          )}
          {serviceArea.status === "ok" && (
            <p className="mt-2 text-sm text-primary">
              You&apos;re inside our service area.
            </p>
          )}
          {serviceArea.status === "fail" && (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {serviceArea.message}
            </p>
          )}
          {addressLookup.status === "loading" && (
            <p className="mt-2 text-sm text-ink/60">Finding matching addresses…</p>
          )}
          {addressLookup.error && (
            <p className="mt-2 text-sm text-ink/60">{addressLookup.error}</p>
          )}
          {addressLookup.suggestions.length > 0 && (
            <div className="mt-3 rounded-2xl border border-primary/10 bg-white p-2">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-ink/50">
                Select address
              </p>
              <div className="space-y-1">
                {addressLookup.suggestions.map((line) => (
                  <button
                    key={line}
                    type="button"
                    onClick={() =>
                      form.setValue("address", line, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>
          )}
          {addressLookup.status === "ok" &&
            addressLookup.suggestions.length === 0 &&
            postcodeTrimmed.length >= 5 && (
              <p className="mt-2 text-sm text-ink/60">
                No address suggestions found for this postcode. Please enter your address manually.
              </p>
            )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Service address
          </label>
          <textarea
            rows={3}
            {...form.register("address")}
            className={fieldClass(!!form.formState.errors.address)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Special instructions
          </label>
          <textarea rows={3} {...form.register("notes")} className={fieldClass()} />
        </div>

        {submitError && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          disabled={
            loading ||
            slotsLoading ||
            slots.length === 0 ||
            !postcodeOk
          }
          className="w-full sm:w-auto"
        >
          {loading ? "Redirecting to secure payment…" : "Continue to payment"}
        </Button>
      </div>

      <aside className="h-fit rounded-3xl border border-primary/10 bg-white p-8 shadow-luxury">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Summary
        </p>
        <p className="mt-4 font-display text-2xl text-primary">
          {service ? serviceLabel(service) : "-"}
        </p>
        <p className="mt-2 text-sm text-ink/70">
          {selectedDate
            ? format(selectedDate, "EEEE, d MMMM yyyy")
            : "Pick a date"}
        </p>
        <div className="mt-8 border-t border-primary/10 pt-6">
          <div className="flex justify-between text-sm text-ink/80">
            <span>Service subtotal</span>
            <span>{formatGbpFromPence(pricePence)}</span>
          </div>
          {selectedAddOns.length > 0 && (
            <div className="mt-2 space-y-1">
              {selectedAddOns.map((addOn) => (
                <div key={addOn} className="flex justify-between text-sm text-ink/70">
                  <span>{addOnLabel(addOn)}</span>
                  <span>{formatGbpFromPence(addOnPricePence(addOn))}</span>
                </div>
              ))}
            </div>
          )}
          {discountPence > 0 && (
            <div className="mt-2 flex justify-between text-sm text-primary">
              <span>Discount</span>
              <span>−{formatGbpFromPence(discountPence)}</span>
            </div>
          )}
          <p className="mt-4 text-xs text-ink/50">
            VAT if applicable is included in your quote where required. Final
            charge is confirmed at checkout. Minimum payment after discount is 30p.
          </p>
          <p className="mt-6 font-display text-3xl text-primary">
            {formatGbpFromPence(finalPence)}
          </p>
        </div>
      </aside>
    </form>
  );
}
