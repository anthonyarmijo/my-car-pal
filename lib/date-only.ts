const UTC_DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function buildDateOnlyInput(year: number, month: number, day: number): string {
  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

export function formatDateOnlyForInput(date: Date | null): string {
  if (!date) {
    return "";
  }

  return buildDateOnlyInput(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function formatLocalDateForInput(date: Date): string {
  return buildDateOnlyInput(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function formatDateOnlyLabel(date: Date | null, fallback = "Not set"): string {
  if (!date) {
    return fallback;
  }

  return UTC_DATE_LABEL_FORMATTER.format(date);
}

export function parseDateOnly(raw: string): Date | null {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("Date is invalid.");
  }

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);

  const parsed = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("Date is invalid.");
  }

  return parsed;
}

export function parseRequiredDateOnly(raw: string, fieldName: string): Date {
  const parsed = parseDateOnly(raw);
  if (!parsed) {
    throw new Error(`${fieldName} is required.`);
  }

  return parsed;
}

export function getDateOnlySortValue(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function isDateOnlyOnOrBefore(left: Date, right: Date): boolean {
  return getDateOnlySortValue(left) <= getDateOnlySortValue(right);
}
