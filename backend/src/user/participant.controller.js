'use strict';

const participantService = require('./participant.service');
const leaderboardService = require('../leaderboard/leaderboard.service');
const Session = require('../session/session.model');
const { calculateScore } = require('../session/answer.service');
const { activeTimers } = require('../socket/question.handlers');

async function joinSession(req, res, next) {
  try {
    const { displayName } = req.body;
    if (!displayName || displayName.trim().length === 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'displayName is required.' },
      });
    }
    const { participant, session } = await participantService.joinSession(
      req.params.code,
      displayName
    );
    res.status(200).json({
      participantId: participant._id,
      participantToken: participant.participantToken,
      sessionId: session._id,
      sessionCode: session.sessionCode,
    });
  } catch (err) {
    next(err);
  }
}

async function submitAnswerREST(req, res, next) {
  try {
    const { participantToken, questionIndex, selectedIndex } = req.body;
    if (!participantToken || questionIndex === undefined || selectedIndex === undefined) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'participantToken, questionIndex, and selectedIndex are required.' },
      });
    }

    const participant = await participantService.getParticipantByToken(participantToken);
    if (!participant) return res.status(403).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid participant token.' } });

    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found.' } });
    if (session.status !== 'active') return res.status(400).json({ error: { code: 'SESSION_NOT_ACTIVE', message: 'Session is not active.' } });

    const timerState = activeTimers.get(session.sessionCode);
    if (!timerState || timerState.questionIndex !== questionIndex) {
      return res.status(400).json({ error: { code: 'TIMER_EXPIRED', message: 'Time is up for this question.' } });
    }

    const alreadyAnswered = participant.answers.some((a) => a.questionIndex === questionIndex);
    if (alreadyAnswered) return res.status(400).json({ error: { code: 'DUPLICATE_ANSWER', message: 'Already answered.' } });

    const question = session.questions[questionIndex];
    if (!question) return res.status(400).json({ error: { code: 'INVALID_QUESTION', message: 'Invalid question index.' } });

    const submittedAt = new Date();
    const elapsedMs = submittedAt.getTime() - session.questionStartedAt.getTime();
    const totalMs = question.timerSeconds * 1000;
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const isCorrect = Number(selectedIndex) === question.correctIndex;
    const scoreAwarded = calculateScore(isCorrect, remainingMs, totalMs);

    participant.answers.push({
      questionIndex,
      selectedIndex: Number(selectedIndex),
      isCorrect,
      isSkipped: false,
      responseTimeMs: elapsedMs,
      scoreAwarded,
      submittedAt,
    });
    participant.totalScore += scoreAwarded;
    participant.totalResponseTimeMs += elapsedMs;
    await participant.save();

    res.json({ questionIndex, isCorrect, correctIndex: question.correctIndex, scoreAwarded, totalScore: participant.totalScore });
  } catch (err) {
    next(err);
  }
}

async function getParticipantSummary(req, res, next) {
  try {
    const { participantId } = req.params;
    const { participantToken } = req.query;

    const participant = await participantService.getParticipantById(participantId);
    if (!participant) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Participant not found.' } });
    if (participant.participantToken !== participantToken) {
      return res.status(403).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid participant token.' } });
    }

    const session = await Session.findById(participant.sessionId);
    const rank = await leaderboardService.getParticipantRank(participant.sessionId, participantId);

    const totalAnswered = participant.answers.filter((a) => !a.isSkipped).length;
    const totalCorrect = participant.answers.filter((a) => a.isCorrect).length;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const skippedQuestions = participant.answers
      .filter((a) => a.isSkipped)
      .map((a) => ({
        questionIndex: a.questionIndex,
        questionText: session?.questions[a.questionIndex]?.text,
        correctAnswer: session?.questions[a.questionIndex]?.options[session?.questions[a.questionIndex]?.correctIndex],
      }));

    const perQuestionBreakdown = participant.answers.map((a) => ({
      questionIndex: a.questionIndex,
      selectedIndex: a.selectedIndex,
      isCorrect: a.isCorrect,
      isSkipped: a.isSkipped,
      scoreAwarded: a.scoreAwarded,
      responseTimeMs: a.responseTimeMs,
      correctIndex: session?.questions[a.questionIndex]?.correctIndex,
      correctAnswer: session?.questions[a.questionIndex]?.options[session?.questions[a.questionIndex]?.correctIndex],
    }));

    res.json({
      participantId: participant._id,
      displayName: participant.displayName,
      totalScore: participant.totalScore,
      rank,
      accuracy,
      totalResponseTimeMs: participant.totalResponseTimeMs,
      skippedQuestions,
      perQuestionBreakdown,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { joinSession, submitAnswerREST, getParticipantSummary };
