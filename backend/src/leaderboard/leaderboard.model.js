'use strict';

const mongoose = require('mongoose');

const RankingEntrySchema = new mongoose.Schema(
  {
    rank: { type: Number, required: true },
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    displayName: { type: String, required: true },
    totalScore: { type: Number, default: 0 },
    totalResponseTimeMs: { type: Number, default: 0 },
  },
  { _id: false }
);

const LeaderboardSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    questionIndex: { type: Number, required: true },
    rankings: [RankingEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
