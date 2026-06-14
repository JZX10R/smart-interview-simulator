import React from "react";

export default function ScoreBadge({ score }) {
  const color =
    score >= 8 ? "var(--green)" :
    score >= 5 ? "var(--amber)" : "var(--red)";
  return (
    <div className="score-ring" style={{ borderColor: color, color }}>
      <span className="score-n">{score}</span>
      <span className="score-d">/10</span>
    </div>
  );
}