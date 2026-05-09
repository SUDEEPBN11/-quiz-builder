'use strict';

const { nanoid } = require('nanoid');
const Session = require('./session.model');

// Valid status transitions
const STATUS_TRANSITIONS = {
  waiting: ['active'],
  active: ['paused', 'ended'],
  paused: ['active', 'ended'],
  ended: [],
};

/**
 * Generate a unique 6-character uppercase session code.
 */
async function generateUniqueCode() {
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let exists = true;
  while (exists) {
    code = Array.from({ length: 6 }, () =>
      ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    ).join('');
    exists = await Session.exists({ sessionCode: code, status: { $ne: 'ended' } });
  }
  return code;
}

/**
 * Create a new quiz session.
 * @param {string} presenterName
 * @returns {Promise<Session>}
 */
async function createSession(presenterName = 'Presenter') {
  const sessionCode = await generateUniqueCode();
  const presenterToken = `tok_pres_${nanoid(24)}`;

  const session = await Session.create({
    sessionCode,
    presenterToken,
    presenterName,
    status: 'waiting',
  });

  return session;
}

/**
 * Find a session by its session code.
 * @param {string} code
 * @returns {Promise<Session|null>}
 */
async function getSessionByCode(code) {
  return Session.findOne({ sessionCode: code.toUpperCase() });
}

/**
 * Find a session by its MongoDB _id.
 * @param {string} sessionId
 * @returns {Promise<Session|null>}
 */
async function getSessionById(sessionId) {
  return Session.findById(sessionId);
}

/**
 * Update session status with state-machine validation.
 * @param {string} sessionId
 * @param {string} newStatus
 * @param {string} presenterToken
 * @returns {Promise<Session>}
 */
async function updateSessionStatus(sessionId, newStatus, presenterToken) {
  const session = await Session.findById(sessionId);
  if (!session) {
    const err = new Error('Session not found.');
    err.statusCode = 404;
    throw err;
  }

  if (session.presenterToken !== presenterToken) {
    const err = new Error('Invalid presenter token.');
    err.statusCode = 403;
    throw err;
  }

  const allowed = STATUS_TRANSITIONS[session.status] || [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(
      `Cannot transition from "${session.status}" to "${newStatus}".`
    );
    err.statusCode = 400;
    throw err;
  }

  session.status = newStatus;
  if (newStatus === 'ended') {
    session.endedAt = new Date();
  }
  await session.save();
  return session;
}

/**
 * Validate that a presenterToken belongs to the given session.
 * @param {string} sessionId
 * @param {string} presenterToken
 * @returns {Promise<Session>}
 */
async function validatePresenterToken(sessionId, presenterToken) {
  const session = await Session.findById(sessionId);
  if (!session) {
    const err = new Error('Session not found.');
    err.statusCode = 404;
    throw err;
  }
  if (session.presenterToken !== presenterToken) {
    const err = new Error('Invalid presenter token.');
    err.statusCode = 403;
    throw err;
  }
  return session;
}

module.exports = {
  createSession,
  getSessionByCode,
  getSessionById,
  updateSessionStatus,
  validatePresenterToken,
};
