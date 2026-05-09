'use strict';

const fc = require('fast-check');

/**
 * Pure session code generator extracted for testing without DB dependency.
 * Mirrors the logic in session.service.js.
 */
function generateCode() {
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  ).join('');
}

describe('Session code generation — property-based tests', () => {
  test('generated codes are always 6 characters long', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (n) => {
        for (let i = 0; i < n; i++) {
          if (generateCode().length !== 6) return false;
        }
        return true;
      })
    );
  });

  test('generated codes only contain characters from the allowed alphabet', () => {
    const ALLOWED = new Set('ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 200 }), (n) => {
        for (let i = 0; i < n; i++) {
          const code = generateCode();
          if (![...code].every((c) => ALLOWED.has(c))) return false;
        }
        return true;
      })
    );
  });

  test('generating 100 codes produces at least 90 distinct values (collision resistance)', () => {
    // With 32^6 ≈ 1 billion possible codes, 100 generations should be nearly all unique
    const codes = new Set(Array.from({ length: 100 }, generateCode));
    expect(codes.size).toBeGreaterThanOrEqual(90);
  });
});
