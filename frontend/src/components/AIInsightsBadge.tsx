import { ShieldCheck, Zap, CircleDot, Cpu } from "lucide-react";

export default function AIInsightsBadge() {
  return (
    <div className="glass-card p-4 mb-8 grid gap-4 sm:grid-cols-[auto_1fr] items-center border border-white/10">
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-background/80 border border-white/10">
        <ShieldCheck className="w-5 h-5 text-violet-300" />
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Data Security</p>
          <p className="text-sm font-semibold">Your data is private & secure</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Audio", icon: <CircleDot className="w-4 h-4" /> },
          { label: "Text", icon: <Cpu className="w-4 h-4" /> },
          { label: "NLP", icon: <Zap className="w-4 h-4" /> },
          { label: "Insights", icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-muted/5 p-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">{item.icon}</span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold">Pipeline</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
