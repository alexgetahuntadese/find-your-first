import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calculator, Check, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateEthiopianPayroll, ETHIOPIAN_EMPLOYMENT_TAX_BANDS } from "@/lib/ethiopian-tax";

export const Route = createFileRoute("/ethiopian-tax-calculator")({
  head: () => ({
    meta: [
      { title: "Ethiopian Salary Tax Calculator 2026 — PAYE & Pension | SERATEGNA" },
      { name: "description", content: "Calculate Ethiopian monthly employment income tax, employee pension, net pay, and employer pension using the current amended salary tax bands." },
      { property: "og:title", content: "Ethiopian Salary Tax Calculator | SERATEGNA" },
      { property: "og:description", content: "Estimate Ethiopian PAYE, pension deductions, and take-home pay." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/ethiopian-tax-calculator" }],
  }),
  component: EthiopianTaxCalculator,
});

const money = (value: number) => new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(value);

function EthiopianTaxCalculator() {
  const [income, setIncome] = useState("15000");
  const [basic, setBasic] = useState("15000");
  const [hasPension, setHasPension] = useState(true);
  const payroll = useMemo(() => calculateEthiopianPayroll(Number(income), Number(basic), hasPension), [income, basic, hasPension]);

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to SERATEGNA</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_330px]">
          <section>
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary"><Calculator className="h-5 w-5 text-primary-foreground" /></span><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ethiopian salary tax calculator</h1><p className="mt-1 text-sm text-muted-foreground">Estimate monthly employment income tax, pension, and take-home pay in Ethiopian birr.</p></div></div>
            <div className="mt-6 rounded-2xl border bg-card p-5 shadow-glow sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Monthly taxable employment income (ETB)<input type="number" min="0" step="0.01" value={income} onChange={(e) => setIncome(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-3 text-lg outline-none focus:ring-2 focus:ring-ring" /></label><label className="text-sm font-medium">Pensionable basic salary (ETB)<input type="number" min="0" step="0.01" value={basic} onChange={(e) => setBasic(e.target.value)} disabled={!hasPension} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-3 text-lg outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" /></label></div>
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={hasPension} onChange={(e) => setHasPension(e.target.checked)} className="h-4 w-4 accent-primary" />Include 7% employee and 11% employer pension contributions</label>
              <div className="mt-6 grid gap-3 sm:grid-cols-2"><Result label="Income tax this month" value={money(payroll.tax)} highlight /><Result label="Estimated take-home" value={money(payroll.netPay)} highlight /><Result label="Employee pension (7%)" value={money(payroll.employeePension)} /><Result label="Employer pension (11%)" value={money(payroll.employerPension)} /><Result label="Annual income tax × 12" value={money(payroll.tax * 12)} /><Result label="Employer monthly cost" value={money(payroll.employerCost)} /></div>
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Applied band</p><p className="mt-1 text-lg font-semibold">{payroll.band.rate * 100}% marginal rate</p><p className="mt-1 text-sm text-muted-foreground">Formula: monthly income × {payroll.band.rate * 100}% − {money(payroll.band.deduction)} deduction.</p></div>
            </div>
          </section>
          <aside className="space-y-4"><div className="rounded-2xl border bg-card p-5"><h2 className="font-semibold">Current monthly bands</h2><div className="mt-4 space-y-2">{ETHIOPIAN_EMPLOYMENT_TAX_BANDS.map((band) => <div key={band.from} className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{money(band.from)}{band.to ? `–${money(band.to)}` : "+"}</span><span className="font-medium">{band.rate * 100}%</span></div>)}</div></div><div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><div className="flex gap-2"><ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" /><p className="text-xs leading-5 text-muted-foreground">This is an estimate for ordinary monthly employment income. Allowances, benefits, bonuses, foreign income, exemptions, special pension schemes, and regional payroll practices can change the result.</p></div></div></aside>
        </div>
        <section className="mt-8 grid gap-4 sm:grid-cols-2"><InfoCard title="How Ethiopian PAYE is calculated" text="Employment income tax is calculated monthly using the applicable progressive band. The 2025 amendment raised the tax-free monthly threshold to ETB 2,000 and applies 15%, 20%, 25%, 30%, and 35% marginal bands above it." /><InfoCard title="Pension assumptions" text="When enabled, the calculator shows a 7% employee pension deduction and an 11% employer contribution on the pensionable basic salary. Your payslip or payroll office remains the source of truth for special schemes." /></section>
        <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" /> Based on Ethiopia Income Tax Amendment Proclamation No. 1395/2017 · <a className="underline underline-offset-4 hover:text-foreground" href="https://justice.gov.et/en/law/%E1%8B%A8%E1%8D%8C%E1%8B%B4%E1%88%AB%E1%88%8D-%E1%8B%A8%E1%8C%8D%E1%89%A5%E1%88%AD-%E1%89%B3%E1%8A%AD%E1%88%B5-%E1%8A%A0%E1%8B%8B%E1%8C%85-%E1%8A%95%E1%8B%B0%E1%8B%AB%E1%88%BB%E1%88%BB%E1%88%8D-%E1%8B%A8%E1%8B%88%E1%8C%A3-%E1%8A%A0%E1%8B%8B%E1%8C%85-%E1%89%81%E1%8C%A5%E1%88%AD-1395-2017/" target="_blank" rel="noreferrer">official law reference</a></p>
      </div>
    </main>
  );
}

function Result({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div className={`rounded-xl border p-4 ${highlight ? "border-primary/30 bg-primary/5" : ""}`}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
function InfoCard({ title, text }: { title: string; text: string }) { return <article className="rounded-xl border bg-card p-5"><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>; }
