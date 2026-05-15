import { useEffect, useState } from "react";
import axios from "axios";

const RISK_COLORS = { low:"#4ade80", medium:"#fbbf24", high:"#f87171" };

export default function History() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      axios.get("http://127.0.0.1:8000/history"),
      axios.get("http://127.0.0.1:8000/stats")
    ]).then(([h, s]) => {
      setHistory(h.data);
      setStats(s.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"80px",gap:"16px"}}>
      <div className="cyber-spinner" />
      <p style={{color:"rgba(255,255,255,0.3)",letterSpacing:"2px",fontSize:"12px"}}>LOADING INTELLIGENCE...</p>
    </div>
  );

  const filtered = history.filter(h => {
    const ms = search.toLowerCase();
    const matchSearch = !ms || h.transcript?.toLowerCase().includes(ms) || h.insights?.summary_english?.toLowerCase().includes(ms);
    const matchFilter = filter === "all" ||
      (filter === "financial" && h.insights?.is_financial) ||
      (filter === "high" && h.insights?.risk_level === "high") ||
      (filter === "medium" && h.insights?.risk_level === "medium");
    return matchSearch && matchFilter;
  });

  return (
    <div className="history-page">
      {stats && stats.total > 0 && (
        <div className="history-stats">
          {[
            { num: stats.total, label: "Total Sessions", color: "#fff" },
            { num: stats.financial_count, label: "Financial", color: "#00f5ff" },
            { num: stats.avg_health_score, label: "Avg Health", color: "#4ade80" },
            { num: stats.risk_counts?.high || 0, label: "High Risk", color: "#f87171" },
          ].map((s,i) => (
            <div key={i} className="hstat">
              <div className="hstat-num" style={{color: s.color}}>{s.num}</div>
              <div className="hstat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="search-row">
        <input
          className="cyber-search"
          placeholder="⟳ Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-pills">
        {[
          {id:"all",label:"ALL"},
          {id:"financial",label:"FINANCIAL"},
          {id:"high",label:"HIGH RISK"},
          {id:"medium",label:"MEDIUM RISK"},
        ].map(f => (
          <button key={f.id} className={`filter-pill ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {!history.length && <div className="empty-history">NO CONVERSATIONS RECORDED YET</div>}

      <div className="history-list">
        {filtered.map(item => (
          <div key={item.id} className="history-item">
            <div className="hi-meta">
              <span className="cyber-badge">{item.language?.toUpperCase()}</span>
              <span className="cyber-badge cyan">{item.insights?.intent?.replace(/_/g," ")}</span>
              <span className="risk-dot" style={{background: RISK_COLORS[item.insights?.risk_level] || "#4ade80"}} />
              <span className="hi-time">{new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <p className="hi-transcript">"{item.transcript}"</p>
            <p className="hi-summary">{item.insights?.summary_english}</p>
            {item.insights?.action_items?.length > 0 && (
              <div className="hi-actions">
                {item.insights.action_items.map((a,i) => <span key={i} className="hi-action">→ {a}</span>)}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && history.length > 0 && (
          <div className="empty-history">NO MATCHES FOUND</div>
        )}
      </div>
    </div>
  );
}