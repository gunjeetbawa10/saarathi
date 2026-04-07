import { NextResponse } from "next/server";
import { z } from "zod";
import {
  availableSlotLabels,
  BOOKING_BLOCK_MINUTES,
  BOOKING_TRAVEL_MINUTES,
  BOOKING_WORK_MINUTES,
  occupiedSlotStartKeysFromBookings,
} from "@/lib/booking-slots";
import { listBookingsOnLocalCalendarDay } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ date: url.searchParams.get("date") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  try {
    const rows = await listBookingsOnLocalCalendarDay(parsed.data.date);
    const occupied = occupiedSlotStartKeysFromBookings(rows);
    const slots = availableSlotLabels(occupied);
    return NextResponse.json({
      slots,
      blockMinutes: BOOKING_BLOCK_MINUTES,
      workMinutes: BOOKING_WORK_MINUTES,
      travelMinutes: BOOKING_TRAVEL_MINUTES,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not load availability" }, { status: 500 });
  }
}
