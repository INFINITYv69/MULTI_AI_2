import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Bookmark, ChevronDown, ChevronUp, Calendar, AlertTriangle, Trash2 } from "lucide-react";
import RiskGauge from "../components/RiskGauge";
import AIInsightsBadge from "../components/AIInsightsBadge";
import AnimatedBackground from "../components/AnimatedBackground";
import { useStore } from "../lib/store";

export default function HistoryPage() {
  const { history, deleteConversation, fetchHistory } = useStore();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = history.filter(
    (c) => c.transcript.toLowerCase().includes(search.toLowerCase()) || 
          c.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen pt-20 section-padding relative overflow-hidden">
      <AnimatedBackground className="absolute inset-0 -z-10 opacity-75" particleCount={120} />
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold">
            Conversation <span className="gradient-text">History</span>
          </h1>
          <p className="text-muted-foreground mt-2">Browse and search past analyses from ARMOR AI</p>
        </motion.div>

        <AIInsightsBadge />

        {/* Search */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="input-dark w-full pl-10"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-outline-glow flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center p-12 glass-card text-muted-foreground">
              No conversation history found.
            </div>
          ) : (
            filtered.map((conv, i) => {
              const expanded = expandedId === conv.id;
              const analysis = conv.insights;

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card-hover overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : conv.id)}
                    className="w-full p-5 flex items-center gap-4 text-left"
                  >
                    <div className="flex-shrink-0 w-1 h-12 rounded-full bg-gradient-to-b from-primary to-accent" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate italic">"{conv.transcript}"</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {conv.timestamp.split("T")[0]}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {conv.category}
                        </span>
                        <span className={conv.sentiment === "positive" ? "text-green-400" : conv.sentiment === "negative" ? "text-red-400" : ""}>
                          {conv.sentiment}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs">
                        <AlertTriangle className={`w-3 h-3 ${analysis?.risk_level === "high" ? "text-rose-500" : analysis?.risk_level === "medium" ? "text-warning" : "text-success"}`} />
                        <span className="font-mono">{analysis?.financial_health_score || 0}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(conv.id); }} 
                        className="p-1"
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarked.has(conv.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} 
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expanded && analysis && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden"
                      >
                        <div className="p-5 space-y-6">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-muted-foreground block mb-1">Language</span>
                              <p className="font-semibold uppercase text-foreground">{conv.language}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-muted-foreground block mb-1">Intent</span>
                              <p className="font-semibold capitalize text-foreground">{analysis.intent}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-muted-foreground block mb-1">Confidence</span>
                              <p className="font-semibold text-foreground">{conv.confidence}%</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-muted-foreground block mb-1">Urgency</span>
                              <p className="font-semibold capitalize text-foreground">{analysis.urgency}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center py-4 bg-white/5 rounded-2xl border border-white/5">
                            <RiskGauge score={analysis.financial_health_score} size="lg" />
                            <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mt-4">Financial Health Score</p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Original Transcript</h4>
                            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 italic text-sm text-muted-foreground leading-relaxed">
                              "{conv.transcript}"
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <h4 className="text-xs font-bold uppercase tracking-widest text-primary">AI Summary (EN)</h4>
                               <p className="text-sm text-foreground/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                 {analysis.summary_english}
                               </p>
                            </div>
                            <div className="space-y-3">
                               <h4 className="text-xs font-bold uppercase tracking-widest text-primary">AI Summary (HI)</h4>
                               <p className="text-sm text-foreground/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                 {analysis.summary_hindi}
                               </p>
                            </div>
                          </div>

                          {analysis.action_items?.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Smart Action Items</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {analysis.action_items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <p className="text-xs text-foreground/80">{item}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
