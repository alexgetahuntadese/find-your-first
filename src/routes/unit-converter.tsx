import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRightLeft, Calculator, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { UNIT_CATEGORIES, convertUnit, type UnitCategory } from "@/lib/units";

export const Route = createFileRoute("/unit-converter")({
  head: () => ({
    meta: [
      { title: "Free Unit Converter — Length, Weight, Temperature & More | SERATEGNA" },
      { name: "description", content: "Convert length, area, weight, temperature, volume, speed, time, data, pressure, energy, power, force, and angle instantly with SERATEGNA's free unit converter." },
      { property: "og:title", content: "Free Unit Converter | SERATEGNA" },
      { property: "og:description", content: "Fast, free online conversions for everyday units." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/unit-converter" }],
  }),
  component: UnitConverter,
});

function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [value, setValue] = useState("1");
  const [fromIndex, setFromIndex] = useState(2);
  const [toIndex, setToIndex] = useState(3);
  const config = UNIT_CATEGORIES[category];
  const from = config.units[fromIndex] ?? config.units[0]!;
  const to = config.units[toIndex] ?? config.units[1] ?? config.units[0]!;
  const result = useMemo(() => {
    const number = Number(value);
    return Number.isFinite(number) ? convertUnit(category, number, from, to) : 0;
  }, [category, value, from, to]);

  const changeCategory = (next: UnitCategory) => {
    setCategory(next);
    setFromIndex(0);
    setToIndex(1);
  };

  const swap = () => {
    setFromIndex(toIndex);
    setToIndex(fromIndex);
    setValue(String(result));
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to SERATEGNA</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="rounded-2xl border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversion tools</p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">{Object.entries(UNIT_CATEGORIES).map(([key, item]) => <button key={key} type="button" onClick={() => changeCategory(key as UnitCategory)} className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${category === key ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>{item.label}</button>)}</div>
          </aside>
          <section>
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary"><Calculator className="h-5 w-5 text-primary-foreground" /></span><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Free {config.label.toLowerCase()} converter</h1><p className="mt-1 text-sm text-muted-foreground">{config.description}</p></div></div>
            <div className="mt-6 rounded-2xl border bg-card p-5 shadow-glow sm:p-7">
              <label className="text-sm font-medium">Value<input type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-3 text-lg outline-none focus:ring-2 focus:ring-ring" /></label>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end"><label className="text-sm">From<select value={fromIndex} onChange={(e) => setFromIndex(Number(e.target.value))} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring">{config.units.map((unit, index) => <option key={unit.symbol} value={index}>{unit.label} ({unit.symbol})</option>)}</select></label><button type="button" onClick={swap} aria-label="Swap units" className="grid h-11 w-11 place-items-center rounded-lg border hover:bg-secondary"><ArrowRightLeft className="h-4 w-4" /></button><label className="text-sm">To<select value={toIndex} onChange={(e) => setToIndex(Number(e.target.value))} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring">{config.units.map((unit, index) => <option key={unit.symbol} value={index}>{unit.label} ({unit.symbol})</option>)}</select></label></div>
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Result</p><p className="mt-2 break-words text-3xl font-semibold">{Number(result.toPrecision(12))} <span className="text-lg text-muted-foreground">{to.symbol}</span></p><p className="mt-1 text-sm text-muted-foreground">{value || "0"} {from.symbol} = {Number(result.toPrecision(12))} {to.symbol}</p></div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2"><InfoCard title={`How to convert ${config.label.toLowerCase()}`} text={`Choose the units you want to convert from and to, enter a value, and SERATEGNA calculates the result instantly.`} /><InfoCard title="Accurate and easy to use" text="The converter works in your browser and supports common metric, imperial, and everyday units." /></div>
            <section className="mt-8 rounded-2xl border bg-card p-6"><h2 className="text-lg font-semibold">Popular {config.label.toLowerCase()} conversions</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{config.units.slice(0, 6).map((unit) => <p key={unit.symbol} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" />{unit.label} ({unit.symbol})</p>)}</div></section>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) { return <article className="rounded-xl border bg-card p-5"><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>; }
