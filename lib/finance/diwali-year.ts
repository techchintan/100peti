/**
 * Diwali khatavahi year for Chopda Pujan.
 * A year starts on Diwali (inclusive) and runs up to the next Diwali.
 * The next Diwali opens the new books, so that day belongs to the new year.
 * Example: 12 Nov 2023 → 31 Oct 2024 is Diwali 2023-24.
 */

export type DiwaliYearKey = string;

/** Lakshmi Puja / Diwali dates. Year boundaries for the family red book. */
export const DIWALI_DATES = [
  "2020-11-14",
  "2021-11-04",
  "2022-10-24",
  "2023-11-12",
  "2024-10-31",
  "2025-10-20",
  "2026-11-08",
  "2027-10-29",
  "2028-10-17",
  "2029-11-05",
  "2030-10-26",
  "2031-11-14",
  "2032-11-02",
  "2033-10-22",
  "2034-11-10",
  "2035-10-30",
  "2036-10-19",
  "2037-11-07",
  "2038-10-27",
  "2039-10-17",
  "2040-11-04",
] as const;

const diwaliByYear = new Map<number, string>(
  DIWALI_DATES.map((iso) => [Number(iso.slice(0, 4)), iso]),
);

function toDateKey(dateInput: string | Date): string {
  if (typeof dateInput === "string") {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(dateInput);
    if (match) return match[1];
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function yearKey(startYear: number): DiwaliYearKey {
  const endShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endShort}`;
}

export function getDiwaliYearKey(dateInput: string | Date): DiwaliYearKey {
  const dateKey = toDateKey(dateInput);
  let startYear = Number(DIWALI_DATES[0].slice(0, 4)) - 1;

  for (const diwali of DIWALI_DATES) {
    if (diwali <= dateKey) startYear = Number(diwali.slice(0, 4));
    else break;
  }

  return yearKey(startYear);
}

export function formatDiwaliYearLabel(diwaliKey: DiwaliYearKey): string {
  const [startYear, endShort] = diwaliKey.split("-");
  const startShort = String(Number(startYear) % 100).padStart(2, "0");
  return `Diwali ${startShort}-${endShort}`;
}

/** Diwali that opens this khatavahi year, or null when the start falls before the mapped dates. */
export function getDiwaliYearStartDate(diwaliKey: DiwaliYearKey): string | null {
  const startYear = Number(diwaliKey.split("-")[0]);
  return diwaliByYear.get(startYear) ?? null;
}

/** Next Diwali, which opens the following year. Null when that date is not mapped yet. */
export function getDiwaliYearEndDate(diwaliKey: DiwaliYearKey): string | null {
  const startYear = Number(diwaliKey.split("-")[0]);
  return diwaliByYear.get(startYear + 1) ?? null;
}

function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Human window, e.g. "from 12 Nov 2023 to next Diwali on 31 Oct 2024". */
export function describeDiwaliYearWindow(diwaliKey: DiwaliYearKey): string {
  const start = getDiwaliYearStartDate(diwaliKey);
  const next = getDiwaliYearEndDate(diwaliKey);

  if (start && next) {
    return `from ${formatDisplayDate(start)} to next Diwali on ${formatDisplayDate(next)}`;
  }
  if (start) return `from ${formatDisplayDate(start)} onward`;
  if (next) return `up to Diwali on ${formatDisplayDate(next)}`;
  return "";
}

export function listDiwaliYearKeys(dates: (string | undefined | null)[]): DiwaliYearKey[] {
  const keys = new Set<DiwaliYearKey>();
  for (const date of dates) {
    if (date) keys.add(getDiwaliYearKey(date));
  }
  return [...keys].sort();
}

export function isDateInDiwaliYear(dateInput: string, diwaliKey: DiwaliYearKey): boolean {
  return getDiwaliYearKey(dateInput) === diwaliKey;
}
