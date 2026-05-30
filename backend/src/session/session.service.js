'use strict';

const { nanoid } = require('nanoid');
const Session = require('./session.model');

const STATUS_TRANSITIONS = {
  waiting: ['active'],
  active: ['paused', 'ended'],
  paused: ['active', 'ended'],
  ended: [],
};

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

async function getSessionByCode(code) {
  return Session.findOne({ sessionCode: code.toUpperCase() });
}

async function getSessionById(sessionId) {
  return Session.findById(sessionId);
}

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
    const err = new Error(`Cannot transition from "${session.status}" to "${newStatus}".`);
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
