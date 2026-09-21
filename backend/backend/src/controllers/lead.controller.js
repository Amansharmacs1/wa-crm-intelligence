const { appendAndMergeMessages } = require('../services/chatStorage.service');
const fs = require('fs');
const path = require('path');
const { generateMockAnalysis } = require('../../../model/mockAnalysis.service');
const { transformConversations } = require('../../../model/leadTransformation.service');
const { evaluateConversationWithGemini } = require('../../../model/gemini.service');
const { evaluateSalesConversation } = require('../../../model/groqLlama.service');
const { analyzeConversationMessages } = require('../../../model/witAi.service');

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
            analysisAllowed: false,
            reason: "Explicit customer consent is required before AI analysis.",
            requiredAction: "Request a clear YES or NO response."
        });
    }

    // Log the incoming conversation ONLY if in development and LOG_APPROVED_CHATS is true
    if (process.env.NODE_ENV === 'development' && process.env.LOG_APPROVED_CHATS === 'true') {
        console.log('\n[CONSENT APPROVED — DEVELOPMENT ONLY]');
        console.log(JSON.stringify(conversation, null, 2));
    }

    // Process with the real AI pipeline
    
    // Aggregation Feature: Save and aggregate full chat history
    if (conversation && conversation.contactName && conversation.messages) {
      const mergedMessages = appendAndMergeMessages(conversation.contactName, conversation.messages);
      // Replace the incoming payload messages with the full history
      req.body.conversation.messages = mergedMessages;
      console.log(`[ChatStorage] Merged new messages for ${conversation.contactName}. Total historical messages: ${mergedMessages.length}`);
    }

    const leads = await transformConversations(req.body);

    console.log(`\n=== Transformed WhatsApp Conversations into ${leads.length} Structured Lead(s) ===`);
    if (leads[0]) {
      console.log(`Lead ID: ${leads[0].leadId} | Contact: ${leads[0].contactName} | Score: ${leads[0].leadScore} | Category: ${leads[0].category}`);
    }
    console.log('=================================================================================\n');

    // Supabase upsert logic
    const { upsertLead } = require('../services/mongodb.service');
    
    const savedLeads = [];
    for (const lead of leads) {
        const savedLead = await upsertLead(lead);
        if (savedLead) savedLeads.push(savedLead);
    }

    return res.status(200).json({
      success: true,
      totalLeads: savedLeads.length > 0 ? savedLeads.length : leads.length,
      leads: savedLeads.length > 0 ? savedLeads : leads,
      lead: savedLeads.length > 0 ? savedLeads[0] : (leads[0] || null)
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

const getLeads = async (req, res, next) => {
    try {
        const { getLeads: fetchLeads } = require('../services/mongodb.service');
        const leads = await fetchLeads(req.query);
        res.status(200).json({
            success: true,
            total: leads.length,
            leads
        });
    } catch (err) {
        console.error('Error fetching leads:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch leads' });
    }
};

const getDashboardMetrics = async (req, res, next) => {
    try {
        const { getLeads: fetchLeads } = require('../services/mongodb.service');
        const leads = await fetchLeads({});
        
        const metrics = {
            totalLeads: leads.length,
            safeLeads: leads.filter(l => l.category === 'Safe').length,
            atRiskLeads: leads.filter(l => l.category === 'At Risk').length,
            highUrgency: leads.filter(l => l.urgency === 'High' || l.urgency === 'Critical').length,
            followUpsRequired: leads.filter(l => l.followUpRequired && l.followUpStatus !== 'Completed').length,
            estimatedPipelineValue: leads.reduce((sum, l) => sum + (l.estimatedValue?.amount || 0), 0),
            revenueAtRisk: leads.filter(l => l.category === 'At Risk').reduce((sum, l) => sum + (l.estimatedValue?.amount || 0), 0)
        };

        res.status(200).json({
            success: true,
            metrics,
            latestLeads: leads.slice(0, 10)
        });
    } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics' });
    }
};


const syncLeads = async (req, res, next) => {
    try {
        const { leads } = req.body;
        if (!Array.isArray(leads)) {
            return res.status(400).json({ success: false, message: 'Invalid payload, expected array of leads' });
        }
        
        const { upsertLead } = require('../services/mongodb.service');
        const savedLeads = [];
        
        for (const lead of leads) {
            // Frontend sends frontend mapped leads. We should map it back to DB format.
            const dbLead = {
                leadId: lead.id,
                contactName: lead.name,
                contactNumber: lead.phone,
                priority: lead.priority,
                category: lead.priority === 'Hot' ? 'At Risk' : 'Safe',
                summary: lead.lastMessage,
                leadScore: lead.score,
                estimatedValue: { amount: lead.dealValue, displayValue: lead.dealValueFormatted, currency: 'INR' },
                updatedAt: new Date().toISOString()
            };
            const saved = await upsertLead(dbLead);
            if (saved) savedLeads.push(saved);
        }
        
        res.status(200).json({ success: true, synced: savedLeads.length });
    } catch (err) {
        console.error('Error syncing leads:', err);
        res.status(500).json({ success: false, message: 'Failed to sync leads' });
    }
};

module.exports = {
  syncLeads,
  analyzeLead,
  transformLeads: analyzeLead,
  analyzeWithGemini,
  analyzeWithLlama,
  analyzeWithWit,
  getLeads,
  getDashboardMetrics
};
