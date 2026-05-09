'use strict';

const fc = require('fast-check');

/**
 * Pure ranking function extracted for testing without DB dependency.
 * Mirrors the sort logic in leaderboard.service.js.
 */
function rankParticipants(participants) {
  const sorted = [...participants].sort(
    (a, b) => b.totalScore - a.totalScore || a.totalResponseTimeMs - b.totalResponseTimeMs
  );
  return sorted.map((p, i) => ({ ...p, rank: i + 1 }));
}

describe('Leaderboard ranking — property-based tests', () => {
  const participantArb = fc.record({
    id: fc.uuid(),
    displayName: fc.string({ minLength: 1, maxLength: 20 }),
    totalScore: fc.integer({ min: 0, max: 10_000 }),
    totalResponseTimeMs: fc.integer({ min: 0, max: 120_000 }),
  });

  test('rankings are strictly ordered: no adjacent pair violates score-desc then time-asc', () => {
    fc.assert(
      fc.property(fc.array(participantArb, { minLength: 1, maxLength: 50 }), (participants) => {
        const ranked = rankParticipants(participants);
        for (let i = 0; i < ranked.length - 1; i++) {
          const a = ranked[i];
          const b = ranked[i + 1];
          if (a.totalScore < b.totalScore) return false;
          if (a.totalScore === b.totalScore && a.totalResponseTimeMs > b.totalResponseTimeMs) return false;
        }
        return true;
      })
    );
  });

  test('rank values are consecutive starting from 1', () => {
    fc.assert(
      fc.property(fc.array(participantArb, { minLength: 1, maxLength: 50 }), (participants) => {
        const ranked = rankParticipants(participants);
        return ranked.every((p, i) => p.rank === i + 1);
      })
    );
  });

  test('output length equals input length', () => {
    fc.assert(
      fc.property(fc.array(participantArb, { minLength: 0, maxLength: 50 }), (participants) => {
        return rankParticipants(participants).length === participants.length;
      })
    );
  });

  test('single participant always gets rank 1', () => {
    fc.assert(
      fc.property(participantArb, (participant) => {
        const ranked = rankParticipants([participant]);
        return ranked[0].rank === 1;
      })
    );
  });
});
