const mongoose = require("mongoose");

const historyEntrySchema = new mongoose.Schema(
  {
    question:    { type: String, required: true },
    answer:      { type: String, required: true },
    score:       { type: Number, min: 0, max: 10 },
    topic:       { type: String },
    strengths:   { type: String },
    weaknesses:  { type: String },
    idealAnswer: { type: String },
    followUp:    { type: String, default: null },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId:       { type: String, required: true, index: true },
    role:         { type: String, required: true },
    difficulty:   { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    questionType: { type: String, enum: ["openended", "mcq", "fillblank"], default: "openended" },
    purpose:      { type: String, enum: ["exam", "company", "practice"], default: "practice" },

    purposeMeta: {
      // Exam fields
      examType:       { type: String },
      university:     { type: String },
      course:         { type: String },
      semester:       { type: String },
      subject:        { type: String },
      syllabus:       { type: String },
      exam:           { type: String },

      // Company fields
      companyName:    { type: String },
      jobDescription: { type: String },

      // Practice fields
      learningPath:   { type: String },
      selectedTopics: { type: [String], default: [] },
      dailyGoal:      { type: Number, default: 0 },
    },

    history: [historyEntrySchema],

    // Track asked topics separately for better rotation
    askedTopics: { type: [String], default: [] },

    performance: {
      DSA:     { type: [Number], default: [] },
      OOP:     { type: [Number], default: [] },
      DBMS:    { type: [Number], default: [] },
      OS:      { type: [Number], default: [] },
      CN:      { type: [Number], default: [] },
      General: { type: [Number], default: [] },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);