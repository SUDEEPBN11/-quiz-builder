'use strict';

const { registerSessionHandlers } = require('./session.handlers');
const { registerQuestionHandlers } = require('./question.handlers');
const { registerAnswerHandlers } = require('./answer.handlers');

let _io = null;

/**
 * Initialize Socket.IO and register all event handlers.
 * @param {import('socket.io').Server} io
 */
function initSocket(io) {
  _io = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Register domain-specific handlers
    registerSessionHandlers(io, socket);
    registerQuestionHandlers(io, socket);
    registerAnswerHandlers(io, socket);

    // Global error handler for this socket
    socket.on('error', (err) => {
      console.error(`[Socket] Unhandled error on socket ${socket.id}:`, err?.message || err);
      socket.emit('error', {
        code: 'SOCKET_ERROR',
        message: 'An unexpected error occurred.',
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} — reason: ${reason}`);
    });
  });

  // Server-level error handler
  io.engine.on('connection_error', (err) => {
    console.error('[Socket.IO] Connection error:', err.message);
  });
}

/**
 * Get the initialized Socket.IO server instance.
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!_io) throw new Error('Socket.IO has not been initialized. Call initSocket(io) first.');
  return _io;
}

module.exports = { initSocket, getIO };
