import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, ArrowRightLeft } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
  ETHIOPIAN_MONTHS,
  GREGORIAN_MONTHS,
  ethiopianToGregorian,
  formatDate,
  gregorianToEthiopian,
} from "@/lib/calendar";

export const Route = createFileRoute("/calendar")({ component: CalendarConverter });

function CalendarConverter() {
  const today = new Date();
  const initialEthiopian = gregorianToEthiopian({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() });
  const [direction, setDirection] = useState<"ethiopian" | "gregorian">("ethiopian");
  const [year, setYear] = useState(String(initialEthiopian.year));
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [result, setResult] = useState(() => ethiopianToGregorian(initialEthiopian));

  const isEthiopian = direction === "ethiopian";
  const monthNames = isEthiopian ? ETHIOPIAN_MONTHS : GREGORIAN_MONTHS;
  const maxMonth = isEthiopian ? 13 : 12;
  const helper = useMemo(() => isEthiopian ? "Ethiopian dates have 13 months: 12 months of 30 days and Pagumen." : "Enter a Gregorian date to find its Ethiopian calendar date.", [isEthiopian]);

  const convert = (event: FormEvent) => {
    event.preventDefault();
    const date = { year: Number(year), month: Number(month), day: Number(day) };
    if (!date.year || !date.month || !date.day) return;
    setResult(isEthiopian ? ethiopianToGregorian(date) : gregorianToEthiopian(date));
  };

  const swap = () => {
    const nextDirection = isEthiopian ? "gregorian" : "ethiopian";
    const nextDate = result;
    const converted = isEthiopian ? gregorianToEthiopian(nextDate) : ethiopianToGregorian(nextDate);
    setDirection(nextDirection);
    setYear(String(converted.year));
    setMonth(String(converted.month));
    setDay(String(converted.day));
    setResult(converted);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-glow sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary"><CalendarDays className="h-5 w-5 text-primary-foreground" /></span>
            <div><p className="font-semibold">Ethiopian calendar converter</p><p className="mt-1 text-sm text-muted-foreground">Convert dates between the Ethiopian and Gregorian calendars.</p></div>
          </div>
          <div className="mt-6 flex rounded-xl border bg-background p-1">
            <button type="button" onClick={() => setDirection("ethiopian")} className={`flex-1 rounded-lg px-3 py-2 text-sm ${isEthiopian ? "bg-secondary font-medium" : "text-muted-foreground"}`}>Ethiopian → Gregorian</button>
            <button type="button" onClick={() => setDirection("gregorian")} className={`flex-1 rounded-lg px-3 py-2 text-sm ${!isEthiopian ? "bg-secondary font-medium" : "text-muted-foreground"}`}>Gregorian → Ethiopian</button>
          </div>
          <form onSubmit={convert} className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <label className="text-sm">Year<input required type="number" min={1} value={year} onChange={(e) => setYear(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
            <label className="text-sm">Month<select value={month} onChange={(e) => setMonth(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring">{Array.from({ length: maxMonth }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} — {monthNames[index]}</option>)}</select></label>
            <label className="text-sm">Day<input required type="number" min={1} max={isEthiopian ? 30 : 31} value={day} onChange={(e) => setDay(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
            <button className="rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Convert</button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Converted date</p>
            <p className="mt-2 text-2xl font-semibold">{formatDate(result, isEthiopian ? GREGORIAN_MONTHS : ETHIOPIAN_MONTHS)}</p>
            <button type="button" onClick={swap} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-secondary"><ArrowRightLeft className="h-4 w-4" /> Use this date in reverse</button>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">SERATEGNA calendar tools are provided for everyday planning.</p>
        </section>
      </div>
    </main>
  );
}
