import React, { useState, useEffect, useRef } from "react";
import TopicTag from "../components/TopicTag";
import ScoreBadge from "../components/ScoreBadge";
import VoiceInterviewer from "../components/VoiceInterviewer";
import { useVoiceInterview } from "../hooks/useVoiceInterview";

const TIME_LIMIT = 120;

export default function InterviewPage({
  question, topic, questionType, mcqOptions,
  answer, setAnswer, questionNumber,
  evaluation, followUp, weakTopic,
  loading, error, dailyGoal, questionsAnswered,
  purpose, role, purposeMeta,
  onSubmit, onNext, onEnd,
}) {
  const [selected, setSelected]     = useState("");
  const [timeLeft, setTimeLeft]     = useState(TIME_LIMIT);
  const [timeUp, setTimeUp]         = useState(false);
  const timerRef                    = useRef(null);
  const showFeedback                = !!evaluation && !loading;

  // Voice available for practice + company, open ended only
  const canUseVoice = (purpose === "practice" || purpose === "company") && questionType === "openended";

  const voiceHook = useVoiceInterview();
  const { voiceMode, toggleVoiceMode, isSupported } = voiceHook;

  // Timer — disabled in voice mode
  useEffect(() => {
    if (voiceMode) { clearInterval(timerRef.current); return; }
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIME_LIMIT);
    setTimeUp(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setTimeUp(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [questionNumber, voiceMode]);

  useEffect(() => {
    if (showFeedback && timerRef.current) clearInterval(timerRef.current);
  }, [showFeedback]);

  const handleSelect = k => { setSelected(k); setAnswer(k); };

  const handleNext = () => {
    setSelected("");
    setTimeUp(false);
    onNext();
  };

  // Voice submits transcript as the answer
  const handleVoiceSubmit = (transcriptText) => {
    setAnswer(transcriptText);
    setTimeout(() => onSubmit(), 80);
  };

  const timerColor =
    timeLeft > 60 ? "var(--green)" :
    timeLeft > 30 ? "var(--amber)" : "var(--red)";

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const qtLabel = questionType === "mcq" ? "MCQ" : questionType === "fillblank" ? "Fill Blank" : "Open Ended";

  const companyName = purposeMeta?.companyName || "";

  return (
    <div className="interview-page">

      {/* ── Nav ── */}
      <nav className="interview-nav">
        <div className="nav-brand">
          <div className="nav-logo">AI</div>
          <span className="nav-title">
            {purpose === "company" && companyName
              ? `${companyName} Interview`
              : purpose === "company"
              ? "Company Interview"
              : "AI Interviewer"}
          </span>
        </div>
        <div className="nav-right">
          {weakTopic && <span className="nav-badge nb-focus">Focus: {weakTopic}</span>}
          <span className="nav-badge nb-type">{qtLabel}</span>

          {/* Voice toggle */}
          {canUseVoice && isSupported && (
            <button
              className={`voice-toggle-btn ${voiceMode ? "active" : ""}`}
              onClick={toggleVoiceMode}
              title={voiceMode ? "Switch to text mode" : "Switch to voice mode"}
            >
              {voiceMode ? "🎤 Voice ON" : "🎤 Voice"}
            </button>
          )}

          {!voiceMode && !showFeedback && (
            <span className="timer-display" style={{ color:timerColor, borderColor:timerColor }}>
              ⏱ {fmt(timeLeft)}
            </span>
          )}
          <span className="q-counter">Q{questionNumber}</span>
          <button className="end-btn" onClick={onEnd} disabled={loading}>End Session</button>
        </div>
      </nav>

      {/* Daily goal progress */}
      {dailyGoal > 0 && (
        <div className="goal-progress-bar">
          <div
            className="goal-progress-fill"
            style={{ width:`${Math.min((questionsAnswered/dailyGoal)*100, 100)}%` }}
          />
        </div>
      )}

      <div className="interview-body">

        {/* ══ VOICE MODE ══ */}
        {voiceMode && canUseVoice && (
          <VoiceInterviewer
            question={question}
            questionNumber={questionNumber}
            topic={topic}
            voiceHook={voiceHook}
            onSubmitAnswer={handleVoiceSubmit}
            evaluation={evaluation}
            loading={loading}
            onNext={handleNext}
            purpose={purpose}
            role={role}
            companyName={companyName}
            sessionContext={
              purpose === "company"
                ? `Company interview at ${companyName || "a company"} for role: ${role}. Topic: ${topic}`
                : `Practice interview for role: ${role || "General"}. Topic: ${topic}`
            }
          />
        )}

        {/* ══ TEXT MODE ══ */}
        {!voiceMode && (
          <>
            {/* Question */}
            <div className="question-card">
              <div className="q-meta">
                <TopicTag topic={topic} />
                <span className="q-num">Question {questionNumber}</span>
              </div>
              <p className="question-text">{question}</p>
            </div>

            {timeUp && !showFeedback && (
              <div className="timeup-banner">⏰ Time's up — you can still submit your answer</div>
            )}

            {/* Feedback */}
            {showFeedback && (
              <div className="feedback-card">
                <div className="fb-header">
                  <span className="fb-verdict" style={{
                    color: evaluation.isCorrect === true  ? "var(--green)" :
                           evaluation.isCorrect === false ? "var(--red)"   : "var(--text)",
                  }}>
                    {evaluation.isCorrect === true  ? "✓ Correct"   :
                     evaluation.isCorrect === false ? "✗ Incorrect" : "Evaluation"}
                  </span>
                  <ScoreBadge score={evaluation.score} />
                </div>

                <div className="fb-grid">
                  <div className="fb-box good">
                    <span className="fb-box-label">✓ Strengths</span>
                    <p>{evaluation.strengths}</p>
                  </div>
                  <div className="fb-box bad">
                    <span className="fb-box-label">✗ Weaknesses</span>
                    <p>{evaluation.weaknesses}</p>
                  </div>
                </div>

                <div className="fb-box ideal">
                  <span className="fb-box-label">
                    💡 {questionType === "openended" ? "Ideal Answer" : "Explanation"}
                  </span>
                  <p>{evaluation.idealAnswer}</p>
                </div>

                {followUp && (
                  <div className="followup-box">
                    <span className="fb-box-label">↪ Follow-up</span>
                    <p>{followUp}</p>
                  </div>
                )}

                <button className="next-btn" onClick={handleNext}>Next Question →</button>
              </div>
            )}

            {/* Input */}
            {!showFeedback && (
              <div className="answer-section">
                {questionType === "mcq" && mcqOptions && (
                  <div className="mcq-list">
                    {Object.entries(mcqOptions).map(([k,v]) => (
                      <button
                        key={k}
                        className={`mcq-btn ${selected === k ? "selected" : ""}`}
                        onClick={() => handleSelect(k)}
                        disabled={loading}
                      >
                        <span className="mcq-key">{k}</span>
                        <span className="mcq-val">{v}</span>
                      </button>
                    ))}
                  </div>
                )}

                {questionType === "fillblank" && (
                  <>
                    <span className="answer-label">Your Answer</span>
                    <input
                      className="fill-input"
                      type="text"
                      placeholder="Type your answer..."
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      disabled={loading}
                      onKeyDown={e => e.key === "Enter" && onSubmit()}
                    />
                  </>
                )}

                {questionType === "openended" && (
                  <>
                    <span className="answer-label">Your Answer</span>
                    <textarea
                      className="answer-textarea"
                      placeholder="Write your answer here..."
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      rows={7}
                      disabled={loading}
                    />
                  </>
                )}

                {error && <div className="error-banner">{error}</div>}

                <div className="answer-actions">
                  <span className="char-info">
                    {questionType === "mcq"
                      ? selected ? `Selected: ${selected}` : "Select an option"
                      : `${answer.length} chars`}
                  </span>
                  <button
                    className="submit-btn"
                    onClick={onSubmit}
                    disabled={loading || !answer.trim()}
                  >
                    {loading ? "Evaluating..." : "Submit Answer"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}