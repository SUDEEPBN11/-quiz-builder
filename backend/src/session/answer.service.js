'use strict';

const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 50;

/**
 * Calculate the score for a single answer submission.
 *
 * Formula (correct answer):
 *   score = BASE_POINTS + (remainingTimeMs / totalTimeMs) * MAX_SPEED_BONUS
 *
 * Incorrect or skipped answers always score 0.
 *
 * @param {boolean} isCorrect
 * @param {number} remainingTimeMs  - Time remaining when answer was submitted (ms)
 * @param {number} totalTimeMs      - Total time allowed for the question (ms)
 * @returns {number} Integer score
 */
function calculateScore(isCorrect, remainingTimeMs, totalTimeMs) {
  if (!isCorrect) return 0;
  if (!Number.isFinite(totalTimeMs) || totalTimeMs <= 0) return BASE_POINTS;
  if (!Number.isFinite(remainingTimeMs)) return BASE_POINTS;

  const clampedRemaining = Math.max(0, Math.min(remainingTimeMs, totalTimeMs));
  const speedBonus = (clampedRemaining / totalTimeMs) * MAX_SPEED_BONUS;
  return Math.round(BASE_POINTS + speedBonus);
}

module.exports = { calculateScore, BASE_POINTS, MAX_SPEED_BONUS };
