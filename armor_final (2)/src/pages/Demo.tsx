import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Globe, Brain, Target, AlertTriangle, FileText, Lightbulb, TrendingUp, MessageSquare, Search, ChevronDown, ChevronUp } from "lucide-react";
import OutputCard from "../components/OutputCard";
import RiskGauge from "../components/RiskGauge";
import AIInsightsBadge from "../components/AIInsightsBadge";
import { generateMockAnalysis, type AIAnalysis } from "../lib/mockAI";

export default function DemoPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [pipelineStage, setPipelineStage] = useState("Idle");
  const [showExplanation, setShowExplanation] = useState(false);

  const highlightKeywords = useMemo(() => {
    const escaped = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return escaped.replace(/\b(EMI|Loan|SIP|Insurance)\b/gi, (match) => `<span class=\"text-primary font-semibold\">${match}</span>`);
  }, [input]);

  const handleAnalyze = useCallback(() => {
    if (!input.trim()) return;
    setLoading(true);
    setShowExplanation(false);
    setResult(null);
    setPipelineStage("Listening");

    setTimeout(() => setPipelineStage("Processing"), 600);
    setTimeout(() => setPipelineStage("Analyzing"), 1200);
    setTimeout(() => {
      const analysis = generateMockAnalysis(input);
      setResult(analysis);
      setPipelineStage("Output");
      setLoading(false);
    }, 2000);
  }, [input]);

  return (
    <div className="min-h-screen pt-20 section-padding relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            Live <span className="gradient-text">Demo</span>
          </h1>
          <p className="text-muted-foreground">Experience ARMOR AI's financial conversation intelligence</p>
        </motion.div>

        <AIInsightsBadge />

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Type or paste a financial conversation and watch the AI pipeline activate.</p>
                <div className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">Current stage: {pipelineStage}</div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {['Listening', 'Processing', 'Analyzing', 'Output'].map((step) => (
                  <span key={step} className={`px-3 py-1 rounded-full text-xs font-semibold ${pipelineStage === step ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground'}`}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 flex-col lg:flex-row">
              <textarea
                className="input-dark flex-1 h-28 resize-none text-sm"
                placeholder="Type or paste a financial conversation..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleAnalyze())}
              />
              <div className="flex flex-col gap-2">
                <button onClick={handleAnalyze} disabled={!input.trim() || loading} className="btn-glow h-full disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
                <button className="btn-outline-glow px-3 py-2">
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Output */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-16">
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing conversation...</p>
              </div>
            </motion.div>
          )}
          {result && !loading && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OutputCard label="Language" value={`${result.language.detected} (${(result.language.confidence * 100).toFixed(0)}%)`} icon={<Globe className="w-4 h-4" />} delay={0} />
              <OutputCard label="Topic" value={result.topic} icon={<Brain className="w-4 h-4" />} delay={0.05} />
              <OutputCard label="Intent" value={result.intent} icon={<Target className="w-4 h-4" />} delay={0.1} />
              <OutputCard label="Sentiment" value={`${result.sentiment.label} (${(result.sentiment.score * 100).toFixed(0)}%)`} icon={<MessageSquare className="w-4 h-4" />} delay={0.15} />
              
              <div className="sm:col-span-2">
                <OutputCard label="Entities" value="" icon={<Search className="w-4 h-4" />} delay={0.2}>
                  <div className="flex flex-wrap gap-2">
                    {result.entities.map((e, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        <span className="text-muted-foreground">{e.type}:</span> {e.value}
                      </span>
                    ))}
                  </div>
                </OutputCard>
              </div>

              <div className="sm:col-span-2">
                <OutputCard label="Keyword Highlighting" value="" icon={<Search className="w-4 h-4" />} delay={0.22}>
                  <p className="text-sm leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: highlightKeywords }} />
                </OutputCard>
              </div>

              <div className="sm:col-span-2">
                <OutputCard label="Risk Score" value="" icon={<AlertTriangle className="w-4 h-4" />} delay={0.25}>
                  <RiskGauge score={result.riskScore} size="lg" />
                </OutputCard>
              </div>

              <div className="sm:col-span-2">
                <OutputCard label="AI Summary" value={result.summary} icon={<FileText className="w-4 h-4" />} delay={0.3} />
              </div>

              <div className="sm:col-span-2">
                <OutputCard label="Explanation" value={result.explanation} icon={<Brain className="w-4 h-4" />} delay={0.35}>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Tap below to understand how the AI reached this result.</p>
                    <button
                      type="button"
                      onClick={() => setShowExplanation((prev) => !prev)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 text-sm text-primary hover:bg-primary/10 transition-colors"
                    >
                      {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} Why this result?
                    </button>
                    {showExplanation && (
                      <div className="rounded-2xl bg-background/80 p-4 border border-white/10 text-sm text-muted-foreground">
                        This result is generated by detecting the conversation topic, sentiment, and structured financial entities, then scoring risk based on repayment duration and EMI exposure.
                      </div>
                    )}
                  </div>
                </OutputCard>
              </div>

              <div className="sm:col-span-2">
                <OutputCard label="Suggestions" value="" icon={<Lightbulb className="w-4 h-4" />} delay={0.4}>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </OutputCard>
              </div>

              <OutputCard label="Confidence" value="" icon={<TrendingUp className="w-4 h-4" />} delay={0.45}>
                <span className="text-3xl font-bold gradient-text">{result.confidenceScore}%</span>
              </OutputCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
