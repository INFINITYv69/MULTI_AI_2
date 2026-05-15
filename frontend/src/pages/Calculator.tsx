import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator, TrendingUp, Home, CreditCard, PiggyBank, RefreshCw, ChevronDown
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

function calcEMI(principal: number, annualRate: number, months: number) {
  if (!months || !annualRate) return principal / (months || 1);
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function calcSIP(monthly: number, annualRate: number, years: number) {
  const n = years * 12;
  const r = annualRate / 12 / 100;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

function calcFD(principal: number, annualRate: number, years: number) {
  const r = annualRate / 100;
  const n = years;
  return principal * Math.pow(1 + r / 4, 4 * n); // quarterly compounding
}

// ── tab config ───────────────────────────────────────────────────────────────
const tabs = [
  { id: "emi",   label: "EMI",            icon: <Home      className="w-4 h-4" /> },
  { id: "sip",   label: "SIP Returns",    icon: <TrendingUp className="w-4 h-4" /> },
  { id: "fd",    label: "FD Maturity",    icon: <PiggyBank  className="w-4 h-4" /> },
  { id: "loan",  label: "Loan Eligibility", icon: <CreditCard className="w-4 h-4" /> },
];

// ── slider input ─────────────────────────────────────────────────────────────
function SliderInput({
  label, value, onChange, min, max, step = 1, prefix = "", suffix = "",
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; prefix?: string; suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <span className="font-mono font-bold text-primary text-sm">
          {prefix}{value.toLocaleString("en-IN")}{suffix}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg shadow-primary/40 pointer-events-none"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── result bar ───────────────────────────────────────────────────────────────
function ResultBar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// ── EMI CALCULATOR ────────────────────────────────────────────────────────────
function EMICalc() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate]           = useState(8.5);
  const [months, setMonths]       = useState(60);

  const emi       = calcEMI(principal, rate, months);
  const total     = emi * months;
  const interest  = total - principal;
  const intPct    = (interest / total) * 100;
  const prinPct   = (principal / total) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <SliderInput label="Loan Amount"     value={principal} onChange={setPrincipal} min={10000}  max={10000000} step={10000}  prefix="₹" />
        <SliderInput label="Annual Interest" value={rate}      onChange={setRate}      min={1}     max={30}       step={0.1}   suffix="%" />
        <SliderInput label="Tenure"          value={months}    onChange={setMonths}    min={6}     max={360}                  suffix=" mo" />
      </div>

      <div className="glass-card p-6 space-y-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monthly EMI</p>
        <p className="text-4xl font-black gradient-text font-mono">{fmt(emi)}</p>
        <div className="space-y-4 mt-2">
          <ResultBar label="Principal"       value={fmt(principal)} pct={prinPct} color="bg-primary" />
          <ResultBar label="Total Interest"  value={fmt(interest)}  pct={intPct}  color="bg-accent"  />
          <ResultBar label="Total Payable"   value={fmt(total)}     pct={100}     color="bg-white/20" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          *Interest calculated using reducing balance method.
        </p>
      </div>
    </div>
  );
}

// ── SIP CALCULATOR ────────────────────────────────────────────────────────────
function SIPCalc() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate]       = useState(12);
  const [years, setYears]     = useState(10);

  const corpus    = calcSIP(monthly, rate, years);
  const invested  = monthly * years * 12;
  const gains     = corpus - invested;
  const gainPct   = (gains / corpus) * 100;
  const invPct    = (invested / corpus) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <SliderInput label="Monthly SIP"    value={monthly} onChange={setMonthly} min={500}   max={200000} step={500}  prefix="₹" />
        <SliderInput label="Expected CAGR"  value={rate}    onChange={setRate}    min={1}     max={30}     step={0.5}  suffix="%" />
        <SliderInput label="Investment Period" value={years} onChange={setYears}  min={1}     max={40}                suffix=" yrs" />
      </div>

      <div className="glass-card p-6 space-y-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estimated Corpus</p>
        <p className="text-4xl font-black gradient-text font-mono">{fmt(corpus)}</p>
        <div className="space-y-4 mt-2">
          <ResultBar label="Invested"    value={fmt(invested)} pct={invPct}  color="bg-primary" />
          <ResultBar label="Est. Gains"  value={fmt(gains)}    pct={gainPct} color="bg-emerald-400" />
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-400 font-medium">
            📈 Wealth multiplier: {(corpus / invested).toFixed(2)}x on your invested capital
          </p>
        </div>
      </div>
    </div>
  );
}

