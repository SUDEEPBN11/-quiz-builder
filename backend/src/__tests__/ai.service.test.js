'use strict';

const fc = require('fast-check');
const { parseAndValidate } = require('../ai/ai.service');

describe('parseAndValidate — property-based tests', () => {
  // Valid question arbitraries
  const validQuestionArb = fc.record({
    text: fc.string({ minLength: 5, maxLength: 200 }),
    options: fc.tuple(
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.string({ minLength: 1, maxLength: 100 })
    ).map((t) => [...t]),
    correctIndex: fc.integer({ min: 0, max: 3 }),
  });

  test('valid JSON arrays of correct shape always parse successfully', () => {
    fc.assert(
      fc.property(fc.array(validQuestionArb, { minLength: 1, maxLength: 10 }), (questions) => {
        const raw = JSON.stringify(questions);
        const result = parseAndValidate(raw);
        return result.length === questions.length;
      })
    );
  });

  test('output length always equals input array length for valid input', () => {
    fc.assert(
      fc.property(fc.array(validQuestionArb, { minLength: 1, maxLength: 20 }), (questions) => {
        const result = parseAndValidate(JSON.stringify(questions));
        return result.length === questions.length;
      })
    );
  });

  test('each output item has text, options (length 4), and correctIndex (0-3)', () => {
    fc.assert(
      fc.property(fc.array(validQuestionArb, { minLength: 1, maxLength: 10 }), (questions) => {
        const result = parseAndValidate(JSON.stringify(questions));
        return result.every(
          (q) =>
            typeof q.text === 'string' &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            q.correctIndex >= 0 &&
            q.correctIndex <= 3
        );
      })
    );
  });

  test('invalid JSON always throws', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => {
          try { JSON.parse(s); return false; } catch { return true; }
        }),
        (invalidJson) => {
          expect(() => parseAndValidate(invalidJson)).toThrow();
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('questions with wrong number of options always throw', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            text: fc.string({ minLength: 5 }),
            options: fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 3 }),
            correctIndex: fc.integer({ min: 0, max: 3 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (questions) => {
          expect(() => parseAndValidate(JSON.stringify(questions))).toThrow();
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('questions missing text always throw', () => {
    const noTextArb = fc.array(
      fc.record({
        options: fc.tuple(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 })
        ).map((t) => [...t]),
        correctIndex: fc.integer({ min: 0, max: 3 }),
      }),
      { minLength: 1, maxLength: 5 }
    );
    fc.assert(
      fc.property(noTextArb, (questions) => {
        expect(() => parseAndValidate(JSON.stringify(questions))).toThrow();
        return true;
      }),
      { numRuns: 50 }
    );
  });
});
