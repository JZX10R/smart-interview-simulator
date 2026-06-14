const Session = require("../models/sessionModel");
const {
  generateQuestion, generateMCQ, generateFillBlank,
  evaluateAnswer, evaluateMCQ, evaluateFillBlank,
  generateFollowUp,
} = require("../services/aiService");
const {
  updatePerformance, getWeakTopic,
  getPerformanceSummary, getOverallBand,
} = require("../services/performanceService");

async function getNextQuestion(role, difficulty, questionType, topic, askedQuestions, askedTopics, purpose, purposeMeta) {
  if (questionType === "mcq") {
    const q = await generateMCQ(role, difficulty, topic, askedQuestions, askedTopics, purpose, purposeMeta);
    return { ...q, type: "mcq" };
  }
  if (questionType === "fillblank") {
    const q = await generateFillBlank(role, difficulty, topic, askedQuestions, askedTopics, purpose, purposeMeta);
    return { ...q, type: "fillblank" };
  }
  const q = await generateQuestion(role, difficulty, topic, askedQuestions, askedTopics, purpose, purposeMeta);
  return { ...q, type: "openended" };
}

exports.startSession = async (req, res) => {
  try {
    const { userId, role, difficulty, questionType, purpose, purposeMeta } = req.body;
    if (!userId || !role) return res.status(400).json({ error: "userId and role are required" });

    const session = await Session.create({
      userId, role,
      difficulty:   difficulty   || "Medium",
      questionType: questionType || "openended",
      purpose:      purpose      || "practice",
      purposeMeta:  purposeMeta  || {},
      askedTopics:  [],
    });

    const first = await getNextQuestion(
      role, difficulty || "Medium",
      questionType || "openended",
      null, [], [],
      purpose || "practice",
      purposeMeta || {}
    );

    // ✅ Save first topic BEFORE returning
    if (first.topic) {
      session.askedTopics = [first.topic];
      await session.save();
    }

    res.status(201).json({
      sessionId:       session._id,
      question:        first.question,
      topic:           first.topic,
      type:            first.type,
      options:         first.options         || null,
      correctAnswer:   first.correctAnswer   || null,
      acceptedAnswers: first.acceptedAnswers || null,
      explanation:     first.explanation     || null,
      message:         "Session started 🚀",
    });
  } catch (err) {
    console.error("startSession error:", err);
    res.status(500).json({ error: "Failed to start session" });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, question, answer, mcqData, fillBlankData } = req.body;
    if (!sessionId || !question || answer === undefined) {
      return res.status(400).json({ error: "sessionId, question, and answer are required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (!session.isActive) return res.status(400).json({ error: "Session has ended" });

    const lockedType    = session.questionType;
    const lockedPurpose = session.purpose;
    const lockedMeta    = session.purposeMeta || {};

    let evaluation;
    let followUp = null;

    if (lockedType === "mcq" && mcqData) {
      evaluation = evaluateMCQ(answer, mcqData.correctAnswer, mcqData.explanation, mcqData.topic);
    } else if (lockedType === "fillblank" && fillBlankData) {
      evaluation = evaluateFillBlank(
        answer, fillBlankData.correctAnswer,
        fillBlankData.acceptedAnswers, fillBlankData.explanation, fillBlankData.topic
      );
    } else {
      evaluation = await evaluateAnswer(question, answer, session.difficulty, lockedPurpose, lockedMeta);
      if (evaluation.score >= 4 && evaluation.score <= 7) {
        followUp = await generateFollowUp(question, answer, session.difficulty, lockedPurpose);
      }
    }

    updatePerformance(session, evaluation.topic, evaluation.score);

    session.history.push({
      question, answer,
      score:       evaluation.score,
      topic:       evaluation.topic,
      strengths:   evaluation.strengths,
      weaknesses:  evaluation.weaknesses,
      idealAnswer: evaluation.idealAnswer,
      followUp,
    });

    // ✅ Track answered topic
    if (evaluation.topic && !session.askedTopics.includes(evaluation.topic)) {
      session.askedTopics.push(evaluation.topic);
    }

    // ✅ Save BEFORE generating next question so askedTopics is up to date
    await session.save();

    const askedQuestions = session.history.map((h) => h.question);
    const askedTopics    = [...session.askedTopics];

    console.log("✅ Asked questions:", askedQuestions.length);
    console.log("✅ Asked topics:", askedTopics);

    const weakTopic = getWeakTopic(session);

    const next = await getNextQuestion(
      session.role, session.difficulty,
      lockedType, weakTopic,
      askedQuestions, askedTopics,
      lockedPurpose, lockedMeta
    );

    // ✅ Save next topic immediately so it won't repeat
    if (next.topic && !session.askedTopics.includes(next.topic)) {
      session.askedTopics.push(next.topic);
      await session.save();
    }

    console.log("✅ Next question:", next.question);
    console.log("✅ Next topic:", next.topic);

    res.json({
      evaluation, followUp, weakTopic,
      nextQuestion:        next.question,
      nextTopic:           next.topic,
      nextType:            next.type,
      nextOptions:         next.options         || null,
      nextCorrectAnswer:   next.correctAnswer   || null,
      nextAcceptedAnswers: next.acceptedAnswers || null,
      nextExplanation:     next.explanation     || null,
    });
  } catch (err) {
    console.error("submitAnswer error:", err);
    res.status(500).json({ error: "Failed to process answer" });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId is required" });
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    session.isActive = false;
    await session.save();
    res.json({
      message:            "Session ended",
      totalQuestions:     session.history.length,
      overallBand:        getOverallBand(session),
      weakTopic:          getWeakTopic(session),
      performanceSummary: getPerformanceSummary(session),
      history:            session.history,
    });
  } catch (err) {
    console.error("endSession error:", err);
    res.status(500).json({ error: "Failed to end session" });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({
      session,
      performanceSummary: getPerformanceSummary(session),
      overallBand:        getOverallBand(session),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .select("role difficulty questionType purpose purposeMeta createdAt history performance isActive");
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};