const fs = require('fs');
const path = 'backend/backend/src/controllers/lead.controller.js';
let content = fs.readFileSync(path, 'utf8');

const syncCode = `
const syncLeads = async (req, res, next) => {
    try {
        const { leads } = req.body;
        if (!Array.isArray(leads)) {
            return res.status(400).json({ success: false, message: 'Invalid payload, expected array of leads' });
        }
        
        const { upsertLead } = require('../services/supabase.service');
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

`;

content = content.replace('module.exports = {', syncCode + 'module.exports = {\n  syncLeads,');
fs.writeFileSync(path, content);
