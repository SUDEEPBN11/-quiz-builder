'use strict';

const Session = require('../session/session.model');
const Participant = require('../user/participant.model');

/**
 * Build a real-time analytics snapshot for a session.
 * Called after each question finalizes and pushed to the presenter room.
 *
 * @param {string} sessionId
 * @returns {Promise<Object>} analytics payload
 */
async function buildAnalytics(sessionId) {
  const session = await Session.findById(sessionId);
  if (!session) return {};

  const participants = await Participant.find({ sessionId });
  const activeCount = participants.filter((p) => p.isActive).length;
  const inactiveCount = participants.length - activeCount;

  const questionStats = session.questions.map((_, qi) => {
    const answers = participants.flatMap((p) =>
      p.answers.filter((a) => a.questionIndex === qi)
    );
    const correct = answers.filter((a) => a.isCorrect).length;
    const skipped = answers.filter((a) => a.isSkipped).length;
    const incorrect = answers.filter((a) => !a.isCorrect && !a.isSkipped).length;
    return { questionIndex: qi, correct, incorrect, skipped };
  });

  // Total answers submitted (non-skipped) across all questions
  const totalAnswers = participants.flatMap((p) =>
    p.answers.filter((a) => !a.isSkipped)
  ).length;
  const totalCorrect = participants.flatMap((p) =>
    p.answers.filter((a) => a.isCorrect)
  ).length;
  const overallAccuracy =
    totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  // Engagement: answer rate = participants who answered at least one question / total
  const answeredAtLeastOne = participants.filter((p) => p.answers.length > 0).length;
  const answerRate =
    participants.length > 0
      ? Math.round((answeredAtLeastOne / participants.length) * 100)
      : 0;

  // Top performer (highest score)
  const sorted = [...participants].sort(
    (a, b) => b.totalScore - a.totalScore || a.totalResponseTimeMs - b.totalResponseTimeMs
  );
  const topPerformer = sorted[0]
    ? { displayName: sorted[0].displayName, totalScore: sorted[0].totalScore }
    : null;

  // Most active (most answers submitted)
  const mostActive = [...participants].sort(
    (a, b) => b.answers.length - a.answers.length
  )[0];
  const mostActiveParticipant = mostActive
    ? { displayName: mostActive.displayName, answerCount: mostActive.answers.length }
    : null;

  return {
    totalParticipants: participants.length,
    activeCount,
    inactiveCount,
    overallAccuracy,
    questionStats,
    engagementMetrics: { answerRate, activeCount, inactiveCount },
    topPerformer,
    mostActiveParticipant,
  };
}

/**
 * Finalize analytics when a session ends.
 * Persists computed analytics to the session document.
 *
 * @param {string} sessionId
 * @returns {Promise<void>}
 */
async function finalizeAnalytics(sessionId) {
  try {
    const analytics = await buildAnalytics(sessionId);
    await Session.findByIdAndUpdate(sessionId, {
      $set: {
        'analytics.totalParticipants': analytics.totalParticipants,
        'analytics.overallAccuracy': analytics.overallAccuracy,
        'analytics.questionStats': analytics.questionStats,
        'analytics.engagementMetrics': analytics.engagementMetrics,
        endedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('[Analytics] Failed to finalize analytics:', err.message);
  }
}

module.exports = { buildAnalytics, finalizeAnalytics };
