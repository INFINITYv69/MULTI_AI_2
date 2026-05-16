import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { Brain, Activity, CheckCircle2, ArrowRight, Share2, Sparkles, ShieldAlert, Cpu, Network } from "lucide-react";

export default function WorkflowPage() {
  const { history } = useStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Safely get the selected conversation
  const conv = history[selectedIndex] ?? null;

  // Traces can live at insights.traces or at the top level
  const traces: any[] = conv?.insights?.traces ?? conv?.traces ?? [];

  const agentIcons: Record<string, any> = {
    "Classifier Agent":   <Cpu className="w-5 h-5 text-sky-400" />,
    "Entity Extractor":   <Brain className="w-5 h-5 text-blue-400" />,
    "Deception Detector": <ShieldAlert className="w-5 h-5 text-rose-400" />,
    "Risk Analyst":       <Activity className="w-5 h-5 text-amber-400" />,
    "Risk Auditor":       <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    "Final Composer":     <Sparkles className="w-5 h-5 text-purple-400" />,
    "System":             <Network className="w-5 h-5 text-red-400" />,
  };

  return (
    <div className="min-h-screen pt-20 section-padding bg-background overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
            Agentic Observability
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Multi-Agent <span className="gradient-text">Collaboration Trace</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Witness how multiple specialized LLM agents collaborate in real-time through a stateful LangGraph workflow.
          </p>

          {/* Session Selector */}
          {history.length > 0 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Session:</span>
              <select
                className="bg-card/80 border border-white/10 rounded-lg px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
              >
                {history.map((c, idx) => (
                  <option key={c.id ?? idx} value={idx} className="bg-background">
                    {new Date(c.timestamp).toLocaleString()} — {c.category ?? "general"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </motion.div>

        {/* No data state */}
        {traces.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-4">
            <Brain className="w-16 h-16 text-muted-foreground/20 mx-auto" />
            <p className="text-muted-foreground text-lg font-medium">No agent trace available for this session.</p>
            <p className="text-muted-foreground/60 text-sm">
              Record an audio conversation on the <strong>Analyze</strong> page, then come back here to see the live collaboration trace.
            </p>
          </div>
        ) : (
          <div className="relative space-y-8">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

            {traces.map((trace: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="relative pl-16 group"
              >
                {/* Timeline dot */}
                <div className="absolute left-[30px] top-6 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 group-hover:scale-125 transition-transform" />

                <div className="glass-card p-6 border border-white/5 hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {agentIcons[trace.agent] ?? <Brain className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{trace.agent}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Node Completed</p>
                    </div>
                    <div className="ml-auto text-[10px] text-muted-foreground bg-white/5 px-2 py-1 rounded-full border border-white/10">
                      Step {idx + 1}/{traces.length}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed bg-black/20 p-4 rounded-xl italic">
                    "{trace.message}"
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[0, 1].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[8px] font-bold">
                          LLM
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">Groq · Llama-3.3-70B</span>
                  </div>
                </div>

                {idx < traces.length - 1 && (
                  <div className="mt-6 flex justify-center opacity-30">
                    <ArrowRight className="w-5 h-5 rotate-90 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Workflow Complete Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 mt-12 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <h4 className="font-bold">Workflow Complete</h4>
                  <p className="text-xs text-muted-foreground">All {traces.length} agents collaborated · Result stored in SQLite</p>
                </div>
              </div>
              <Share2 className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </motion.div>
          </div>
        )}

        {/* Technical Showcase */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
          <div className="glass-card p-8 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              LangGraph State
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlike single-LLM chains, the system maintains a shared <code className="text-primary">AgentState</code>. Each specialized agent reads from this state, enriches it, and passes it to the next.
            </p>
            <div className="p-4 rounded-lg bg-black/40 font-mono text-[10px] text-primary/80 border border-white/5 whitespace-pre">
              {`class AgentState(TypedDict):\n  transcript: str\n  category_analysis: Dict\n  entities: Dict\n  risk_analysis: Dict\n  report: Dict\n  traces: List[Dict]`}
            </div>
          </div>

          <div className="glass-card p-8 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Tracing & Debugging
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every agent step is traced and stored. This visibility allows identification of exactly which agent influenced the final decision, ensuring full accountability in financial advice.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="px-3 py-1 rounded bg-white/5 text-[10px] font-bold border border-white/10 uppercase tracking-tighter text-primary">Observability Active</div>
              <div className="px-3 py-1 rounded bg-white/5 text-[10px] font-bold border border-white/10 uppercase tracking-tighter text-amber-400">LangGraph Compiled</div>
              <div className="px-3 py-1 rounded bg-white/5 text-[10px] font-bold border border-white/10 uppercase tracking-tighter text-emerald-400">Groq Llama-3.3-70B</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
