import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Bell, 
  FileText, Activity, PieChart, Users, Star, ShieldAlert, Download 
} from "lucide-react";
import AIInsightsBadge from "../components/AIInsightsBadge";
import AnimatedBackground from "../components/AnimatedBackground";
import RiskGauge from "../components/RiskGauge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useStore } from "../lib/store";

const trendData = [
  { month: "Jan", loans: 12, sip: 8, risk: 45 },
  { month: "Feb", loans: 19, sip: 12, risk: 52 },
  { month: "Mar", loans: 15, sip: 18, risk: 38 },
  { month: "Apr", loans: 22, sip: 15, risk: 61 },
  { month: "May", loans: 18, sip: 22, risk: 44 },
  { month: "Jun", loans: 25, sip: 28, risk: 35 },
];

const expenseData = [
  { cat: "EMI", amount: 45000 },
  { cat: "SIP", amount: 25000 },
  { cat: "Insurance", amount: 12000 },
  { cat: "Utilities", amount: 8000 },
  { cat: "Others", amount: 15000 },
];

const alerts = [
  { text: "EMI payment due in 3 days - ₹16,200", type: "warning" },
  { text: "SIP auto-debit scheduled for 5th April", type: "info" },
  { text: "Credit score improved by 15 points", type: "success" },
];

const insightsData = [
  {
    title: "EMI Payment Pattern",
    risk: "low risk",
    riskColor: "text-violet-300 bg-violet-300/10 border border-violet-300/20",
    barColor: "bg-violet-300",
    desc: "Regular EMI payments detected across 847 conversations. On-time payment mentions increased by 23%.",
    progress: 80,
    trend: "up"
  },
  {
    title: "Investment Growth Trend",
    risk: "low risk",
    riskColor: "text-violet-300 bg-violet-300/10 border border-violet-300/20",
    barColor: "bg-violet-300",
    desc: "SIP and mutual fund discussions surged 34% this month. Customer interest in equity growing.",
    progress: 65,
    trend: "up"
  },
  {
    title: "Loan Inquiry Surge",
    risk: "medium risk",
    riskColor: "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20",
    barColor: "bg-yellow-500",
    desc: "Personal and home loan inquiries up 41%. Several mentions of high interest rate concerns.",
    progress: 45,
    trend: "down"
  },
  {
    title: "Insurance Awareness Gap",
    risk: "medium risk",
    riskColor: "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20",
    barColor: "bg-yellow-500",
    desc: "Only 12% of conversations mention insurance. Significant opportunity for cross-selling.",
    progress: 30,
    trend: "down"
  }
];

