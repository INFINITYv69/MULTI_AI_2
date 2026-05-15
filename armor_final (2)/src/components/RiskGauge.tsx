import { motion } from "framer-motion";

interface Props {
  score: number;
  size?: "sm" | "lg";
}

export default function RiskGauge({ score, size = "sm" }: Props) {
  const color =
    score > 70 ? "bg-destructive" : score > 40 ? "bg-warning" : "bg-success";
  const label = score > 70 ? "High Risk" : score > 40 ? "Medium Risk" : "Low Risk";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${score > 70 ? "text-destructive" : score > 40 ? "text-warning" : "text-success"}`}>
          {label}
        </span>
        <span className="text-sm font-mono font-bold text-foreground">{score}/100</span>
      </div>
      <div className={`risk-gauge ${size === "lg" ? "h-4" : "h-3"}`}>
        <motion.div
          className={`risk-gauge-fill ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
