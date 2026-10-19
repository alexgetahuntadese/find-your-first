import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRightLeft, Coins, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/currency-converter")({
  head: () => ({
    meta: [
      { title: "Currency Converter — ETB, USD, EUR & More | SERATEGNA" },
      { name: "description", content: "Convert Ethiopian birr, US dollars, euros, pounds, Kenyan shillings, and other currencies using live daily reference exchange rates." },
      { property: "og:title", content: "Live Currency Converter | SERATEGNA" },
      { property: "og:description", content: "Convert ETB and major world currencies with current daily reference rates." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://find-your-first-x5un-8ylvz7cqb.vercel.app/currency-converter" }],
  }),
  component: CurrencyConverter,
});

const CURRENCIES = [
  ["ETB", "Ethiopian birr"], ["USD", "US dollar"], ["EUR", "Euro"], ["GBP", "British pound"],
  ["KES", "Kenyan shilling"], ["AED", "UAE dirham"], ["SAR", "Saudi riyal"], ["ZAR", "South African rand"],
  ["UGX", "Ugandan shilling"], ["TZS", "Tanzanian shilling"], ["INR", "Indian rupee"], ["CNY", "Chinese yuan"],
  ["JPY", "Japanese yen"], ["CAD", "Canadian dollar"], ["AUD", "Australian dollar"], ["CHF", "Swiss franc"],
] as const;

function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("ETB");
  const [rate, setRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const number = Number(amount) || 0;
  const result = useMemo(() => rate === null ? 0 : number * rate, [number, rate]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (from === to) { setLoading(false); setRate(1); setRateDate(new Date().toISOString().slice(0, 10)); setError(""); return; }
      try {
        setLoading(true); setError("");
        const response = await fetch(`https://api.frankfurter.dev/v2/rate/${from.toLowerCase()}/${to.toLowerCase()}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Rate unavailable");
        const data = await response.json() as { rate?: number; date?: string };
        if (!data.rate) throw new Error("Rate unavailable");
        setRate(data.rate); setRateDate(data.date || "");
      } catch (requestError) { if ((requestError as Error).name !== "AbortError") { setError("Could not load the exchange rate. Try again."); setRate(null); } }
      finally { setLoading(false); }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [from, to]);

  const swap = () => { setFrom(to); setTo(from); };
  const currencyName = (code: string) => CURRENCIES.find(([item]) => item === code)?.[1] || code;

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to SERATEGNA</Link>
        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-glow sm:p-8">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary"><Coins className="h-5 w-5 text-primary-foreground" /></span><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Live currency converter</h1><p className="mt-1 text-sm text-muted-foreground">Convert Ethiopian birr and major global currencies using daily reference rates.</p></div></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-sm font-medium">Amount<input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-3 text-lg outline-none focus:ring-2 focus:ring-ring" /></label><label className="text-sm font-medium">From<select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring">{CURRENCIES.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label><button type="button" onClick={swap} aria-label="Swap currencies" className="grid h-11 w-11 place-items-center rounded-lg border hover:bg-secondary"><ArrowRightLeft className="h-4 w-4" /></button></div>
          <label className="mt-4 block text-sm font-medium">To<select value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring">{CURRENCIES.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
          <div className="mt-7 rounded-xl border border-primary/20 bg-primary/5 p-5"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Converted amount</p>{loading ? <p className="mt-2 flex items-center gap-2 text-xl font-semibold"><RefreshCw className="h-4 w-4 animate-spin" /> Loading rate…</p> : error ? <p className="mt-2 text-sm text-destructive">{error}</p> : <><p className="mt-2 break-words text-3xl font-semibold">{new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(result)} {to}</p><p className="mt-1 text-sm text-muted-foreground">{amount || "0"} {from} = {new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(result)} {to}</p></>}</div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>1 {from} = {rate ? `${rate} ${to}` : "—"}</span><span>{rateDate ? `Rate date: ${rateDate}` : ""}</span></div>
        </section>
        <section className="mt-8 grid gap-4 sm:grid-cols-2"><InfoCard title="ETB currency conversion" text={`Convert between Ethiopian birr (ETB), ${currencyName(from)}, and ${currencyName(to)} in seconds. Rates are reference rates and may differ from bank, cash, remittance, or card rates.`} /><InfoCard title="Use the latest rate" text="Rates are fetched from a daily reference-rate service when the currency pair changes. Always confirm the final rate and fees with your bank or provider before sending money." /></section>
        <p className="mt-6 text-center text-xs text-muted-foreground">Reference rates provided by <a className="underline underline-offset-4 hover:text-foreground" href="https://frankfurter.dev/" target="_blank" rel="noreferrer">Frankfurter</a>. This tool is informational, not financial advice.</p>
      </div>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) { return <article className="rounded-xl border bg-card p-5"><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>; }
