'use strict';

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not set. Exiting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[DB] MongoDB connected successfully.');
  } catch (err) {
    console.error('[DB] MongoDB connection error:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB runtime error:', err.message);
  });
}

module.exports = connectDB;
