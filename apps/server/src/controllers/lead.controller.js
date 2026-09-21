const fs = require('fs');
const path = require('path');
const { generateMockAnalysis } = require('../services/mockAnalysis.service');

const analyzeLead = async (req, res) => {
  try {
    const { consent, conversation } = req.body;

    if (!consent || consent.status !== 'approved') {
        return res.status(403).json({
            success: false,
            message: "Approved customer consent is required before chat analysis."
        });
    }

    if (process.env.NODE_ENV === 'development' && process.env.LOG_APPROVED_CHATS === 'true') {
        console.log('\n[CONSENT APPROVED — DEVELOPMENT ONLY]');
        console.log(JSON.stringify(conversation, null, 2));
    }

    const leadAnalysis = generateMockAnalysis(conversation.contactName);

    try {
        const demoFilePath = path.join(__dirname, '../../demo_leads.json');
        let existingData = [];
        if (fs.existsSync(demoFilePath)) {
            existingData = JSON.parse(fs.readFileSync(demoFilePath, 'utf8'));
        }
        
        existingData.push({
            timestamp: new Date().toISOString(),
            contactName: conversation.contactName,
            analysis: leadAnalysis,
            messageCount: conversation.messages.length
        });
        
        fs.writeFileSync(demoFilePath, JSON.stringify(existingData, null, 2));
        console.log(`\n✅ Lead data successfully appended to apps/server/demo_leads.json`);
    } catch (fsError) {
        console.error('Failed to write to demo file:', fsError);
    }

    return res.status(200).json({
      success: true,
      lead: leadAnalysis
    });
  } catch (error) {
    console.error('Lead analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during analysis'
    });
  }
};

module.exports = { analyzeLead };
