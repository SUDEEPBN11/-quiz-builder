'use strict';

const { nanoid } = require('nanoid');
const Participant = require('./participant.model');
const Session = require('../session/session.model');

/**
 * Join a session by session code.
 * Creates a new Participant document and links it to the session.
 * @param {string} sessionCode
 * @param {string} displayName
 * @returns {Promise<{ participant: Participant, session: Session }>}
 */
async function joinSession(sessionCode, displayName) {
  const session = await Session.findOne({ sessionCode: sessionCode.toUpperCase() });

  if (!session) {
    const err = new Error('Session not found. Check the session code and try again.');
    err.statusCode = 404;
    throw err;
  }

  if (session.status !== 'waiting') {
    const err = new Error(
      `Cannot join a session with status "${session.status}". The quiz may have already started or ended.`
    );
    err.statusCode = 400;
    throw err;
  }

  const participantToken = `tok_part_${nanoid(24)}`;

  const participant = await Participant.create({
    sessionId: session._id,
    displayName: displayName.trim(),
    participantToken,
  });

  // Link participant to session
  session.participants.push(participant._id);
  await session.save();

  return { participant, session };
}

/**
 * Find a participant by their opaque token.
 * @param {string} token
 * @returns {Promise<Participant|null>}
 */
async function getParticipantByToken(token) {
  return Participant.findOne({ participantToken: token });
}

/**
 * Find a participant by their MongoDB _id.
 * @param {string} participantId
 * @returns {Promise<Participant|null>}
 */
async function getParticipantById(participantId) {
  return Participant.findById(participantId);
}

/**
 * Get all participants for a session.
 * @param {string} sessionId
 * @returns {Promise<Participant[]>}
 */
async function getParticipantsBySession(sessionId) {
  return Participant.find({ sessionId });
}

module.exports = {
  joinSession,
  getParticipantByToken,
  getParticipantById,
  getParticipantsBySession,
};
