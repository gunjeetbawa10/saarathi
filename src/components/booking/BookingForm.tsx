"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DayPicker } from "react-day-picker";
import { addDays, format, startOfDay } from "date-fns";
import type { PropertySize, ServiceType } from "@/types/booking";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/validation/booking";
import {
  calculateBookingPricePence,
  formatGbpFromPence,
  serviceLabel,
} from "@/lib/booking-pricing";
import { TIME_SLOTS } from "@/lib/constants";
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
      address: "",
      notes: "",
    },
  });

  const service = form.watch("service");
  const propertySize = form.watch("propertySize");
  const selectedDate = form.watch("date");

  const pricePence = useMemo(
    () => calculateBookingPricePence(service, propertySize),
    [service, propertySize]
  );

  async function onSubmit(values: BookingFormValues) {
    setSubmitError(null);
    setLoading(true);
    try {
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
      setSubmitError("Network error — please try again");
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
          <select {...form.register("time")} className={fieldClass(!!form.formState.errors.time)}>
            <option value="">Select a window</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Redirecting to secure payment…" : "Continue to payment"}
        </Button>
      </div>

      <aside className="h-fit rounded-3xl border border-primary/10 bg-white p-8 shadow-luxury">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Summary
        </p>
        <p className="mt-4 font-display text-2xl text-primary">
          {service ? serviceLabel(service) : "—"}
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
          <p className="mt-4 text-xs text-ink/50">
            VAT if applicable is included in your quote where required. Final
            charge is confirmed at checkout.
          </p>
          <p className="mt-6 font-display text-3xl text-primary">
            {formatGbpFromPence(pricePence)}
          </p>
        </div>
      </aside>
    </form>
  );
}
