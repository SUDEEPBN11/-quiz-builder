'use strict';

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
const pptxService = require('./pptx.service');

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pptx') {
      const err = new Error('Only .pptx files are accepted.');
      err.statusCode = 400;
      return cb(err, false);
    }
    cb(null, true);
  },
});

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'NO_FILE', message: 'No file uploaded.' } });
    }

    const { presenterToken, count, difficulty, provider } = req.body;
    if (!presenterToken) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'presenterToken is required.' } });
    }

    const questions = await pptxService.processUpload(
      req.file.path,
      parseInt(count, 10) || 5,
      difficulty || 'medium',
      provider
    );

    res.json({ questions });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({ error: { code: 'INVALID_FILE', message: err.message } });
    }
    next(err);
  }
});

// Handle multer file size error
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: { code: 'FILE_TOO_LARGE', message: 'File exceeds the 20 MB limit.' } });
  }
  next(err);
});

module.exports = router;
