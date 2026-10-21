export type TaxBand = { from: number; to: number | null; rate: number; deduction: number };

// Monthly employment-income schedule under Ethiopia's Income Tax Amendment Proclamation No. 1395/2017.
export const ETHIOPIAN_EMPLOYMENT_TAX_BANDS: TaxBand[] = [
  { from: 0, to: 2000, rate: 0, deduction: 0 },
  { from: 2001, to: 4000, rate: 0.15, deduction: 300 },
  { from: 4001, to: 7000, rate: 0.2, deduction: 500 },
  { from: 7001, to: 10000, rate: 0.25, deduction: 850 },
  { from: 10001, to: 14000, rate: 0.3, deduction: 1350 },
  { from: 14001, to: null, rate: 0.35, deduction: 2050 },
];

export function calculateEthiopianEmploymentTax(monthlyIncome: number) {
  const income = Math.max(0, Number.isFinite(monthlyIncome) ? monthlyIncome : 0);
  const band = [...ETHIOPIAN_EMPLOYMENT_TAX_BANDS].reverse().find((item) => income >= item.from) || ETHIOPIAN_EMPLOYMENT_TAX_BANDS[0]!;
  return { tax: Math.max(0, income * band.rate - band.deduction), band };
}

export function calculateEthiopianPayroll(monthlyTaxableIncome: number, pensionableBasic: number, hasPension: boolean) {
  const { tax, band } = calculateEthiopianEmploymentTax(monthlyTaxableIncome);
  const employeePension = hasPension ? Math.max(0, pensionableBasic) * 0.07 : 0;
  const employerPension = hasPension ? Math.max(0, pensionableBasic) * 0.11 : 0;
  return { tax, band, employeePension, employerPension, netPay: Math.max(0, monthlyTaxableIncome - tax - employeePension), employerCost: monthlyTaxableIncome + employerPension };
}
