import type { BookingRow } from "@/types/booking";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * Fixed daily visit windows. Each label is when the team is at the property
 * (e.g. 08:00–08:30). Only one booking per window per day.
 */

/** Start hour (24h) for each slot: 8am, 11am, 2pm, 5pm. */
export const BOOKING_SLOT_START_HOURS = [8, 11, 14, 17] as const;

/** Length of each visit window shown in the label (minutes). */
export const BOOKING_SLOT_DURATION_MINUTES = 30;

/** On-site window (same as slot duration). */
export const BOOKING_WORK_MINUTES = BOOKING_SLOT_DURATION_MINUTES;

/** Not used in slot labels; kept for API compatibility. */
export const BOOKING_TRAVEL_MINUTES = 0;

/** Total reserved window per slot (for API). */
export const BOOKING_BLOCK_MINUTES = BOOKING_SLOT_DURATION_MINUTES;
/** Minimum lead time required before a slot starts. */
export const BOOKING_MIN_PREP_LEAD_MINUTES = 60;

const PAD = (n: number) => String(n).padStart(2, "0");

function minutesToSlotLabel(startMin: number): string {
  const endMin = startMin + BOOKING_SLOT_DURATION_MINUTES;
  const sh = Math.floor(startMin / 60);
  const sm = startMin % 60;
  const eh = Math.floor(endMin / 60);
  const em = endMin % 60;
  return `${PAD(sh)}:${PAD(sm)} - ${PAD(eh)}:${PAD(em)}`;
}

/** All possible slot labels for a day (before filtering by availability). */
export function generateAllSlotLabels(): string[] {
  return BOOKING_SLOT_START_HOURS.map((h) => minutesToSlotLabel(h * 60));
}

/** First HH:mm in the label (start of the window), for matching bookings. */
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
const KNOWN_SLOT_START_KEYS = new Set(
  BOOKING_SLOT_START_HOURS.map((h) => `${PAD(h)}:00`)
);

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
    if (k) {
      s.add(k);
      continue;
    }

    // Legacy fallback: some historical rows may not store slot labels in `time`.
    // Try deriving start key from booking timestamp in Europe/London.
    const d = new Date(r.date);
    if (!Number.isNaN(d.getTime())) {
      const derived = formatInTimeZone(d, "Europe/London", "HH:mm");
      if (KNOWN_SLOT_START_KEYS.has(derived)) {
        s.add(derived);
      }
    }
  }
  return s;
}

/**
 * Returns true when a slot start datetime has already passed in the given timezone.
 * `ymd` must be in YYYY-MM-DD format and `slotLabel` like "08:00 - 08:30".
 */
export function isSlotStartInPastForYmd(
  ymd: string,
  slotLabel: string,
  timeZone = "Europe/London",
  now = new Date()
): boolean {
  return isSlotStartTooSoonForYmd(ymd, slotLabel, 0, timeZone, now);
}

/** Returns true when a slot starts too soon for the required lead time. */
export function isSlotStartTooSoonForYmd(
  ymd: string,
  slotLabel: string,
  minLeadMinutes: number,
  timeZone = "Europe/London",
  now = new Date()
): boolean {
  const key = parseSlotStartKey(slotLabel);
  if (!key) return true;
  const slotStart = fromZonedTime(`${ymd}T${key}:00`, timeZone);
  const minAllowedMs = slotStart.getTime() - minLeadMinutes * 60 * 1000;
  return now.getTime() >= minAllowedMs;
}
