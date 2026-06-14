import React, { useState, useEffect, useRef } from "react";

// ── Interviewer intros ────────────────────────────────────────────────────────
function getIntro(questionNumber, question, purpose, role, companyName) {
  if (questionNumber === 1) {
    if (purpose === "company" && companyName) {
      return `Hello, and welcome. I am your interviewer today for the ${role} position at ${companyName}. Let us begin. Here is your first question. ${question}`;
    }
    if (purpose === "company") {
      return `Hello, and welcome to your company interview practice. I am your interviewer today. Let us get started. ${question}`;
    }
    return `Welcome to your practice session. I am your AI interviewer. Let us begin with your first question. ${question}`;
  }
  const transitions = [
    `Good. Let us move on. ${question}`,
    `Alright. Next question. ${question}`,
    `Thank you. Here is your next question. ${question}`,
    `Good effort. Moving on. ${question}`,
    `Understood. Next up. ${question}`,
  ];
  return transitions[questionNumber % transitions.length];
}

// ── Feedback speech ───────────────────────────────────────────────────────────
function getFeedbackSpeech(evaluation) {
  const score    = evaluation.score;
  const strength = evaluation.strengths && evaluation.strengths !== "None." ? evaluation.strengths : null;
  const weakness = evaluation.weaknesses && evaluation.weaknesses !== "None." ? evaluation.weaknesses : null;

  let opener;
  if (score >= 9)      opener = "Excellent answer. Very well done.";
  else if (score >= 7) opener = "Good answer. You have the right idea.";
  else if (score >= 5) opener = "A reasonable attempt, but there are some gaps.";
  else if (score >= 3) opener = "You are on the right track, but the answer needs more depth.";
  else                 opener = "That answer needs significant improvement. Let me explain.";

  const parts = [opener];
  if (strength) parts.push(strength);
  if (weakness) parts.push("However, " + weakness);
  const ideal = evaluation.idealAnswer?.slice(0, 300);
  if (ideal)    parts.push("The ideal answer would be: " + ideal);

  return parts.join(" ");
}

