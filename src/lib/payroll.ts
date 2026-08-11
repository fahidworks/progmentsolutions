export type Money = number;

/** Configurable statutory rules — no hard-coded assumptions in the engine. */
export type StatutoryRules = {
  pfRateOnBasic: number;
  professionalTaxMonthly: number;
  tdsRateOnGross: number;
};

export const defaultStatutoryRules: StatutoryRules = {
  pfRateOnBasic: 0.12,
  professionalTaxMonthly: 200,
  tdsRateOnGross: 0.05,
};

export type EarningsInput = {
  basic_salary: Money;
  hra: Money;
  special_allowance: Money;
  conveyance_allowance: Money;
  medical_allowance: Money;
  other_allowances: Money;
};

export type DeductionsInput = {
  pf: Money;
  professional_tax: Money;
  tds: Money;
  other_deductions: Money;
};

export type PayrollComputation = {
  earnings: { name: string; amount: Money }[];
  deductions: { name: string; amount: Money }[];
  gross: Money;
  totalDeductions: Money;
  net: Money;
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

export function computePayroll(
  e: EarningsInput,
  d: DeductionsInput,
  extras: { bonus?: Money; incentives?: Money; loanDeduction?: Money; leaveDeduction?: Money } = {},
): PayrollComputation {
  const earnings = [
    { name: "Basic Salary", amount: r2(e.basic_salary) },
    { name: "House Rent Allowance", amount: r2(e.hra) },
    { name: "Special Allowance", amount: r2(e.special_allowance) },
    { name: "Conveyance Allowance", amount: r2(e.conveyance_allowance) },
    { name: "Medical Allowance", amount: r2(e.medical_allowance) },
    { name: "Other Allowances", amount: r2(e.other_allowances) },
    { name: "Bonus", amount: r2(extras.bonus ?? 0) },
    { name: "Incentives", amount: r2(extras.incentives ?? 0) },
  ].filter((x) => x.amount > 0);

  const deductions = [
    { name: "Provident Fund", amount: r2(d.pf) },
    { name: "Professional Tax", amount: r2(d.professional_tax) },
    { name: "Income Tax (TDS)", amount: r2(d.tds) },
    { name: "Loan Deduction", amount: r2(extras.loanDeduction ?? 0) },
    { name: "Leave Deduction", amount: r2(extras.leaveDeduction ?? 0) },
    { name: "Other Deductions", amount: r2(d.other_deductions) },
  ].filter((x) => x.amount > 0);

  const gross = r2(earnings.reduce((s, x) => s + x.amount, 0));
  const totalDeductions = r2(deductions.reduce((s, x) => s + x.amount, 0));
  return { earnings, deductions, gross, totalDeductions, net: r2(gross - totalDeductions) };
}

export function suggestDeductions(e: EarningsInput, rules: StatutoryRules = defaultStatutoryRules): DeductionsInput {
  const gross =
    Number(e.basic_salary) + Number(e.hra) + Number(e.special_allowance) +
    Number(e.conveyance_allowance) + Number(e.medical_allowance) + Number(e.other_allowances);
  return {
    pf: r2(Number(e.basic_salary) * rules.pfRateOnBasic),
    professional_tax: rules.professionalTaxMonthly,
    tds: r2(gross * rules.tdsRateOnGross),
    other_deductions: 0,
  };
}

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function amountInWords(num: number): string {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const two = (n: number): string => (n < 20 ? a[n]! : `${b[Math.floor(n / 10)]}${n % 10 ? " " + a[n % 10] : ""}`);
  const three = (n: number): string => (n >= 100 ? `${a[Math.floor(n / 100)]} Hundred${n % 100 ? " " + two(n % 100) : ""}` : two(n));
  let n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "Zero Rupees Only";
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) parts.push(`${three(crore)} Crore`);
  if (lakh) parts.push(`${three(lakh)} Lakh`);
  if (thousand) parts.push(`${three(thousand)} Thousand`);
  if (n) parts.push(three(n));
  return `${parts.join(" ")} Rupees Only`;
}
