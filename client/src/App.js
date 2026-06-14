import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useInterview } from "./hooks/useInterview";
import AuthPage from "./pages/AuthPage";
import SetupPage from "./pages/SetupPage";
import InterviewPage from "./pages/InterviewPage";
import ResultsPage from "./pages/ResultsPage";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";

export default function App() {
  const { user, loading:authLoading, error:authError, register, login, logout } = useAuth();
  const [appPhase, setAppPhase]           = useState("dashboard");
  const [sessionPurpose, setSessionPurpose] = useState("practice");
  const [sessionRole, setSessionRole]     = useState("");
  const [sessionMeta, setSessionMeta]     = useState(null);

  const {
    phase, question, topic, questionType, mcqOptions,
    answer, setAnswer, questionNumber,
    evaluation, followUp, weakTopic, summary,
    loading, error, dailyGoal, questionsAnswered,
    startSession, submitAnswer, nextQuestion, endSession, reset,
  } = useInterview(user);

  if (!user) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        loading={authLoading}
        error={authError}
      />
    );
  }

  if (appPhase === "dashboard") {
    return (
      <DashboardPage
        user={user}
        onStartNew={() => { reset(); setAppPhase("interview"); }}
        onLogout={logout}
      />
    );
  }

  const handleStart = (role, difficulty, qType, purpose, meta) => {
    setSessionPurpose(purpose);
    setSessionRole(role);
    setSessionMeta(meta);
    startSession(role, difficulty, qType, purpose, meta);
  };

  return (
    <div className="app">
      {phase === "setup" && (
        <SetupPage
          onStart={handleStart}
          loading={loading}
          error={error}
        />
      )}
      {phase === "interview" && (
        <InterviewPage
          question={question}
          topic={topic}
          questionType={questionType}
          mcqOptions={mcqOptions}
          answer={answer}
          setAnswer={setAnswer}
          questionNumber={questionNumber}
          evaluation={evaluation}
          followUp={followUp}
          weakTopic={weakTopic}
          loading={loading}
          error={error}
          dailyGoal={dailyGoal}
          questionsAnswered={questionsAnswered}
          purpose={sessionPurpose}
          role={sessionRole}
          purposeMeta={sessionMeta}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          onEnd={endSession}
        />
      )}
      {phase === "result" && (
        <ResultsPage
          summary={summary}
          onRestart={() => { reset(); setAppPhase("dashboard"); }}
        />
      )}
    </div>
  );
}