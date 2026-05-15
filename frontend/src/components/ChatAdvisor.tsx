import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Send, MessageSquare, Sparkles, User, Bot, Zap } from "lucide-react";

export default function ChatAdvisor({ insights, transcript }: { insights: any; transcript: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const context = `Transcript: ${transcript}\nInsights: ${JSON.stringify(insights, null, 2)}`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    
    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: userMsg,
        context
      });
      setMessages(prev => [...prev, { role: "ai", text: res.data.reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "ai", text: "Error: " + e.message }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Is this loan safe for me?",
    "What should I do next?",
    "Explain the risk factors",
    "How does this impact my SIP?"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border-primary/10 bg-gradient-to-b from-primary/[0.02] to-transparent overflow-hidden flex flex-col h-[500px]"
    >
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">ARMOR AI Advisor</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Powered by Llama 3.1
            </p>
          </div>
        </div>
        <div className="flex gap-1">
           {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />)}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar"
      >
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-4">
              <p className="text-xs text-muted-foreground text-center">Tap a suggestion or ask your own question about this analysis.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all text-left max-w-[200px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-white/10" : "bg-primary/20 border border-primary/20"}`}>
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                m.role === "user" 
                ? "bg-primary text-white font-medium rounded-tr-none" 
                : "glass-card border-white/5 rounded-tl-none"
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="glass-card border-white/5 p-4 rounded-2xl rounded-tl-none">
                 <div className="flex gap-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mt-auto">
        <input
          type="text"
          className="input-dark w-full py-4 pr-14 rounded-2xl border-white/10 focus:border-primary/40 focus:ring-primary/20"
          placeholder="Ask ARMOR about your financial health..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}