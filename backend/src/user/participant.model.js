'use strict';

const mongoose = require('mongoose');

const AnswerRecordSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedIndex: { type: Number, default: null }, // null when skipped
    isCorrect: { type: Boolean, default: false },
    isSkipped: { type: Boolean, default: false },
    responseTimeMs: { type: Number, default: 0 },
    scoreAwarded: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ParticipantSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    displayName: { type: String, required: true, trim: true },
    participantToken: { type: String, required: true, unique: true, index: true },
    totalScore: { type: Number, default: 0 },
    totalResponseTimeMs: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    disconnectedAt: { type: Date, default: null },
    answers: [AnswerRecordSchema],
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Participant', ParticipantSchema);
