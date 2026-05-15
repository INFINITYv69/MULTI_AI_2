import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  delay?: number;
}

export default function OutputCard({ label, value, icon, children, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card-hover p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary">{icon}</span>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h4>
      </div>
      {children || <p className="text-sm text-foreground leading-relaxed">{value}</p>}
    </motion.div>
  );
}
