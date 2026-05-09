'use strict';

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 4,
        message: 'A question must have exactly 4 options.',
      },
      required: true,
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    timerSeconds: {
      type: Number,
      min: 5,
      max: 120,
      default: 30,
    },
  },
  { _id: true }
);

const QuestionStatSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
  },
  { _id: false }
);

const AnalyticsSchema = new mongoose.Schema(
  {
    totalParticipants: { type: Number, default: 0 },
    overallAccuracy: { type: Number, default: 0 },
    questionStats: [QuestionStatSchema],
    engagementMetrics: {
      answerRate: { type: Number, default: 0 },
      activeCount: { type: Number, default: 0 },
      inactiveCount: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    presenterToken: { type: String, required: true },
    presenterName: { type: String, default: 'Presenter' },
    status: {
      type: String,
      enum: ['waiting', 'active', 'paused', 'ended'],
      default: 'waiting',
    },
    currentQuestionIndex: { type: Number, default: -1 },
    questions: [QuestionSchema],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
    leaderboardSnaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Leaderboard' }],
    analytics: { type: AnalyticsSchema, default: () => ({}) },
    questionStartedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', SessionSchema);