const StatCard = ({ icon, label, value, sub, delay }: { icon: React.ReactNode; label: string; value: string; sub?: string; delay: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card-hover p-5 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-primary">{icon}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </motion.div>
);

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Insights");
  const { history, deleteConversation } = useStore();

  const totalConvos = history.length;
  const avgRisk = totalConvos > 0 ? Math.round(history.reduce((acc, c) => acc + c.riskScore, 0) / totalConvos) : 0;
  const highRiskCount = history.filter(c => c.riskScore > 60).length;

  const menuItems = [
    { id: "Insights", label: "Insights", icon: <Lightbulb className="w-5 h-5" /> },
    { id: "Analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "Risk Monitor", label: "Risk Monitor", icon: <ShieldAlert className="w-5 h-5" /> },
    { id: "Recommendations", label: "Recommendations", icon: <Star className="w-5 h-5" /> },
    { id: "Reminders", label: "Reminders", icon: <Bell className="w-5 h-5" /> },
    { id: "Behavior", label: "Behavior", icon: <Users className="w-5 h-5" /> },
    { id: "Transcripts", label: "Transcripts", icon: <FileText className="w-5 h-5" /> },
  ];

  const generateSection = (doc: jsPDF, title: string, items: string[], yStart: number) => {
    doc.setFontSize(14);
    doc.text(title, 40, yStart);
    doc.setFontSize(11);
    let y = yStart + 18;
    items.forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, 512);
      doc.text(split, 46, y);
      y += split.length * 14 + 4;
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
    });
    return y + 10;
  };

  const handleExportSnapshot = () => {
    try {
      const snapshot = {
        generatedAt: new Date().toISOString(),
        totalConversations: totalConvos,
        averageRisk: avgRisk,
        highRiskCount,
        alerts,
        insights: insightsData.map((item) => ({ title: item.title, risk: item.risk, desc: item.desc, progress: item.progress })),
        reminders: history.slice(0, 5).map((h) => ({ id: h.id, topic: h.topic, date: h.date, sentiment: h.sentiment, riskScore: h.riskScore })),
      };

      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `armor-ai-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting snapshot:", error);
      alert("Failed to export snapshot. Please try again.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Insights":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Conversation Insights</h2>
              <div className="flex gap-2 bg-black/20 p-1 rounded-full border border-white/5 w-fit">
                {["24h", "7d", "30d", "90d"].map((t) => (
                  <button key={t} className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${t === "7d" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {insightsData.map((item, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="p-6 glass-card rounded-2xl border border-white/5 bg-gradient-to-r from-card/30 to-transparent space-y-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.riskColor}`}>
                          {item.risk}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    {item.trend === "up" ? <TrendingUp className="w-5 h-5 text-violet-300" /> : <TrendingDown className="w-5 h-5 text-rose-500" />}
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${item.progress}%` }} 
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${item.barColor} rounded-full`} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case "Analytics":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h2 className="text-2xl font-bold">Analytics Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={<Activity className="w-5 h-5" />} label="Conversations" value={totalConvos.toString()} sub="Total history" delay={0} />
              <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Avg Risk Score" value={avgRisk.toString()} sub={avgRisk > 50 ? "Elevated Risk" : "Stable Portfolio"} delay={0.05} />
              <StatCard icon={<ShieldAlert className="w-5 h-5" />} label="High Risk Items" value={highRiskCount.toString()} sub="Requires attention" delay={0.1} />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Accuracy" value="94.2%" sub="Model confidence" delay={0.15} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Conversation Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(276, 78%, 62%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(276, 78%, 62%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSip" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(292, 84%, 68%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(292, 84%, 68%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" />
                      <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
                      <Area type="monotone" dataKey="loans" stroke="hsl(276, 78%, 62%)" fillOpacity={1} fill="url(#colorLoans)" />
                      <Area type="monotone" dataKey="sip" stroke="hsl(292, 84%, 68%)" fillOpacity={1} fill="url(#colorSip)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expense Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" />
                      <XAxis dataKey="cat" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
                      <Bar dataKey="amount" fill="hsl(292, 84%, 68%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "Risk Monitor":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Risk Monitor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-4 h-full">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Overall Portfolio Risk</h3>
                </div>
                <div className="flex flex-col items-center justify-center p-8">
                  <RiskGauge score={avgRisk || 42} size="lg" />
                  <p className="text-sm text-muted-foreground text-center mt-6">
                    {avgRisk > 60 ? "Portfolio risk is highly elevated. Please review your debt commitments." : "Portfolio risk is within acceptable thresholds. No immediate action required."}
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4 h-full">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Alerts</h3>
                </div>
                <div className="space-y-3">
                  {alerts.map((a, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
                      a.type === "warning" ? "bg-warning/10 text-warning border border-warning/20" : 
                      a.type === "success" ? "bg-success/10 text-success border border-success/20" : 
                      "bg-primary/10 text-primary border border-primary/20"
                    }`}>
                      <span className="w-2 h-2 mt-1.5 rounded-full bg-current flex-shrink-0" />
                      <span className="font-medium">{a.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "Recommendations":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold">AI Recommendations</h2>
            <div className="glass-card p-8 space-y-6 max-w-4xl">
              <div className="space-y-4">
                {[
                  { title: "Consolidate active loans", desc: "Consolidate 2 active loans to reduce overall EMI by ₹4,500/mo and improve cash flow." },
                  { title: "Increase SIP Allocation", desc: "Market conditions are favorable. Increase SIP allocation by 10% to meet your long-term retirement target sooner." },
                  { title: "Optimize Credit Settings", desc: "Switch to a lower interest rate credit card to avoid unnecessary interest accumulation." },
                  { title: "Payment Automation", desc: "Set up automated payment reminders for all EMIs to prevent any drop in credit score." },
                  { title: "Insurance Review", desc: "Consider upgrading term insurance for better coverage at lower premiums based on your latest income profile." },
                ].map((r, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">{i + 1}</span>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{r.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case "Reminders":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Actionable Reminders</h2>
            <div className="glass-card p-6 space-y-4">
              {history.length === 0 ? (
                <p className="text-muted-foreground">No reminders. Start recording conversations to generate tasks!</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-background/50 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">Follow up on: {h.topic}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">From conversation on {h.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteConversation(h.id)}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      >
                        Mark Done
                      </button>
                    </div>
                  )).slice(0, 5)}
                </div>
              )}
            </div>
          </motion.div>
        );

      case "Behavior":
        const sentiments = history.reduce((acc, curr) => {
          acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Behavioral Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 h-full space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sentiment Distribution</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data available.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(sentiments).map(([sent, count], i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{sent}</span>
                          <span className="font-medium">{Math.round((count / history.length) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(count / history.length) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="glass-card p-6 h-full space-y-4 flex flex-col justify-center text-center">
                <Users className="w-12 h-12 text-primary mx-auto opacity-50" />
                <h3 className="text-lg font-semibold">User Confidence Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Based on recent interactions, the user frequently exhibits signs of {Object.keys(sentiments)[0] || "Neutral"} tones when discussing financial commitments. Consider tailoring advice to build more trust.
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <p className="text-muted-foreground">Behavioral Insights:</p>
                  <p>• Frequent loan discussions (45% of conversations)</p>
                  <p>• Increasing investment interest (+23% this month)</p>
                  <p>• Moderate risk tolerance with cautious decision-making</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "Transcripts":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Transcripts</h2>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="glass-card p-12 text-center text-muted-foreground">No transcripts found.</div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="glass-card p-6 space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground border-b border-white/5 pb-2">
                      <span>ID: {h.id}</span>
                      <span>{h.date}</span>
                    </div>
                    <p className="font-mono text-sm leading-relaxed">{h.input}</p>
                    <div className="flex gap-2 pt-2">
                       <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">{h.topic}</span>
                       <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{h.sentiment}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen pt-16 flex flex-col md:flex-row bg-background page-futuristic">
      <AnimatedBackground className="absolute inset-0 -z-10 opacity-75" particleCount={120} />
      {/* Mobile Menu Dropdown / Toggle (Optional for mobile) */}
      <div className="md:hidden p-4 border-b border-border/50 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-border/50 bg-card/10 backdrop-blur-xl hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16 shrink-0">
        <div className="p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <div className={activeTab === item.id ? "text-primary-foreground" : "text-muted-foreground"}>
                {item.icon}
              </div>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-10 mx-auto overflow-y-auto h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">ARMOR AI <span className="gradient-text">Insights</span></h1>
                <p className="text-muted-foreground mt-2">Monitor financial risks, behavior, and future conversation trends.</p>
                <p className="text-sm text-muted-foreground mt-2">Based on past conversations, the system identifies recurring loan and EMI topics and flags evolving risk patterns.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleExportSnapshot} className="btn-glow inline-flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export Snapshot
                </button>
              </div>
            </div>
            <AIInsightsBadge />
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
