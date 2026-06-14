import React from "react";

const COLORS = {
  DSA:     { bg:"rgba(99,102,241,0.12)",  border:"rgba(99,102,241,0.35)",  text:"#818cf8" },
  OOP:     { bg:"rgba(34,197,94,0.1)",    border:"rgba(34,197,94,0.3)",    text:"#22c55e" },
  DBMS:    { bg:"rgba(245,158,11,0.1)",   border:"rgba(245,158,11,0.3)",   text:"#f59e0b" },
  OS:      { bg:"rgba(239,68,68,0.1)",    border:"rgba(239,68,68,0.3)",    text:"#ef4444" },
  CN:      { bg:"rgba(59,130,246,0.1)",   border:"rgba(59,130,246,0.3)",   text:"#3b82f6" },
  General: { bg:"rgba(168,85,247,0.1)",   border:"rgba(168,85,247,0.3)",   text:"#a855f7" },
};

const DEFAULT = { bg:"rgba(100,116,139,0.1)", border:"rgba(100,116,139,0.3)", text:"#64748b" };

export default function TopicTag({ topic }) {
  const c = COLORS[topic] || DEFAULT;
  return (
    <span className="topic-chip" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      {topic || "General"}
    </span>
  );
}