// ── FD CALCULATOR ─────────────────────────────────────────────────────────────
function FDCalc() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate]           = useState(7);
  const [years, setYears]         = useState(5);

  const maturity   = calcFD(principal, rate, years);
  const gains      = maturity - principal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <SliderInput label="Deposit Amount"  value={principal} onChange={setPrincipal} min={1000}  max={5000000} step={1000}  prefix="₹" />
        <SliderInput label="Interest Rate"   value={rate}      onChange={setRate}      min={1}     max={15}      step={0.25}  suffix="%" />
        <SliderInput label="Tenure"          value={years}     onChange={setYears}     min={1}     max={10}                  suffix=" yrs" />
      </div>

      <div className="glass-card p-6 space-y-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Maturity Value</p>
        <p className="text-4xl font-black gradient-text font-mono">{fmt(maturity)}</p>
        <div className="space-y-4 mt-2">
          <ResultBar label="Deposit"         value={fmt(principal)} pct={(principal / maturity) * 100} color="bg-primary" />
          <ResultBar label="Interest Earned" value={fmt(gains)}     pct={(gains / maturity) * 100}     color="bg-amber-400" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          *Compounded quarterly. Actual rates may vary by bank and tenure.
        </p>
      </div>
    </div>
  );
}

// ── LOAN ELIGIBILITY ─────────────────────────────────────────────────────────
function LoanEligibility() {
  const [income, setIncome]     = useState(50000);
  const [existing, setExisting] = useState(5000);
  const [rate, setRate]         = useState(8.5);
  const [months, setMonths]     = useState(240);

  // Max affordable EMI = 50% of (net income - existing EMIs)
  const affordableEMI = (income - existing) * 0.5;
  const r             = rate / 12 / 100;
  const maxLoan       = affordableEMI * (Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months));
  const foir          = ((existing / income) * 100).toFixed(1);

  const riskColor =
    Number(foir) < 30 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : Number(foir) < 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <SliderInput label="Monthly Net Income"   value={income}    onChange={setIncome}    min={10000}  max={500000} step={1000}    prefix="₹" />
        <SliderInput label="Existing EMIs"        value={existing}  onChange={setExisting}  min={0}      max={100000} step={500}     prefix="₹" />
        <SliderInput label="Loan Interest Rate"   value={rate}      onChange={setRate}      min={5}      max={25}     step={0.25}    suffix="%" />
        <SliderInput label="Desired Tenure"       value={months}    onChange={setMonths}    min={12}     max={360}                   suffix=" mo" />
      </div>

      <div className="glass-card p-6 space-y-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Max Loan Eligibility</p>
        <p className="text-4xl font-black gradient-text font-mono">{fmt(maxLoan)}</p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Affordable EMI</span>
            <span className="font-mono font-semibold">{fmt(affordableEMI)}/mo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Disposable after EMI</span>
            <span className="font-mono font-semibold">{fmt(income - existing - affordableEMI)}/mo</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl border text-xs font-medium ${riskColor}`}>
          FOIR (Fixed Obligation to Income Ratio): {foir}%
          {Number(foir) < 30 ? " ✅ Excellent — high eligibility" :
           Number(foir) < 50 ? " ⚡ Moderate — banks may approve" :
           " ⚠️ High FOIR — reduce existing EMIs first"}
        </div>
        <p className="text-[10px] text-muted-foreground">
          *Eligibility based on 50% Net Income rule. Actual approval subject to CIBIL score &amp; lender policy.
        </p>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const [active, setActive] = useState("emi");

  const renderCalc = () => {
    if (active === "emi")  return <EMICalc />;
    if (active === "sip")  return <SIPCalc />;
    if (active === "fd")   return <FDCalc />;
    if (active === "loan") return <LoanEligibility />;
    return null;
  };

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden bg-background">
      <AnimatedBackground className="absolute inset-0 -z-10 opacity-50" particleCount={80} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Financial <span className="gradient-text">Calculator</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            Plan your EMIs, SIP corpus, FD returns, and loan eligibility — all in one place.
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                active === tab.id
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calculator panel */}
        <div className="glass-card p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderCalc()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[10px] text-muted-foreground/60 mt-6">
          All calculations are estimates for planning purposes only. Consult a certified financial advisor before making decisions.
        </p>
      </div>
    </div>
  );
}
