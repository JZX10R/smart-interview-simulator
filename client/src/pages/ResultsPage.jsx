import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import TopicTag from "../components/TopicTag";

const BAND_COLORS = {
  Excellent: "var(--green)", Good: "var(--blue)",
  Average: "var(--amber)", "Needs Improvement": "var(--red)",
};
const TOPIC_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#a855f7"];

function getOverallBand(avg) {
  if (avg >= 8) return "Excellent";
  if (avg >= 6) return "Good";
  if (avg >= 4) return "Average";
  return "Needs Improvement";
}

function getAvg(scores) {
  if (!scores || !scores.length) return null;
  return parseFloat((scores.reduce((a,b) => a+b,0)/scores.length).toFixed(1));
}

export default function ResultsPage({ summary, onRestart }) {
  if (!summary) return null;
  const { overallBand, totalQuestions, weakTopic, performanceSummary, history } = summary;

  const radarData = Object.entries(performanceSummary)
    .filter(([,v]) => v.count > 0)
    .map(([topic,v]) => ({ topic, avg: v.avg }));

  const barData = Object.entries(performanceSummary)
    .filter(([,v]) => v.count > 0)
    .map(([topic,v]) => ({ topic, avg: v.avg }));

  const tooltipStyle = {
    contentStyle: { background:"#111827", border:"0.5px solid rgba(99,179,237,0.14)", borderRadius:8 },
    labelStyle: { color:"#e2e8f0", fontSize:12 },
    itemStyle: { color:"#94a3b8", fontSize:12 },
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-hero">
          <div className="results-band" style={{ color: BAND_COLORS[overallBand] || "var(--accent2)" }}>
            ◆ {overallBand}
          </div>
          <h1>Session Complete</h1>
          <p>{totalQuestions} questions answered · Weakest area: <strong style={{ color:"var(--amber)" }}>{weakTopic}</strong></p>
        </div>

        {radarData.length > 2 && (
          <div className="chart-card">
            <div className="chart-title">Topic Coverage Radar</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99,179,237,0.08)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill:"#64748b", fontSize:11, fontFamily:"JetBrains Mono" }} />
                <Radar name="Score" dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {barData.length > 0 && (
          <div className="chart-card">
            <div className="chart-title">Score by Topic</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top:8, right:8, left:-16, bottom:0 }}>
                <XAxis dataKey="topic" tick={{ fill:"#64748b", fontSize:11, fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,10]} tick={{ fill:"#64748b", fontSize:10, fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avg" radius={[4,4,0,0]}>
                  {barData.map((_,i) => <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="sessions-section">
          <span className="sessions-title">Question Report</span>
          {history.map((h, i) => (
            <div key={i} className="report-item">
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--text4)" }}>Q{i+1}</span>
                <TopicTag topic={h.topic} />
                <span style={{
                  marginLeft:"auto",
                  fontFamily:"JetBrains Mono",
                  fontSize:14,
                  fontWeight:600,
                  color: h.score >= 7 ? "var(--green)" : h.score >= 4 ? "var(--amber)" : "var(--red)"
                }}>{h.score}/10</span>
              </div>
              <p className="report-q">{h.question}</p>
              <p className="report-a"><strong style={{ color:"var(--text3)" }}>Your answer:</strong> {h.answer.slice(0,150)}{h.answer.length > 150 ? "..." : ""}</p>
              <div className="report-grid">
                <div className="fb-box good">
                  <span className="fb-box-label">✓ Strengths</span>
                  <p>{h.strengths}</p>
                </div>
                <div className="fb-box bad">
                  <span className="fb-box-label">✗ Weaknesses</span>
                  <p>{h.weaknesses}</p>
                </div>
              </div>
              <div className="fb-box ideal">
                <span className="fb-box-label">💡 Ideal Answer</span>
                <p>{h.idealAnswer}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="restart-btn" onClick={onRestart}>Start New Session</button>
      </div>
    </div>
  );
}