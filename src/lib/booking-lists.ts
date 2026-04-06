import { isBefore, startOfDay } from "date-fns";
import type { Booking } from "@/types/booking";

/** Split into upcoming (today or later) and past, with sensible sort orders. */
export function partitionUpcomingAndPast(bookings: Booking[]): {
  upcoming: Booking[];
  past: Booking[];
} {
  const todayStart = startOfDay(new Date());
  const upcoming: Booking[] = [];
  const past: Booking[] = [];

  for (const b of bookings) {
    if (isBefore(b.date, todayStart)) {
      past.push(b);
    } else {
      upcoming.push(b);
    }
  }

  upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
  past.sort((a, b) => b.date.getTime() - a.date.getTime());

  return { upcoming, past };
}
