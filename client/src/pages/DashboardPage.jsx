import React, { useEffect, useState } from "react";
import { getUserHistory } from "../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import TopicTag from "../components/TopicTag";

const BAND_COLORS = { Excellent:"#22c55e", Good:"#3b82f6", Average:"#f59e0b", "Needs Improvement":"#ef4444" };
const TOPIC_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#a855f7"];
const TOPICS = ["DSA","OOP","DBMS","OS","CN","General"];

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

export default function DashboardPage({ user, onStartNew, onLogout }) {
  const [sessions, setSessions]        = useState([]);
  const [loading, setLoading]          = useState(true);
  const [selected, setSelected]        = useState(null);

  useEffect(() => {
    getUserHistory(user._id)
      .then(res => setSessions(res.data.sessions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user._id]);

  const allScores    = sessions.flatMap(s => s.history.map(h => h.score));
  const overallAvg   = allScores.length ? parseFloat((allScores.reduce((a,b)=>a+b,0)/allScores.length).toFixed(1)) : null;

  const globalTopicData = TOPICS.map(topic => {
    const scores = sessions.flatMap(s => s.performance?.[topic] || []);
    return { topic, avg: getAvg(scores), count: scores.length };
  }).filter(t => t.count > 0);

  const tooltipStyle = {
    contentStyle: { background:"#111827", border:"0.5px solid rgba(99,179,237,0.14)", borderRadius:8 },
    labelStyle: { color:"#e2e8f0", fontSize:12 },
    itemStyle: { color:"#94a3b8", fontSize:12 },
  };

  if (loading) return <div className="dash-loading">Loading your history...</div>;

  if (selected) return <SessionReport session={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="dashboard-page">
      <nav className="dash-nav">
        <div className="dash-brand">
          <div className="dash-logo">AI</div>
          <div>
            <span className="dash-wordmark">Dashboard</span>
            <span className="dash-sub"> / {user.name}</span>
          </div>
        </div>
        <div className="dash-nav-right">
          <span className="dash-user">👤 {user.name}</span>
          <button className="new-session-btn" onClick={onStartNew}>+ New Session</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="dash-body">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Sessions</div>
            <div className="stat-value">{sessions.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Questions</div>
            <div className="stat-value">{allScores.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Score</div>
            <div className="stat-value" style={{ color: overallAvg >= 7 ? "#22c55e" : overallAvg >= 4 ? "#f59e0b" : "#ef4444" }}>
              {overallAvg ?? "—"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overall Band</div>
            <div className="stat-value" style={{ fontSize:20, color: overallAvg ? BAND_COLORS[getOverallBand(overallAvg)] : "var(--text4)" }}>
              {overallAvg ? getOverallBand(overallAvg) : "—"}
            </div>
          </div>
        </div>

        {/* Topic chart */}
        {globalTopicData.length > 0 && (
          <div className="chart-card">
            <div className="chart-title">Performance by Topic — All Sessions</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={globalTopicData} margin={{ top:8, right:8, left:-16, bottom:0 }}>
                <XAxis dataKey="topic" tick={{ fill:"#64748b", fontSize:11, fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,10]} tick={{ fill:"#64748b", fontSize:10, fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avg" radius={[4,4,0,0]}>
                  {globalTopicData.map((_,i) => <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sessions list */}
        <div className="sessions-section">
          <span className="sessions-title">Session History</span>

          {sessions.length === 0 && (
            <div className="empty-state">No sessions yet. Start your first interview!</div>
          )}

          {(() => {
            const grouped = {};
            sessions.forEach(s => {
              const key = new Date(s.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(s);
            });

            return Object.entries(grouped).map(([date, dateSessions]) => (
              <div key={date}>
                <div className="date-group-header">
                  <div className="date-group-line" />
                  <span className="date-group-label">{date}</span>
                  <div className="date-group-line" />
                </div>
                {dateSessions.map((s, i) => {
                  const scores = s.history.map(h => h.score);
                  const avg    = getAvg(scores);
                  const band   = avg ? getOverallBand(avg) : null;
                  const time   = new Date(s.createdAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
                  const purposeEmoji = s.purpose === "exam" ? "📚" : s.purpose === "company" ? "🏢" : "🎯";
                  const qtLabel = s.questionType === "mcq" ? "MCQ" : s.questionType === "fillblank" ? "Fill Blank" : "Open Ended";
                  return (
                    <div key={s._id || i} className="session-card" onClick={() => setSelected(s)}>
                      <div className="sc-left">
                        <span className="sc-role">{s.role}</span>
                        <span className="sc-meta">{s.difficulty} · {qtLabel} · {purposeEmoji} · {time}</span>
                      </div>
                      <div className="sc-right">
                        <span className="sc-qs">{s.history.length} Qs</span>
                        {avg && (
                          <span className="sc-avg" style={{ color: BAND_COLORS[band] }}>{avg}/10</span>
                        )}
                        <span className="sc-arrow">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}

/* ── Session Report ── */
function SessionReport({ session, onBack }) {
  const scores = session.history.map(h => h.score);
  const avg    = scores.length ? parseFloat((scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1)) : null;
  const band   = avg ? (avg >= 8 ? "Excellent" : avg >= 6 ? "Good" : avg >= 4 ? "Average" : "Needs Improvement") : null;
  const BAND_COLORS = { Excellent:"#22c55e", Good:"#3b82f6", Average:"#f59e0b", "Needs Improvement":"#ef4444" };
  const TOPIC_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#a855f7"];
  const TOPICS = ["DSA","OOP","DBMS","OS","CN","General"];

  const topicData = TOPICS.map(topic => {
    const s = session.performance?.[topic] || [];
    const a = s.length ? parseFloat((s.reduce((x,y)=>x+y,0)/s.length).toFixed(1)) : null;
    return { topic, avg: a, count: s.length };
  }).filter(t => t.count > 0);

  const tooltipStyle = {
    contentStyle: { background:"#111827", border:"0.5px solid rgba(99,179,237,0.14)", borderRadius:8 },
    labelStyle: { color:"#e2e8f0", fontSize:12 },
    itemStyle: { color:"#94a3b8", fontSize:12 },
  };

  return (
    <div className="dashboard-page">
      <nav className="dash-nav">
        <div className="dash-brand">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span className="dash-wordmark" style={{ marginLeft:12 }}>{session.role}</span>
        </div>
        <div className="dash-nav-right">
          <span className="sc-meta">{session.difficulty} · {session.questionType === "mcq" ? "MCQ" : session.questionType === "fillblank" ? "Fill Blank" : "Open Ended"}</span>
        </div>
      </nav>

      <div className="dash-body">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Questions</div>
            <div className="stat-value">{session.history.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Score</div>
            <div className="stat-value" style={{ color: avg >= 7 ? "#22c55e" : avg >= 4 ? "#f59e0b" : "#ef4444" }}>{avg ?? "—"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Band</div>
            <div className="stat-value" style={{ fontSize:20, color: band ? BAND_COLORS[band] : "var(--text4)" }}>{band ?? "—"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Status</div>
            <div className="stat-value" style={{ fontSize:16, color: session.isActive ? "#f59e0b" : "#22c55e" }}>
              {session.isActive ? "In Progress" : "Completed"}
            </div>
          </div>
        </div>

        {topicData.length > 0 && (
          <div className="chart-card">
            <div className="chart-title">Score by Topic</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topicData} margin={{ top:8, right:8, left:-16, bottom:0 }}>
                <XAxis dataKey="topic" tick={{ fill:"#64748b", fontSize:11, fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,10]} tick={{ fill:"#64748b", fontSize:10, fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avg" radius={[4,4,0,0]}>
                  {topicData.map((_,i) => <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="sessions-section">
          <span className="sessions-title">Detailed Question Report</span>
          {session.history.map((h, i) => (
            <div key={i} className="report-item">
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--text4)" }}>Q{i+1}</span>
                <TopicTag topic={h.topic} />
                <span style={{
                  marginLeft:"auto",
                  fontFamily:"JetBrains Mono",
                  fontSize:14,
                  fontWeight:600,
                  color: h.score >= 7 ? "#22c55e" : h.score >= 4 ? "#f59e0b" : "#ef4444"
                }}>{h.score}/10</span>
              </div>
              <p className="report-q">{h.question}</p>
              <p className="report-a"><strong style={{ color:"var(--text3)" }}>Your answer:</strong> {h.answer}</p>
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
      </div>
    </div>
  );
}