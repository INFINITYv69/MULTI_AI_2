import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Bookmark, ChevronDown, ChevronUp, Calendar, AlertTriangle, Trash2 } from "lucide-react";
import RiskGauge from "../components/RiskGauge";
import AIInsightsBadge from "../components/AIInsightsBadge";
import { generateMockAnalysis } from "../lib/mockAI";
import { useStore } from "../lib/store";

export default function HistoryPage() {
  const { history, deleteConversation, updateConversation } = useStore();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set(["1", "3"]));

  const filtered = history.filter(
    (c) => c.input.toLowerCase().includes(search.toLowerCase()) || c.topic.toLowerCase().includes(search.toLowerCase())
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
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold">
            Conversation <span className="gradient-text">History</span>
          </h1>
          <p className="text-muted-foreground mt-2">Browse and search past analyses</p>
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
              No conversation history found. Try recording one on the Product page!
            </div>
          ) : (
            filtered.map((conv, i) => {
              const expanded = expandedId === conv.id;
              const textForAnalysis = conv.editedInput ?? conv.input;
              const analysis = conv.analysis || (expanded ? generateMockAnalysis(textForAnalysis) : null);

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
                    <p className="text-sm font-medium truncate">{conv.input}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {conv.date}</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{conv.topic}</span>
                      <span>{conv.sentiment}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <AlertTriangle className={`w-3 h-3 ${conv.riskScore > 60 ? "text-destructive" : conv.riskScore > 40 ? "text-warning" : "text-success"}`} />
                      <span className="font-mono">{conv.riskScore}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleBookmark(conv.id); }} className="p-1">
                      <Bookmark className={`w-4 h-4 ${bookmarked.has(conv.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="p-1 text-muted-foreground hover:text-destructive">
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
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Language</span>
                            <p className="font-medium mt-1">{analysis.language.detected}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Intent</span>
                            <p className="font-medium mt-1">{analysis.intent}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Confidence</span>
                            <p className="font-medium mt-1">{analysis.confidenceScore}%</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Sentiment</span>
                            <p className="font-medium mt-1">{analysis.sentiment.label}</p>
                          </div>
                        </div>
                        <RiskGauge score={analysis.riskScore} />
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Transcript</h4>
                              {editingId === conv.id ? (
                                <textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="input-dark w-full h-28 resize-none text-sm"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{conv.editedInput ?? conv.input}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {editingId === conv.id ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateConversation(conv.id, editValue);
                                      setEditingId(null);
                                    }}
                                    className="btn-glow text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="btn-outline-glow text-sm"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(conv.id);
                                    setEditValue(conv.editedInput ?? conv.input);
                                  }}
                                  className="btn-outline-glow text-sm"
                                >
                                  Edit Transcript
                                </button>
                              )}
                            </div>
                          </div>

                          {conv.editedInput && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="rounded-2xl border border-border p-4 bg-muted/10">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Original</p>
                                <p className="mt-2 text-sm text-foreground whitespace-pre-line">{conv.input}</p>
                              </div>
                              <div className="rounded-2xl border border-border p-4 bg-primary/10">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Edited</p>
                                <p className="mt-2 text-sm text-foreground whitespace-pre-line">{conv.editedInput}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Topic</span>
                            <p className="font-medium mt-1">{analysis.topic}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Risk</span>
                            <p className="font-medium mt-1">{analysis.riskScore}/100</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Entities</span>
                            <p className="font-medium mt-1">{analysis.entities.map((e) => e.type).join(", ")}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Summary length</span>
                            <p className="font-medium mt-1">{analysis.summary.length} chars</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h4>
                          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Suggestions</h4>
                          <ul className="space-y-1">
                            {analysis.suggestions.slice(0, 3).map((s, si) => (
                              <li key={si} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">→</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}
