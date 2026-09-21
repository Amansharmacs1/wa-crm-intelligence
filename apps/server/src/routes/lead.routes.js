const express = require('express');
const router = express.Router();
const {
  analyzeLead,
  transformLeads,
  analyzeWithGemini,
  analyzeWithLlama,
  analyzeWithWit
} = require('../controllers/lead.controller');
const { analyzeLeadSchema } = require('../schemas/lead.schema');
const { validate } = require('../middleware/validate.middleware');
const { requireConsent } = require('../middleware/consent.middleware');

// Standard enterprise analysis and transformation endpoints
router.post('/analyze', requireConsent, validate(analyzeLeadSchema), analyzeLead);
router.post('/transform', requireConsent, validate(analyzeLeadSchema), transformLeads);
router.post('/hybrid', requireConsent, validate(analyzeLeadSchema), analyzeLead);

// Modular individual endpoints
router.post('/gemini', requireConsent, validate(analyzeLeadSchema), analyzeWithGemini);
router.post('/llama', requireConsent, validate(analyzeLeadSchema), analyzeWithLlama);
router.post('/wit', requireConsent, validate(analyzeLeadSchema), analyzeWithWit);

module.exports = router;