export default function VoiceInterviewer({
  question,
  questionNumber,
  topic,
  voiceHook,
  onSubmitAnswer,
  evaluation,
  loading,
  onNext,
  sessionContext,
  purpose,
  role,
  companyName,
}) {
  const {
    isSupported, isSpeaking, isListening,
    transcript, interimText, voiceError, aiThinking,
    speak, stopSpeaking,
    startListening, stopListening,
    askAI, clearTranscript, setTranscript,
  } = voiceHook;

  const [userQuery, setUserQuery]   = useState("");
  const [showAskBox, setShowAskBox] = useState(false);
  const [hasSpoken, setHasSpoken]   = useState(false);
  const prevQRef                    = useRef(null);
  const prevEvalRef                 = useRef(null);

  // ── Speak question when it changes ───────────────────────────────────────
  useEffect(() => {
    if (!question || question === prevQRef.current) return;
    prevQRef.current = question;
    setHasSpoken(false);
    clearTranscript();
    setShowAskBox(false);
    setUserQuery("");

    const introText = getIntro(questionNumber, question, purpose, role, companyName);

    // Fallback: mark hasSpoken after 8 seconds if TTS never fires onDone
    const fallbackTimer = setTimeout(() => setHasSpoken(true), 8000);

    const t = setTimeout(() => {
      speak(introText, () => {
        clearTimeout(fallbackTimer);
        setHasSpoken(true);
      });
    }, 400);

    return () => {
      clearTimeout(t);
      clearTimeout(fallbackTimer);
    };
  }, [question, questionNumber]);

  // ── Speak feedback when evaluation arrives ────────────────────────────────
  useEffect(() => {
    if (!evaluation || evaluation === prevEvalRef.current) return;
    prevEvalRef.current = evaluation;
    const t = setTimeout(() => {
      speak(getFeedbackSpeech(evaluation));
    }, 300);
    return () => clearTimeout(t);
  }, [evaluation]);

  const handleMicClick = () => {
    if (isListening) stopListening();
    else { if (isSpeaking) stopSpeaking(); startListening(); }
  };

  const handleSubmit = () => {
    if (!transcript.trim()) return;
    onSubmitAnswer(transcript.trim());
  };

  const handleAskAI = () => {
    if (!userQuery.trim()) return;
    askAI(userQuery, sessionContext);
    setUserQuery("");
    setShowAskBox(false);
  };

  const replayQuestion = () => {
    stopSpeaking();
    setTimeout(() => speak(`Question ${questionNumber}: ${question}`), 100);
  };

  if (!isSupported) {
    return (
      <div className="voice-unsupported">
        <span style={{ fontSize:24 }}>🎤</span>
        <p>Voice mode requires Chrome or Edge browser.</p>
      </div>
    );
  }

  const showFeedback = !!evaluation && !loading;

  const statusText =
    aiThinking   ? "Thinking..."              :
    isSpeaking   ? "Interviewer speaking..."  :
    isListening  ? "Listening..."             :
    loading      ? "Evaluating your answer..." :
    showFeedback ? "Feedback ready"            :
    hasSpoken    ? "Your turn to answer"       : "Preparing...";

  return (
    <div className="voice-interviewer">

      {/* ── Avatar ── */}
      <div className="vi-avatar-section">
        <div className={`vi-avatar ${isSpeaking ? "speaking" : ""} ${aiThinking || loading ? "thinking" : ""}`}>
          <div className="vi-avatar-inner">
            <span className="vi-avatar-icon">
              {purpose === "company" ? "👔" : "🤖"}
            </span>
          </div>
          {isSpeaking && (
            <div className="vi-sound-waves">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="vi-wave" style={{ animationDelay:`${i * 0.08}s` }} />
              ))}
            </div>
          )}
        </div>
        <div className="vi-status-text">{statusText}</div>
        <div className="vi-interviewer-label">
          {purpose === "company" && companyName
            ? `${companyName} Interviewer`
            : purpose === "company"
            ? "Company Interviewer"
            : "AI Practice Interviewer"}
        </div>
      </div>

      {/* ── Question card ── */}
      <div className="vi-question-card">
        <div className="vi-q-meta">
          <span className="vi-topic-chip">{topic}</span>
          <span className="vi-q-num">Q{questionNumber}</span>
          <button className="vi-replay-btn" onClick={replayQuestion} title="Replay question">
            🔊 Replay
          </button>
        </div>
        <p className="vi-question-text">{question}</p>
      </div>

      {voiceError && <div className="vi-error">{voiceError}</div>}

      {/* ── Feedback ── */}
      {showFeedback && (
        <div className="vi-feedback">
          <div className="vi-feedback-header">
            <span style={{
              color: evaluation.score >= 7 ? "var(--green)" :
                     evaluation.score >= 4 ? "var(--amber)" : "var(--red)",
              fontSize: 15, fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
            }}>
              {evaluation.score >= 9 ? "Excellent —" :
               evaluation.score >= 7 ? "Good —"      :
               evaluation.score >= 5 ? "Needs work —":
               evaluation.score >= 3 ? "Weak —"      : "Incorrect —"} {evaluation.score}/10
            </span>
            <div style={{ display:"flex", gap:8 }}>
              <button className="vi-speak-btn" onClick={() => speak(getFeedbackSpeech(evaluation))}>
                🔊 Replay feedback
              </button>
              <button className="vi-speak-btn" onClick={() => speak(evaluation.idealAnswer || "")}>
                💡 Ideal answer
              </button>
            </div>
          </div>

          <div className="vi-fb-grid">
            <div className="vi-fb-box good">
              <span className="vi-fb-label">✓ Strengths</span>
              <p>{evaluation.strengths}</p>
            </div>
            <div className="vi-fb-box bad">
              <span className="vi-fb-label">✗ Weaknesses</span>
              <p>{evaluation.weaknesses}</p>
            </div>
          </div>

          <div className="vi-fb-ideal">
            <span className="vi-fb-label">💡 Ideal Answer</span>
            <p>{evaluation.idealAnswer}</p>
          </div>

          <button className="vi-next-btn" onClick={onNext}>
            Next Question →
          </button>
        </div>
      )}

      {/* ── Answer section ── */}
      {!showFeedback && (
        <div className="vi-answer-section">

          {/* Transcript display */}
          <div className={`vi-transcript-box ${isListening ? "listening" : ""}`}>
            <div className="vi-transcript-label">
              Your Answer
              {transcript && (
                <button className="vi-clear-btn" onClick={clearTranscript}>Clear</button>
              )}
            </div>
            <div className="vi-transcript-text">
              {transcript || interimText ? (
                <>
                  <span style={{ color:"var(--text)" }}>{transcript}</span>
                  <span style={{ color:"var(--text4)", fontStyle:"italic" }}>{interimText}</span>
                </>
              ) : (
                <span className="vi-transcript-placeholder">
                  {isListening
                    ? "🔴 Listening... speak your answer"
                    : "Click the microphone and speak your answer"}
                </span>
              )}
            </div>
          </div>

          {/* Editable transcript */}
          {transcript && !isListening && (
            <div>
              <span className="answer-label" style={{ marginBottom:6, display:"block" }}>
                Edit if needed before submitting
              </span>
              <textarea
                className="vi-edit-transcript"
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Controls */}
          <div className="vi-controls">
            <div className="vi-left-controls">
              <button
                className={`vi-mic-btn ${isListening ? "listening" : ""}`}
                onClick={handleMicClick}
                disabled={loading || isSpeaking}
              >
                <span className="vi-mic-icon">{isListening ? "⏹" : "🎤"}</span>
                <span className="vi-mic-label">{isListening ? "Stop" : "Speak"}</span>
              </button>

              <button className="vi-ask-btn" onClick={() => setShowAskBox(!showAskBox)}>
                💬 Ask Interviewer
              </button>
            </div>

            <button
              className="vi-submit-btn"
              onClick={handleSubmit}
              disabled={loading || !transcript.trim() || isListening}
            >
              {loading ? "Evaluating..." : "Submit Answer"}
            </button>
          </div>

          {/* Ask AI panel */}
          {showAskBox && (
            <div className="vi-ask-box">
              <div className="vi-ask-label">Ask the interviewer</div>
              <div className="vi-ask-examples">
                {[
                  "Can you give me a hint?",
                  "Can you repeat the question?",
                  "What does this term mean?",
                  "How detailed should my answer be?",
                  "Am I on the right track?",
                ].map(ex => (
                  <button
                    key={ex}
                    className="vi-ask-example"
                    onClick={() => setUserQuery(ex)}
                  >{ex}</button>
                ))}
              </div>
              <div className="vi-ask-input-row">
                <input
                  className="vi-ask-input"
                  type="text"
                  placeholder="Ask anything..."
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAskAI()}
                />
                <button
                  className="vi-ask-send"
                  onClick={handleAskAI}
                  disabled={aiThinking || !userQuery.trim()}
                >
                  {aiThinking ? "..." : "Ask →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}