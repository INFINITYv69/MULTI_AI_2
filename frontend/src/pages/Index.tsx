import { motion, useMotionTemplate, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic, Brain, Lightbulb, ShieldAlert, Bot, ArrowRight, TrendingUp, AlertTriangle, Sparkles, Shield, CheckCircle2, Globe, Lock, FileText, MousePointer2 } from "lucide-react";
import React, { useRef, useState } from "react";
import TypingAnimation from "../components/TypingAnimation";
import AIInsightsBadge from "../components/AIInsightsBadge";
import HeroScene from "../components/HeroScene";
import Interactive3DAsset from "../components/Interactive3DAsset";

const features = [
  { icon: <Mic className="w-8 h-8" />, title: "Voice Recognition", desc: "Captures multilingual financial conversations in real-time with stunning accuracy and near-zero latency.", glow: "bg-blue-500/20", glowColor: "rgba(59, 130, 246, 0.4)", textGlow:"text-blue-400" },
  { icon: <Brain className="w-8 h-8" />, title: "AI Analysis", desc: "Deep NLP processing for entity extraction, context classification, and financial structuring.", glow: "bg-purple-500/20", glowColor: "rgba(168, 85, 247, 0.4)", textGlow:"text-purple-400" },
  { icon: <Lock className="w-8 h-8" />, title: "Fraud Prevention", desc: "Identifies deceptive language patterns, inconsistencies, and irregular audio footprints.", glow: "bg-emerald-500/20", glowColor: "rgba(16, 185, 129, 0.4)", textGlow:"text-emerald-400" },
  { icon: <ShieldAlert className="w-8 h-8" />, title: "Risk Detection", desc: "Real-time risk scoring and highly accurate alert generation on conversational risks.", glow: "bg-red-500/20", glowColor: "rgba(239, 68, 68, 0.4)", textGlow:"text-red-400" },
  { icon: <Lightbulb className="w-8 h-8" />, title: "Smart Insights", desc: "Actionable financial recommendations driven by continuous conversational context.", glow: "bg-cyan-500/20", glowColor: "rgba(6, 182, 212, 0.4)", textGlow:"text-cyan-400" },
  { icon: <Bot className="w-8 h-8" />, title: "AI Assistant", desc: "Intelligent conversational querying, explainability, and fully guided decision support.", glow: "bg-violet-500/20", glowColor: "rgba(139, 92, 246, 0.4)", textGlow:"text-violet-400" },
];



const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  return (
    <div className="min-h-screen pt-16 relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[95vh] flex items-center justify-center section-padding overflow-hidden hero-section bg-gradient-to-br from-background via-background to-primary/5">
        <HeroScene className="absolute inset-0 z-0" />
        
        {/* Absolute Background Floating Asset */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl z-0 pointer-events-auto flex justify-center">
          <Interactive3DAsset />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center mt-32">
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI-Powered Financial Intelligence
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-balance leading-[1.1] space-y-2">
              <div>Turn Conversations</div>
              <div>into <span className="gradient-text">Financial Intelligence</span></div>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AI that understands multilingual financial conversations instantly — extracting insights, assessing risk, and generating actionable intelligence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-12 flex items-center justify-center"
          >
            <TypingAnimation />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AIInsightsBadge />
          </motion.div>



          {/* AI Explainability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="glass-card p-8 mb-12 border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20 text-primary flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold">AI Explainability</p>
                  <h3 className="text-xl font-semibold mt-1">Why this result?</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm sm:text-right">
                The AI uses conversation history, entity extraction, sentiment analysis, and pattern recognition to compute risk and recommendation signals.
              </p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/product" className="btn-glow inline-flex items-center gap-2 group">
              Start Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/dashboard" className="btn-outline-glow inline-flex items-center gap-2">
              View Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-gradient-to-b from-background/50 to-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Core Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Powered by <span className="gradient-text">Advanced AI</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              End-to-end financial conversation intelligence pipeline
            </p>
          </motion.div>

        {/* Features Content Container */}
        <div className="relative pb-32">
          {/* Luminous Surrounding Atmosphere Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

          {/* 6 Animation Cards */}
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 max-w-7xl mx-auto px-4 mt-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={item}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group p-[1px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent"
              >
                {/* Glowing Aura on Hover */}
                <div 
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-[80px] ${feature.glow}`} 
                  style={{ background: `radial-gradient(circle at center, ${feature.glowColor}, transparent)` }} 
                />

                <div className="relative h-full flex flex-col gap-6 p-8 rounded-[2rem] bg-black/80 backdrop-blur-3xl border border-white/5 overflow-hidden shadow-2xl">
                  
                  {/* Decorative ambient top border line */}
                  <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 opacity-0 group-hover:opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${feature.glowColor}, transparent)` }} />
                  
                  {/* Icon Box */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-500 bg-white/5 border border-white/10 group-hover:bg-opacity-20`}>
                     <div className={`transition-transform duration-500 group-hover:scale-110 ${feature.textGlow}`}>
                       {feature.icon}
                     </div>
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
                  </div>
                  
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        </div>
      </section>

      {/* Security */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/5 text-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-3xl font-semibold mb-3">Your Data is Secure and Private</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                All conversations are processed locally and never stored on external servers. Your financial data remains confidential and protected with enterprise-grade security.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  End-to-end Encryption
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Local Processing
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  No Data Storage
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
