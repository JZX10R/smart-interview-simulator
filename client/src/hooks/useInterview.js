import { useState, useCallback } from "react";
import * as api from "../utils/api";

export function useInterview(user) {
  const [sessionId, setSessionId]               = useState(null);
  const [question, setQuestion]                 = useState("");
  const [topic, setTopic]                       = useState("");
  const [questionType, setQuestionType]         = useState("openended");
  const [mcqOptions, setMcqOptions]             = useState(null);
  const [correctAnswer, setCorrectAnswer]       = useState(null);
  const [acceptedAnswers, setAcceptedAnswers]   = useState(null);
  const [explanation, setExplanation]           = useState(null);
  const [answer, setAnswer]                     = useState("");
  const [evaluation, setEvaluation]             = useState(null);
  const [followUp, setFollowUp]                 = useState(null);
  const [weakTopic, setWeakTopic]               = useState(null);
  const [summary, setSummary]                   = useState(null);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState(null);
  const [phase, setPhase]                       = useState("setup");
  const [questionNumber, setQuestionNumber]     = useState(0);
  const [dailyGoal, setDailyGoal]               = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const [pendingQuestion, setPendingQuestion]               = useState(null);
  const [pendingTopic, setPendingTopic]                     = useState(null);
  const [pendingType, setPendingType]                       = useState(null);
  const [pendingOptions, setPendingOptions]                 = useState(null);
  const [pendingCorrectAnswer, setPendingCorrectAnswer]     = useState(null);
  const [pendingAcceptedAnswers, setPendingAcceptedAnswers] = useState(null);
  const [pendingExplanation, setPendingExplanation]         = useState(null);

  const updateStreak = () => {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastDate  = localStorage.getItem("practice_last_date");
    const streak    = parseInt(localStorage.getItem("practice_streak") || "0");

    if (lastDate === today) return;
    if (lastDate === yesterday) {
      localStorage.setItem("practice_streak", streak + 1);
    } else {
      localStorage.setItem("practice_streak", 1);
    }
    localStorage.setItem("practice_last_date", today);
  };

  const startSession = useCallback(async (role, difficulty, questionType, purpose, purposeMeta) => {
    try {
      setLoading(true); setError(null);
      const res = await api.startSession(user._id, role, difficulty, questionType, purpose, purposeMeta);
      const { sessionId, question, topic, type, options, correctAnswer, acceptedAnswers, explanation } = res.data;

      setSessionId(sessionId);
      setQuestion(question); setTopic(topic);
      setQuestionType(type || questionType);
      setMcqOptions(options || null);
      setCorrectAnswer(correctAnswer || null);
      setAcceptedAnswers(acceptedAnswers || null);
      setExplanation(explanation || null);
      setQuestionNumber(1);
      setQuestionsAnswered(0);
      setEvaluation(null); setFollowUp(null); setAnswer("");

      // Save daily goal and update streak for practice sessions
      if (purpose === "practice") {
        setDailyGoal(purposeMeta?.dailyGoal || 0);
        updateStreak();
      }

      setPhase("interview");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start session");
    } finally { setLoading(false); }
  }, [user]);

  const submitAnswer = useCallback(async () => {
    if (!answer.trim()) return;
    try {
      setLoading(true); setError(null);
      const payload = {
        sessionId, question, answer, questionType,
        mcqData: questionType === "mcq"
          ? { correctAnswer, explanation, topic } : null,
        fillBlankData: questionType === "fillblank"
          ? { correctAnswer, acceptedAnswers, explanation, topic } : null,
      };
      const res = await api.submitAnswer(payload);
      const {
        evaluation, followUp, weakTopic,
        nextQuestion, nextTopic, nextType,
        nextOptions, nextCorrectAnswer,
        nextAcceptedAnswers, nextExplanation,
      } = res.data;

      setPendingQuestion(nextQuestion);
      setPendingTopic(nextTopic);
      setPendingType(nextType || questionType);
      setPendingOptions(nextOptions || null);
      setPendingCorrectAnswer(nextCorrectAnswer || null);
      setPendingAcceptedAnswers(nextAcceptedAnswers || null);
      setPendingExplanation(nextExplanation || null);

      setAnswer("");
      setWeakTopic(weakTopic);
      setFollowUp(followUp || null);
      setEvaluation(evaluation);
      setQuestionsAnswered(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit answer");
    } finally { setLoading(false); }
  }, [sessionId, question, answer, questionType, correctAnswer, acceptedAnswers, explanation, topic]);

  const nextQuestion = useCallback(() => {
    setQuestion(pendingQuestion);
    setTopic(pendingTopic);
    setQuestionType(pendingType || questionType);
    setMcqOptions(pendingOptions);
    setCorrectAnswer(pendingCorrectAnswer);
    setAcceptedAnswers(pendingAcceptedAnswers);
    setExplanation(pendingExplanation);
    setEvaluation(null); setFollowUp(null); setAnswer("");
    setQuestionNumber(n => n + 1);
  }, [pendingQuestion, pendingTopic, pendingType, pendingOptions, pendingCorrectAnswer, pendingAcceptedAnswers, pendingExplanation, questionType]);

  const endSession = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.endSession(sessionId);
      setSummary(res.data); setPhase("result");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to end session");
    } finally { setLoading(false); }
  }, [sessionId]);

  const reset = useCallback(() => {
    setSessionId(null); setQuestion(""); setTopic(""); setAnswer("");
    setQuestionType("openended"); setMcqOptions(null);
    setCorrectAnswer(null); setAcceptedAnswers(null); setExplanation(null);
    setEvaluation(null); setFollowUp(null); setWeakTopic(null);
    setSummary(null); setError(null); setPhase("setup");
    setQuestionNumber(0); setQuestionsAnswered(0); setDailyGoal(0);
    setPendingQuestion(null); setPendingTopic(null); setPendingType(null);
    setPendingOptions(null); setPendingCorrectAnswer(null);
    setPendingAcceptedAnswers(null); setPendingExplanation(null);
  }, []);

  return {
    phase, question, topic, questionType, mcqOptions,
    answer, setAnswer, questionNumber,
    evaluation, followUp, weakTopic, summary,
    loading, error, dailyGoal, questionsAnswered,
    startSession, submitAnswer, nextQuestion, endSession, reset,
  };
}