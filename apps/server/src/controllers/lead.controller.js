const { generateMockAnalysis } = require('../services/mockAnalysis.service');

const analyzeLead = (req, res, next) => {
  try {
    const { conversation } = req.body;
    const { contactName, messages } = conversation;
    
    // Log the received payload for testing purposes
    console.log('\n=== Received New Conversation Data ===');
    console.log(`Contact: ${contactName}`);
    console.log(`Messages Count: ${messages.length}`);
    console.log('Consent Granted:', req.body.consent.granted);
    console.log('======================================\n');
    
    // In Phase 2, we return the mock analysis
    const analysis = generateMockAnalysis(contactName);

    res.status(200).json({
      success: true,
      lead: analysis
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeLead };
