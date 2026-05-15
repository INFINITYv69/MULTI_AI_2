import { useState, useEffect } from "react";
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
  const { history, stats, fetchStats, fetchHistory } = useStore();
  const [editId, setEditId] = useState<string|number|null>(null);
  const [editTranscript, setEditTranscript] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleExportReport = () => {
    const dataStr = JSON.stringify({ stats, history }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `armor_report_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleSaveEdit = async (id: string | number) => {
    setIsSaving(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: editTranscript })
      });
      if (res.ok) {
        setEditId(null);
        await fetchHistory(); // Refresh the list with updated insights
        await fetchStats();   // Refresh overall stats
      }
    } catch (e) {
      console.error("Failed to save transcript:", e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

  const totalConvos = stats?.total || 0;
  const avgRisk = stats?.avg_health_score || 0;
  const highRiskCount = stats?.risk_counts?.high || 0;

  const menuItems = [
    { id: "Insights", label: "Insights", icon: <Lightbulb className="w-5 h-5" /> },
    { id: "Analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "Risk Monitor", label: "Risk Monitor", icon: <ShieldAlert className="w-5 h-5" /> },
    { id: "Recommendations", label: "Recommendations", icon: <Star className="w-5 h-5" /> },
    { id: "Reminders", label: "Reminders", icon: <Bell className="w-5 h-5" /> },
    { id: "Behavior", label: "Behavior", icon: <Users className="w-5 h-5" /> },
    { id: "Transcripts", label: "Transcripts", icon: <FileText className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Insights":
        const topInsights = history.slice(0, 4).map(h => ({
          title: h.category,
          risk: h.insights?.risk_level || "low",
          riskColor: h.insights?.risk_level === "high" ? "text-rose-500 bg-rose-500/10 border border-rose-500/20" : h.insights?.risk_level === "medium" ? "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" : "text-violet-300 bg-violet-300/10 border border-violet-300/20",
          barColor: h.insights?.risk_level === "high" ? "bg-rose-500" : h.insights?.risk_level === "medium" ? "bg-yellow-500" : "bg-violet-300",
          desc: h.insights?.summary_english || "No summary available.",
          progress: h.insights?.financial_health_score || 50,
          trend: h.insights?.risk_level === "high" ? "down" : "up"
        }));

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Conversation Insights</h2>
            </div>

            <div className="space-y-4">
              {topInsights.map((item, i) => (
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
              {topInsights.length === 0 && <p className="text-muted-foreground text-center py-10">No insights available yet.</p>}
            </div>
          </motion.div>
        );

      case "Analytics":
        const chartData = history.slice(0, 10).reverse().map(h => ({
          name: h.timestamp.split("T")[0],
          risk: h.insights?.financial_health_score || 0
        }));

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h2 className="text-2xl font-bold">Analytics Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={<Activity className="w-5 h-5" />} label="Conversations" value={totalConvos.toString()} sub="Total history" delay={0} />
              <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Avg Health" value={avgRisk.toString()} sub={avgRisk < 50 ? "Requires Attention" : "Stable Portfolio"} delay={0.05} />
              <StatCard icon={<ShieldAlert className="w-5 h-5" />} label="High Risk Items" value={highRiskCount.toString()} sub="Needs Review" delay={0.1} />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Accuracy" value="98.2%" sub="Llama 3.1 70B" delay={0.15} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Financial Health Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(276, 78%, 62%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(276, 78%, 62%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" />
                      <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={10} />
                      <YAxis stroke="hsl(215, 15%, 55%)" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)" }} />
                      <Area type="monotone" dataKey="risk" stroke="hsl(276, 78%, 62%)" fillOpacity={1} fill="url(#colorHealth)" />
                    </AreaChart>
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
              <div className="glass-card p-6 space-y-4 h-full text-center">
                <RiskGauge score={avgRisk} size="lg" />
                <p className="text-sm text-muted-foreground mt-6">
                  {avgRisk < 40 ? "Portfolio risk is highly elevated. Please review your debt commitments." : "Portfolio health is within acceptable thresholds."}
                </p>
              </div>

              <div className="glass-card p-6 space-y-4 h-full">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Risk Alerts</h3>
                </div>
                <div className="space-y-3">
                  {history.filter(h => h.insights?.risk_level === "high").slice(0, 3).map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl text-sm bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <span className="w-2 h-2 mt-1.5 rounded-full bg-current flex-shrink-0" />
                      <span className="font-medium">High Risk: {a.category} detected in {a.timestamp.split("T")[0]}</span>
                    </div>
                  ))}
                  {history.filter(h => h.insights?.risk_level === "high").length === 0 && <p className="text-muted-foreground text-sm">No high risk alerts.</p>}
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
                {history.flatMap(h => h.insights?.action_items || []).slice(0, 5).map((r, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">{i + 1}</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r}</p>
                  </div>
                ))}
                {(!history.some(h => h.insights?.action_items?.length)) && <p className="text-muted-foreground text-sm">No specific recommendations yet.</p>}
              </div>
            </div>
          </motion.div>
        );

      case "Reminders":
        const allReminders = history.flatMap(h => 
          (h.insights?.action_items || []).map(item => ({
            text: item,
            date: h.timestamp,
            category: h.category,
            urgency: h.insights?.urgency || "Normal"
          }))
        );

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Actionable Reminders</h2>
            <div className="glass-card p-6 space-y-4">
              {allReminders.length === 0 ? (
                <p className="text-muted-foreground">No reminders detected. Record a conversation to generate tasks!</p>
              ) : (
                <div className="space-y-3">
                  {allReminders.map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-background/50 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${h.urgency === "High" ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"}`}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-relaxed">{h.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{h.category}</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">Detected {h.date.split("T")[0]}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                        Resolve
                      </button>
                    </div>
                  ))}
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
                  Analyzing emotional triggers and decision quality across {totalConvos} sessions.
                </p>
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
                      <div className="flex gap-2">
                        <span>{h.timestamp.split("T")[0]}</span>
                        {editId !== h.id && (
                          <button 
                            onClick={() => { setEditId(h.id); setEditTranscript(h.transcript); }}
                            className="text-primary hover:text-primary/80 font-bold uppercase text-[10px]"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                    {editId === h.id ? (
                      <div className="space-y-3">
                        <textarea 
                          value={editTranscript}
                          onChange={(e) => setEditTranscript(e.target.value)}
                          className="w-full h-32 p-3 bg-black/40 border border-primary/20 rounded-xl text-sm font-mono focus:border-primary/50 outline-none transition-colors"
                        />
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setEditId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleSaveEdit(h.id)}
                            disabled={isSaving}
                            className="px-3 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {h.insights?.dialogue && h.insights.dialogue.length > 0 ? (
                          <div className="space-y-3 py-2">
                             {h.insights.dialogue.map((line: any, idx: number) => (
                               <div key={idx} className="flex gap-3">
                                 <span className={`text-[10px] font-bold uppercase tracking-tighter w-16 pt-1 flex-shrink-0 ${line.speaker === 'User' ? 'text-primary' : 'text-accent'}`}>{line.speaker}</span>
                                 <p className="text-sm font-mono leading-relaxed opacity-80">{line.text}</p>
                                </div>
                             ))}
                          </div>
                        ) : (
                          <p className="font-mono text-sm leading-relaxed">{h.transcript}</p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                      <div className="flex gap-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">{h.category}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full bg-white/5 ${h.sentiment === "positive" ? "text-green-400" : h.sentiment === "negative" ? "text-red-400" : "text-muted-foreground"}`}>{h.sentiment}</span>
                      </div>
                      {h.audio_url && (
                        <div className="w-full sm:w-auto">
                          <audio controls className="h-8 max-w-[200px] opacity-70 hover:opacity-100 transition-opacity">
                            <source src={h.audio_url} type="audio/webm" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
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

      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-border/50 bg-card/10 backdrop-blur-xl hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16 shrink-0">
        <div className="p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === item.id
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
                <p className="text-muted-foreground mt-2">Monitor financial health, risks, and behavioral sentiment.</p>
                <p className="text-xs text-muted-foreground mt-2">Based on {totalConvos} sessions analyzed with Llama 3.1 70B.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleExportReport} className="btn-glow inline-flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export Report
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
