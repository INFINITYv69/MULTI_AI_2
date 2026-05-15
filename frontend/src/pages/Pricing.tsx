import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "₹0",
    period: "Free forever",
    desc: "For individuals exploring AI-powered financial insights",
    features: ["50 conversations/month", "Basic language detection", "Entity extraction", "Risk scoring", "Email support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "/month",
    desc: "For professionals and small teams needing advanced analytics",
    features: ["Unlimited conversations", "All languages supported", "Advanced sentiment analysis", "Custom dashboards", "API access", "Priority support", "Export reports"],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact us",
    desc: "For organizations requiring full-scale deployment",
    features: ["Everything in Pro", "Dedicated infrastructure", "Custom AI models", "SSO & compliance", "SLA guarantee", "Dedicated account manager", "On-premise option"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-20 section-padding relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Start free, upgrade when you need more power</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 space-y-6 ${
                plan.highlighted
                  ? "bg-card border-2 border-primary shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
                  : "glass-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <button className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${plan.highlighted ? "btn-glow" : "btn-outline-glow"}`}>
                {plan.cta}
              </button>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
