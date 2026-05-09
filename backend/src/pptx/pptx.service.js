'use strict';

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const aiService = require('../ai/ai.service');

/**
 * Extract text content from each slide of a PPTX file.
 * PPTX files are ZIP archives containing XML slide files.
 *
 * @param {string} filePath - Absolute path to the uploaded .pptx file
 * @returns {Promise<string[]>} Array of text strings, one per slide
 */
async function extractSlidesText(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(fileBuffer);

  // Slide XML files are at ppt/slides/slide1.xml, slide2.xml, etc.
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)[1], 10);
      const numB = parseInt(b.match(/slide(\d+)/)[1], 10);
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    const err = new Error('No slides found in the uploaded PPTX file.');
    err.statusCode = 400;
    throw err;
  }

  const slideTexts = [];
  for (const slideFile of slideFiles) {
    const xmlContent = await zip.files[slideFile].async('string');
    // Extract text from <a:t> tags (DrawingML text runs)
    const textMatches = xmlContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    const text = textMatches
      .map((match) => match.replace(/<[^>]+>/g, '').trim())
      .filter((t) => t.length > 0)
      .join(' ');
    if (text.trim().length > 0) {
      slideTexts.push(text.trim());
    }
  }

  return slideTexts;
}

/**
 * Process an uploaded PPTX file: extract slide text and generate quiz questions via AI.
 *
 * @param {string} filePath - Absolute path to the uploaded .pptx file
 * @param {number} count - Number of questions to generate
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @param {string} [provider] - AI provider override
 * @returns {Promise<Array>} Draft questions for presenter review
 */
async function processUpload(filePath, count = 5, difficulty = 'medium', provider) {
  let slideTexts;
  try {
    slideTexts = await extractSlidesText(filePath);
  } finally {
    // Always clean up the temp file
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupErr) {
      console.warn('[PPTX] Failed to clean up temp file:', cleanupErr.message);
    }
  }

  if (slideTexts.length === 0) {
    const err = new Error('No readable text found in the PPTX slides.');
    err.statusCode = 400;
    throw err;
  }

  const combinedText = slideTexts
    .map((text, i) => `Slide ${i + 1}: ${text}`)
    .join('\n\n');

  return aiService.generateQuestions({
    topic: combinedText,
    difficulty,
    count,
    provider,
  });
}

module.exports = { processUpload, extractSlidesText };
