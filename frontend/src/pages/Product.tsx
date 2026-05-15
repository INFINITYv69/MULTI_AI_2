import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Mic, MicOff, Trash2, Brain, Target, AlertTriangle, FileText, 
  TrendingUp, CheckCircle, Activity, Sparkles, Wand2, ShieldAlert 
} from "lucide-react";
import RiskGauge from "../components/RiskGauge";
import AIInsightsBadge from "../components/AIInsightsBadge";
import ChatAdvisor from "../components/ChatAdvisor";
import AnimatedBackground from "../components/AnimatedBackground";
import { useStore } from "../lib/store";

export default function ProductPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [downloadLanguage, setDownloadLanguage] = useState<"en" | "hi">("en");
  
  const { addConversation } = useStore();
  
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const mimeRef = useRef<string>("audio/webm");

  const handleRecordToggle = async () => {
    if (recording) {
      // Stop recording
      mediaRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
      setTranscribing(true);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Choose a MIME type the browser actually supports
        const preferredMimes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/ogg",
          "audio/mp4",
        ];
        const supportedMime = preferredMimes.find((m) => MediaRecorder.isTypeSupported(m)) || "";
        mimeRef.current = supportedMime || "audio/webm";

        const recorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : {});
        chunksRef.current = [];
        
        recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: mimeRef.current });
          await sendAudio(blob);
          stream.getTracks().forEach(t => t.stop());
        };
        
        recorder.start();
        mediaRef.current = recorder;
        setRecording(true);
        setRecordSeconds(0);
        setResult(null);
        setReviewMode(false);
        timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
      } catch (err) {
        setError("Microphone access denied or not available.");
      }
    }
  };

  const sendAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const form = new FormData();
      // Pick the right file extension from the MIME type
      const ext = mimeRef.current.includes("ogg") ? "ogg"
                : mimeRef.current.includes("mp4") ? "mp4"
                : "webm";
      form.append("file", blob, `recording.${ext}`);
      const res = await axios.post("http://127.0.0.1:8000/transcribe", form);
      
      setInput(res.data.transcript);
      setResult(res.data.insights);
      addConversation(res.data);
      setReviewMode(true);
    } catch (err: any) {
      setError("Transcription failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError("Please enter a financial conversation");
      return;
    }
    setError("");
    setAnalyzing(true);
    setResult(null);
    
    try {
      const res = await axios.post("http://127.0.0.1:8000/reanalyze", {
        transcript: input
      });
      setResult(res.data.insights);
      addConversation(res.data);
    } catch (err: any) {
      setError("Analysis failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const clearAll = () => {
    setInput("");
    setError("");
    setResult(null);
    setRecording(false);
    setTranscribing(false);
    setReviewMode(false);
    setRecordSeconds(0);
  };
  
  const handleDownloadSession = () => {
    if (!result || !input) return;
    const report = `
ARMOR FINANCIAL INTELLIGENCE REPORT
Date: ${new Date().toLocaleString()}
------------------------------------
TRANSCRIPT:
${input}

RISK ANALYSIS:
Health Score: ${result.financial_health_score}/100
Risk Level: ${result.risk_level.toUpperCase()}
Urgency: ${result.urgency}

EXECUTIVE SUMMARIES:
English: ${result.summary_english || "N/A"}
Hindi: ${result.summary_hindi || "N/A"}
Kannada: ${result.summary_kannada || "N/A"}

ACTION ITEMS:
${(result.action_items || []).join('\n')}
------------------------------------
Generated by ARMOR AI
`;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `armor_session_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formattedTimer = new Date(recordSeconds * 1000).toISOString().substring(14, 19);

  return (
    <div className="min-h-screen pt-20 section-padding relative overflow-hidden bg-background">
      <AnimatedBackground className="absolute inset-0 -z-10 opacity-50" particleCount={100} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Conversation <span className="gradient-text">Intelligence Engine</span>
          </h1>
          <p className="text-muted-foreground">Record or input a financial conversation to get instant AI-powered insights.</p>
        </motion.div>

        <AIInsightsBadge />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            
            <div className={`glass-card p-6 space-y-4 transition-all duration-300 ${recording ? 'ring-2 ring-primary/50 shadow-2xl shadow-primary/10' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  {recording ? <Activity className="w-4 h-4 text-rose-500 animate-pulse" /> : <Mic className="w-4 h-4 text-primary" />}
                  {recording ? "Recording Live Audio" : "Audio / Text Input"}
                </h3>
                {input && !recording && !analyzing && (
                  <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-rose-400 transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="relative group">
                <textarea
                  className={`input-dark w-full h-48 resize-none font-mono text-sm transition-all duration-500 bg-black/40 border-white/5 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 ${recording ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter financial conversation... (e.g. 'Mujhe 5 lakh ka loan chahiye home renovation ke liye')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={recording || transcribing || analyzing}
                />
                
                <AnimatePresence>
                  {recording && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-2xl"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center relative">
                           <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                           </div>
                        </div>
                      </div>
                      <p className="mt-4 text-xl font-mono font-bold tracking-tighter text-primary">{formattedTimer}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Listening to financial context...</p>
                    </motion.div>
                  )}

                  {(transcribing || analyzing) && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl border border-white/10"
                    >
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 border-2 border-t-primary rounded-full animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
                      </div>
                      <p className="mt-4 text-sm font-bold tracking-widest uppercase text-foreground">{transcribing ? "Transcribing Audio" : "Analyzing Intent"}</p>
                      <div className="flex gap-1 mt-2">
                         {[0, 1, 2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleRecordToggle}
                  disabled={transcribing || analyzing}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    recording 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-foreground"
                  }`}
                >
                  {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-primary" />}
                  {recording ? "Stop Recording" : "Start Voice Capture"}
                </button>
                
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={recording || transcribing || analyzing || !input.trim()}
                  className="flex-1 btn-glow py-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  <Wand2 className="w-5 h-5" />
                  Run AI Analysis
                </button>
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </motion.div>
              )}
            </div>
            
            {/* Quick Tips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {[
                 { icon: <Target className="w-4 h-4 text-blue-400" />, label: "Loan Capture", desc: "Identify EMI & Tenure" },
                 { icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, label: "SIP Growth", desc: "Strategy detection" },
                 { icon: <ShieldAlert className="w-4 h-4 text-amber-400" />, label: "Risk Flag", desc: "Real-time urgency" }
               ].map((tip, i) => (
                 <div key={i} className="p-4 glass-card border-none bg-white/[0.02] space-y-2">
                    <div className="p-2 w-fit rounded-lg bg-white/5">{tip.icon}</div>
                    <p className="text-xs font-bold text-foreground">{tip.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{tip.desc}</p>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Result Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            {!result && !analyzing && !transcribing && (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-center space-y-6 border-dashed border-white/10 bg-transparent">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                    <Brain className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                </div>
                <div className="max-w-xs space-y-2">
                  <h3 className="text-lg font-bold">Awaiting Input</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Capture a financial conversation via voice or text. Our Llama 3.1 engine will extract entities, risks, and sentiment.
                  </p>
                </div>
              </div>
            )}

            {(analyzing || transcribing) && (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center space-y-8 min-h-[400px]">
                <div className="relative w-32 h-32">
                   <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-primary/20 rounded-3xl" />
                   <motion.div animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border border-accent/20 rounded-full" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                   </div>
                </div>
                <div className="text-center space-y-2">
                   <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Engine Active</p>
                   <p className="text-xs text-muted-foreground">{transcribing ? "Synthesizing voice data..." : "Parsing financial entities and calculating risk vector..."}</p>
                </div>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Analysis Result</h3>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Stability Score:</span>
                         <span className="text-lg font-mono font-bold text-primary">{result.financial_health_score}</span>
                      </div>
                   </div>
                   
                   <RiskGauge score={result.financial_health_score} size="lg" />
                   
                   <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                         <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Risk Level</p>
                         <p className={`text-sm font-bold capitalize ${result.risk_level === 'high' ? 'text-rose-400' : result.risk_level === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                           {result.risk_level}
                         </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                         <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Urgency</p>
                         <p className="text-sm font-bold capitalize text-primary">{result.urgency}</p>
                      </div>
                   </div>
                </div>

                <div className="glass-card p-6 space-y-6">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <FileText className="w-4 h-4 text-primary" />
                         <h4 className="text-xs font-bold uppercase tracking-widest">Executive Summary</h4>
                      </div>
                      <div className="space-y-3">
                         <p className="text-sm text-foreground/90 leading-relaxed italic border-l-2 border-primary/30 pl-4">{result.summary_english || "No summary available."}</p>
                         <p className="text-sm text-muted-foreground leading-relaxed">{result.summary_hindi || ""}</p>
                      </div>
                   </div>

                   <div className="h-px bg-white/5" />

                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-emerald-400" />
                         <h4 className="text-xs font-bold uppercase tracking-widest">Actionable items</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                         {result.action_items.map((item: string, i: number) => (
                           <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                              <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <p className="text-xs text-muted-foreground">{item}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* AI Advisor Chat Integration */}
                <ChatAdvisor insights={result} transcript={input} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
