const express = require('express');
const router = express.Router();
const {
  analyzeLead,
  transformLeads,
  analyzeWithGemini,
  analyzeWithLlama,
  analyzeWithWit,
  getLeads,
  getDashboardMetrics,
  syncLeads
} = require('../controllers/lead.controller');
const { analyzeLeadSchema } = require('../schemas/lead.schema');
const { validate } = require('../middleware/validate.middleware');
const { requireConsent } = require('../middleware/consent.middleware');

// GET endpoints
router.get('/', getLeads);
router.get('/dashboard', getDashboardMetrics);

// Standard enterprise analysis and transformation endpoints
router.post('/analyze', requireConsent, validate(analyzeLeadSchema), analyzeLead);
router.post('/transform', requireConsent, validate(analyzeLeadSchema), transformLeads);
router.post('/hybrid', requireConsent, validate(analyzeLeadSchema), analyzeLead);
router.post('/sync', syncLeads);

// Modular individual endpoints
router.post('/gemini', requireConsent, validate(analyzeLeadSchema), analyzeWithGemini);
router.post('/llama', requireConsent, validate(analyzeLeadSchema), analyzeWithLlama);
router.post('/wit', requireConsent, validate(analyzeLeadSchema), analyzeWithWit);

module.exports = router;
