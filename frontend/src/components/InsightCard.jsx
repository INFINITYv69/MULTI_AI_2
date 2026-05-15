export default function InsightCard({ insights }) {
  const riskColors = {
    low: { bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.3)", text: "#4ade80" },
    medium: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#fbbf24" },
    high: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#f87171" }
  };
  const risk = insights.risk_level || "low";
  const rc = riskColors[risk];
  const score = insights.financial_health_score || 0;

  return (
    <div className="insight-card">
      <div className="insight-header">
        <span className="insight-title">AI INSIGHTS</span>
        <span className="risk-pill" style={{background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text}}>
          {risk.toUpperCase()} RISK
        </span>
      </div>

      <div className="insight-grid">
        <div className="insight-item">
          <span className="ilabel">Intent</span>
          <span className="ival">{insights.intent?.replace(/_/g," ") || "—"}</span>
        </div>
        <div className="insight-item">
          <span className="ilabel">Tense</span>
          <span className="ival">{insights.tense || "—"}</span>
        </div>
        <div className="insight-item">
          <span className="ilabel">Urgency</span>
          <span className="ival">{insights.urgency || "—"}</span>
        </div>
      </div>

      <div className="insight-section">
        <span className="ilabel">Summary</span>
        <p>{insights.summary_english || "—"}</p>
      </div>

      {insights.summary_hindi && (
        <div className="insight-section">
          <span className="ilabel">Hindi Summary</span>
          <p style={{color:"rgba(176,38,255,0.7)"}}>{insights.summary_hindi}</p>
        </div>
      )}

      {insights.entities?.amounts?.length > 0 && (
        <div className="insight-section">
          <span className="ilabel">Amounts Detected</span>
          <div className="tags" style={{marginTop:"8px"}}>
            {insights.entities.amounts.map((a,i) => <span key={i} className="cyber-tag">💰 {a}</span>)}
          </div>
        </div>
      )}

      {insights.entities?.decisions_made?.length > 0 && (
        <div className="insight-section">
          <span className="ilabel">Decisions Made</span>
          <ul>{insights.entities.decisions_made.map((d,i) => <li key={i}>{d}</li>)}</ul>
        </div>
      )}

      {insights.action_items?.length > 0 && (
        <div className="insight-section">
          <span className="ilabel">Action Items</span>
          <ul>{insights.action_items.map((a,i) => <li key={i} style={{color:"rgba(0,245,255,0.6)"}}>→ {a}</li>)}</ul>
        </div>
      )}

      {insights.risk_reasons?.length > 0 && (
        <div className="insight-section">
          <span className="ilabel">Risk Factors</span>
          <ul>{insights.risk_reasons.map((r,i) => <li key={i} style={{color:"#f87171"}}>⚠ {r}</li>)}</ul>
        </div>
      )}

      {insights.sentiment_analysis && (
        <div className="insight-section">
          <span className="ilabel">Emotion & Decision Quality</span>
          <div style={{display:"flex",gap:"8px",marginTop:"8px",flexWrap:"wrap"}}>
            <span className="cyber-tag">{insights.sentiment_analysis.emotion}</span>
            <span className="cyber-tag">{insights.sentiment_analysis.decision_quality?.replace(/_/g," ")}</span>
          </div>
        </div>
      )}

      <div className="health-section">
        <div className="health-row">
          <span>FINANCIAL HEALTH SCORE</span>
          <span style={{color:"#00f5ff",fontFamily:"'Orbitron',monospace"}}>{score} / 100</span>
        </div>
        <div className="health-track">
          <div className="health-fill" style={{width:`${score}%`}} />
        </div>
      </div>
    </div>
  );
}