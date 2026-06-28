/** Indian financial year: 1 Apr – 31 Mar. Keys like `2025-26`. */

export type FinancialYearKey = string;

export function getFinancialYearKey(dateInput: string | Date): FinancialYearKey {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const endShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endShort}`;
}

export function formatFinancialYearLabel(fyKey: FinancialYearKey): string {
  const [startYear, endShort] = fyKey.split("-");
  const startShort = String(Number(startYear) % 100).padStart(2, "0");
  return `FY ${startShort}-${endShort}`;
}

export function getFinancialYearStartDate(fyKey: FinancialYearKey): string {
  const startYear = Number(fyKey.split("-")[0]);
  return `${startYear}-04-01`;
}

export function getFinancialYearEndDate(fyKey: FinancialYearKey): string {
  const startYear = Number(fyKey.split("-")[0]);
  return `${startYear + 1}-03-31`;
}

export function listFinancialYearKeys(dates: (string | undefined | null)[]): FinancialYearKey[] {
  const keys = new Set<FinancialYearKey>();
  for (const date of dates) {
    if (date) keys.add(getFinancialYearKey(date));
  }
  return [...keys].sort();
}

export function isDateInFinancialYear(dateInput: string, fyKey: FinancialYearKey): boolean {
  return getFinancialYearKey(dateInput) === fyKey;
}
