const ETHIOPIAN_EPOCH = 1724221;

export type CalendarDate = { year: number; month: number; day: number };

function floor(value: number) {
  return Math.floor(value);
}

function gregorianToJdn({ year, month, day }: CalendarDate) {
  const a = floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + floor((153 * m + 2) / 5) + 365 * y + floor(y / 4) - floor(y / 100) + floor(y / 400) - 32045;
}

function jdnToGregorian(jdn: number): CalendarDate {
  const a = jdn + 32044;
  const b = floor((4 * a + 3) / 146097);
  const c = a - floor((146097 * b) / 4);
  const d = floor((4 * c + 3) / 1461);
  const e = c - floor((1461 * d) / 4);
  const m = floor((5 * e + 2) / 153);
  return {
    year: 100 * b + d - 4800 + floor(m / 10),
    month: m + 3 - 12 * floor(m / 10),
    day: e - floor((153 * m + 2) / 5) + 1,
  };
}

export function ethiopianToGregorian(date: CalendarDate): CalendarDate {
  const jdn = ETHIOPIAN_EPOCH + 365 * (date.year - 1) + floor(date.year / 4) + 30 * (date.month - 1) + date.day - 1;
  return jdnToGregorian(jdn);
}

export function gregorianToEthiopian(date: CalendarDate): CalendarDate {
  const jdn = gregorianToJdn(date);
  const year = floor((4 * (jdn - ETHIOPIAN_EPOCH) + 1463) / 1461);
  const newYear = ETHIOPIAN_EPOCH + 365 * (year - 1) + floor(year / 4);
  const month = floor((jdn - newYear) / 30) + 1;
  const day = jdn - newYear - 30 * (month - 1) + 1;
  return { year, month, day };
}

export const ETHIOPIAN_MONTHS = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagumen",
];

export const GREGORIAN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(date: CalendarDate, months: string[]) {
  return `${months[date.month - 1]} ${date.day}, ${date.year}`;
}
