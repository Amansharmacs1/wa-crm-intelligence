const express = require('express');
const router = express.Router();
const { analyzeLead } = require('../controllers/lead.controller');
const { analyzeLeadSchema } = require('../schemas/lead.schema');
const { validate } = require('../middleware/validate.middleware');
const { requireConsent } = require('../middleware/consent.middleware');

router.post('/analyze', requireConsent, validate(analyzeLeadSchema), analyzeLead);

module.exports = router;
