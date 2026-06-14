const TOPICS = ["DSA", "OOP", "DBMS", "OS", "CN", "General"];

// ── Update performance map after each answer ──────────────────────────────────
function updatePerformance(session, topic, score) {
  const validTopic = TOPICS.includes(topic) ? topic : "General";
  session.performance[validTopic].push(score);
}

// ── Return the topic the user is weakest in ───────────────────────────────────
function getWeakTopic(session) {
  let weakest = null;
  let minAvg = Infinity;

  for (const topic of TOPICS) {
    const scores = session.performance[topic];
    if (!scores || scores.length === 0) continue;

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg < minAvg) {
      minAvg = avg;
      weakest = topic;
    }
  }

  return weakest || "DSA"; // default fallback
}

// ── Build a topic-by-topic summary ───────────────────────────────────────────
function getPerformanceSummary(session) {
  const summary = {};

  for (const topic of TOPICS) {
    const scores = session.performance[topic];
    if (!scores || scores.length === 0) {
      summary[topic] = { avg: null, count: 0 };
      continue;
    }
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    summary[topic] = { avg: parseFloat(avg.toFixed(1)), count: scores.length };
  }

  return summary;
}

// ── Determine overall band ────────────────────────────────────────────────────
function getOverallBand(session) {
  const allScores = Object.values(session.performance).flat();
  if (!allScores.length) return "Not enough data";

  const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  if (avg >= 8) return "Excellent";
  if (avg >= 6) return "Good";
  if (avg >= 4) return "Average";
  return "Needs Improvement";
}

module.exports = { updatePerformance, getWeakTopic, getPerformanceSummary, getOverallBand };
