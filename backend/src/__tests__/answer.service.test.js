'use strict';

const fc = require('fast-check');
const { calculateScore, BASE_POINTS, MAX_SPEED_BONUS } = require('../session/answer.service');

describe('calculateScore — property-based tests', () => {
  test('correct answer: score is always in [BASE_POINTS, BASE_POINTS + MAX_SPEED_BONUS]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120_000 }), // totalTimeMs
        fc.double({ min: 0, max: 1, noNaN: true }), // fraction of time remaining
        (totalTimeMs, fraction) => {
          const remainingTimeMs = Math.round(totalTimeMs * fraction);
          const score = calculateScore(true, remainingTimeMs, totalTimeMs);
          return score >= BASE_POINTS && score <= BASE_POINTS + MAX_SPEED_BONUS;
        }
      )
    );
  });

  test('incorrect answer: score is always 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 120_000 }),
        fc.integer({ min: 0, max: 120_000 }),
        (remainingTimeMs, totalTimeMs) => {
          return calculateScore(false, remainingTimeMs, totalTimeMs) === 0;
        }
      )
    );
  });

  test('correct answer with zero remaining time: score equals BASE_POINTS', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120_000 }),
        (totalTimeMs) => {
          const score = calculateScore(true, 0, totalTimeMs);
          return score === BASE_POINTS;
        }
      )
    );
  });

  test('correct answer with full remaining time: score equals BASE_POINTS + MAX_SPEED_BONUS', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120_000 }),
        (totalTimeMs) => {
          const score = calculateScore(true, totalTimeMs, totalTimeMs);
          return score === BASE_POINTS + MAX_SPEED_BONUS;
        }
      )
    );
  });

  test('score is always an integer', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.integer({ min: 0, max: 120_000 }),
        fc.integer({ min: 1, max: 120_000 }),
        (isCorrect, remainingTimeMs, totalTimeMs) => {
          const score = calculateScore(isCorrect, remainingTimeMs, totalTimeMs);
          return Number.isInteger(score);
        }
      )
    );
  });
});
