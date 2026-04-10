import type { BookingRow } from "@/types/booking";

/**
 * Each visit reserves a fixed block: work time + travel to the next job.
 * Slots are spaced by the full block so the next start is never 30 minutes later
 * (e.g. after 11:00 the next offered start is 13:00, not 11:30).
 */

export const BOOKING_WORK_MINUTES = 90;
export const BOOKING_TRAVEL_MINUTES = 30;
export const BOOKING_BLOCK_MINUTES = BOOKING_WORK_MINUTES + BOOKING_TRAVEL_MINUTES; // 120

/** First slot start (24h). */
export const BOOKING_DAY_START_HOUR = 8;
/** Last slot must end by this hour (24h). */
export const BOOKING_DAY_END_HOUR = 18;

const PAD = (n: number) => String(n).padStart(2, "0");

function minutesToLabel(startMin: number): string {
  const endMin = startMin + BOOKING_BLOCK_MINUTES;
  const sh = Math.floor(startMin / 60);
  const sm = startMin % 60;
  const eh = Math.floor(endMin / 60);
  const em = endMin % 60;
  return `${PAD(sh)}:${PAD(sm)} – ${PAD(eh)}:${PAD(em)}`;
}

/** All possible slot labels for a day (before filtering by availability). */
export function generateAllSlotLabels(): string[] {
  const slots: string[] = [];
  let startMin = BOOKING_DAY_START_HOUR * 60;
  const lastStart = BOOKING_DAY_END_HOUR * 60 - BOOKING_BLOCK_MINUTES;
  while (startMin <= lastStart) {
    slots.push(minutesToLabel(startMin));
    startMin += BOOKING_BLOCK_MINUTES;
  }
  return slots;
}

/** First HH:mm in the label (start of the block), for matching bookings. */
export function parseSlotStartKey(time: string): string | null {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number.parseInt(m[1], 10);
  const min = Number.parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(min) || h > 23 || min > 59) return null;
  return `${PAD(h)}:${PAD(min)}`;
}

const ALL_LABELS = generateAllSlotLabels();
const ALL_LABEL_SET = new Set(ALL_LABELS);

export function isKnownSlotLabel(time: string): boolean {
  return ALL_LABEL_SET.has(time.trim());
}

export function availableSlotLabels(occupiedStartKeys: Set<string>): string[] {
  return ALL_LABELS.filter((label) => {
    const key = parseSlotStartKey(label);
    return key && !occupiedStartKeys.has(key);
  });
}

/** Start keys (HH:mm) already taken for that day (pending and paid bookings). */
export function occupiedSlotStartKeysFromBookings(rows: BookingRow[]): Set<string> {
  const s = new Set<string>();
  for (const r of rows) {
    const k = parseSlotStartKey(r.time);
    if (k) s.add(k);
  }
  return s;
}
