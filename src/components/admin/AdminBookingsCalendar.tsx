"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DayPicker } from "react-day-picker";
import { parseSlotStartKey } from "@/lib/booking-slots";

const BOOKING_TZ = "Europe/London";

export type AdminCalendarBooking = {
  id: string;
  name: string;
  time: string;
  dateIso: string;
  paymentStatus: string;
};

function keyFromDate(date: Date): string {
  return formatInTimeZone(date, BOOKING_TZ, "yyyy-MM-dd");
}

function dateFromKey(dayKey: string): Date {
  return new Date(`${dayKey}T12:00:00.000Z`);
}

function paymentBadgeClass(status: string) {
  if (status === "paid") return "bg-primary/10 text-primary";
  if (status === "failed") return "bg-red-100 text-red-900";
  return "bg-amber-100 text-amber-900";
}

export function AdminBookingsCalendar({
  bookings,
}: {
  bookings: AdminCalendarBooking[];
}) {
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, AdminCalendarBooking[]>();
    for (const booking of bookings) {
      const key = keyFromDate(new Date(booking.dateIso));
      const dayBookings = map.get(key) ?? [];
      dayBookings.push(booking);
      map.set(key, dayBookings);
    }
    for (const [day, dayBookings] of Array.from(map.entries())) {
      dayBookings.sort((a, b) => {
        const ak = parseSlotStartKey(a.time) ?? a.time;
        const bk = parseSlotStartKey(b.time) ?? b.time;
        return ak.localeCompare(bk);
      });
      map.set(day, dayBookings);
    }
    return map;
  }, [bookings]);

  const allKeys = useMemo(
    () => Array.from(bookingsByDay.keys()).sort((a, b) => a.localeCompare(b)),
    [bookingsByDay]
  );
  const todayKey = keyFromDate(new Date());
  const [selectedKey, setSelectedKey] = useState<string>(
    bookingsByDay.has(todayKey) ? todayKey : (allKeys[0] ?? todayKey)
  );

  const selectedDate = useMemo(() => dateFromKey(selectedKey), [selectedKey]);
  const selectedBookings = bookingsByDay.get(selectedKey) ?? [];

  return (
    <section className="mt-8 grid gap-6 rounded-3xl border border-primary/10 bg-white p-5 shadow-card lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-primary/10 bg-cream/50 p-3">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;
            setSelectedKey(keyFromDate(date));
          }}
          modifiers={{
            hasBookings: (date) => bookingsByDay.has(keyFromDate(date)),
          }}
          modifiersClassNames={{
            hasBookings: "font-bold text-primary underline underline-offset-4",
          }}
          className="mx-auto"
        />
      </div>

      <div>
        <h2 className="font-display text-xl text-primary">Bookings on {format(selectedDate, "dd MMM yyyy")}</h2>
        <p className="mt-1 text-sm text-ink/60">
          {selectedBookings.length > 0
            ? `${selectedBookings.length} booking${selectedBookings.length > 1 ? "s" : ""} scheduled`
            : "No bookings scheduled on this day."}
        </p>

        <div className="mt-4 space-y-3">
          {selectedBookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/admin/bookings/${booking.id}`}
              className="flex items-center justify-between rounded-2xl border border-primary/10 px-4 py-3 transition hover:bg-cream/70"
            >
              <div>
                <p className="text-sm font-semibold text-primary">{booking.time}</p>
                <p className="text-sm text-ink">{booking.name}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paymentBadgeClass(booking.paymentStatus)}`}
              >
                {booking.paymentStatus}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
