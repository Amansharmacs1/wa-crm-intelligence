const fs = require('fs');
const path = require('path');
const { generateMockAnalysis } = require('../services/mockAnalysis.service');
const { transformConversations } = require('../services/leadTransformation.service');
const { evaluateConversationWithGemini } = require('../services/gemini.service');
const { evaluateSalesConversation } = require('../services/groqLlama.service');
const { analyzeConversationMessages } = require('../services/witAi.service');

/**
 * Main Lead Analysis & Transformation Endpoint
 * Converts approved WhatsApp conversation data into an array of structured lead objects.
 */
const analyzeLead = async (req, res, next) => {
  try {
    const { consent, conversation } = req.body;

    // Strict consent check from HEAD
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

    // Process with the real AI pipeline from origin/model
    const leads = await transformConversations(req.body);

    console.log(`\n=== Transformed WhatsApp Conversations into ${leads.length} Structured Lead(s) ===`);
    if (leads[0]) {
      console.log(`Lead ID: ${leads[0].leadId} | Contact: ${leads[0].contactName} | Score: ${leads[0].leadScore} | Category: ${leads[0].category}`);
    }
    console.log('=================================================================================\n');

    // Append to demo file for debugging
    try {
        const demoFilePath = path.join(__dirname, '../../demo_leads.json');
        let existingData = [];
        if (fs.existsSync(demoFilePath)) {
            existingData = JSON.parse(fs.readFileSync(demoFilePath, 'utf8'));
        }
        
        existingData.push({
            timestamp: new Date().toISOString(),
            contactName: conversation.contactName,
            analysis: leads[0] || generateMockAnalysis(conversation.contactName),
            messageCount: conversation.messages.length
        });
        
        fs.writeFileSync(demoFilePath, JSON.stringify(existingData, null, 2));
        console.log(`\n✅ Lead data successfully appended to apps/server/demo_leads.json`);
    } catch (fsError) {
        console.error('Failed to write to demo file:', fsError);
    }

    return res.status(200).json({
      success: true,
      totalLeads: leads.length,
      leads: leads,
      // Provide first lead for backward compatibility with Chrome extension popup
      lead: leads[0] || null
    });
  } catch (error) {
    console.error('Lead analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during analysis'
    });
  }
};

/**
 * Direct Google Gemini analysis endpoint
 */
const analyzeWithGemini = async (req, res, next) => {
  try {
    const conversation = req.body.conversation || req.body;
    const { contactName, messages } = conversation;

    console.log(`[GeminiEndpoint] Analyzing conversation for ${contactName} via Google Gemini...`);
    const result = await evaluateConversationWithGemini({
      contactName: contactName || 'Unknown Contact',
      messages: messages || [],
      model: req.body.model || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
    });

    res.status(200).json({
      success: true,
      contactName,
      leadAnalysis: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Direct Groq LLaMA analysis endpoint
 */
const analyzeWithLlama = async (req, res, next) => {
  try {
    const conversation = req.body.conversation || req.body;
    const { contactName, messages } = conversation;

    console.log(`[LlamaEndpoint] Analyzing conversation for ${contactName} via Groq LLaMA...`);
    const result = await evaluateSalesConversation({
      contactName: contactName || 'Unknown Contact',
      messages: messages || [],
      model: req.body.model || process.env.GROQ_MODEL || 'groq/compound-mini'
    });

    res.status(200).json({
      success: true,
      contactName,
      leadAnalysis: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Direct WIT.ai analysis endpoint
 */
const analyzeWithWit = async (req, res, next) => {
  try {
    const conversation = req.body.conversation || req.body;
    const { contactName, messages } = conversation;

    console.log(`[WitEndpoint] Analyzing messages for ${contactName} via Meta WIT.ai...`);
    const witContext = await analyzeConversationMessages(messages || []);

    res.status(200).json({
      success: true,
      contactName,
      witAnalysis: witContext
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeLead,
  transformLeads: analyzeLead,
  analyzeWithGemini,
  analyzeWithLlama,
  analyzeWithWit
};
