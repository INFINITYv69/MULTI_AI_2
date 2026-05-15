import { motion } from "framer-motion";
import { Mic, Globe, Search, FileText, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

const steps = [
  {
    id: 1,
    title: "Capture Conversation",
    icon: Mic,
    description:
      "Record real-world financial conversations using microphone input.",
    details:
      "Supports natural speech in multiple languages for seamless data collection.",
    color: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: 2,
    title: "Speech to Text",
    icon: Globe,
    description:
      "Convert spoken words into accurate text transcripts.",
    details:
      "Advanced speech recognition handles accents, noise, and multilingual content.",
    color: "from-cyan-500/20 to-cyan-600/10",
    borderColor: "border-cyan-500/30",
  },
  {
    id: 3,
    title: "Language Detection",
    icon: Search,
    description:
      "Automatically identify the language and context of the conversation.",
    details:
      "Detects Hindi, English, Hinglish, and financial topics like loans and investments.",
    color: "from-purple-500/20 to-purple-600/10",
    borderColor: "border-purple-500/30",
  },
  {
    id: 4,
    title: "Entity Extraction",
    icon: FileText,
    description:
      "Extract key financial entities such as amounts, durations, and terms.",
    details:
      "Structured data extraction for loan amounts, EMI, SIP, and insurance details.",
    color: "from-pink-500/20 to-pink-600/10",
    borderColor: "border-pink-500/30",
  },
  {
    id: 5,
    title: "Insight Generation",
    icon: ShieldAlert,
    description:
      "Generate actionable insights, risk scores, and recommendations.",
    details:
      "AI-powered analysis provides summaries, sentiment, and smart financial advice.",
    color: "from-violet-500/20 to-violet-600/10",
    borderColor: "border-violet-500/30",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function HowItWorks() {
  return (
    <div className="relative min-h-screen section-padding pt-24 page-futuristic text-slate-100">
      <AnimatedBackground className="absolute inset-0 -z-10 opacity-75" particleCount={120} />
      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Our Process Pipeline
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-200 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-4">
            How It Works
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A sophisticated AI pipeline that transforms financial conversations into actionable intelligence through advanced NLP and risk analysis.
          </p>
        </motion.div>

        {/* Timeline Steps */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:gap-8"
        >
          {/* Desktop Flow View */}
          <div className="hidden md:block">
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.id} variants={itemVariants} className="relative">
                    {/* Connecting Line */}
                    {idx < steps.length - 1 && (
                      <div className="absolute top-16 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                    )}

                    {/* Card */}
                    <div className={`glass-card-hover p-5 h-full border-2 ${step.borderColor} bg-gradient-to-br ${step.color} relative z-10`}>
                      <div className="flex flex-col items-center text-center h-full">
                        {/* Step Number */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg shadow-primary/50">
                          {step.id}
                        </div>

                        {/* Icon */}
                        <div className="mb-3">
                          <Icon className="h-6 w-6 text-primary mx-auto" />
                        </div>

                        {/* Content */}
                        <h3 className="font-semibold text-sm mb-2 text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Flow */}
          <div className="md:hidden space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.id} variants={itemVariants}>
                  {/* Arrow between items */}
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="h-5 w-5 text-primary/50 rotate-90" />
                    </div>
                  )}

                  <div className={`glass-card-hover p-6 border-2 ${step.borderColor} bg-gradient-to-br ${step.color}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-primary/50">
                        {step.id}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        <p className="text-xs text-slate-300">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-8 border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Complete Intelligence Pipeline
              </h3>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              From the first captured word to final risk assessment, every step is optimized for accuracy, speed, and secure data handling. Your financial data never leaves your control.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
