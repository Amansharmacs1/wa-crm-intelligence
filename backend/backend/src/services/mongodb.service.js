const mongoose = require('mongoose');
const Lead = require('../models/Lead');

const getMongoUrl = () => process.env.MONGO_URL || '';

const isMongoConfigured = () => {
    const url = getMongoUrl();
    return Boolean(url) && url.startsWith('mongodb');
};

const connectDB = async () => {
    if (!isMongoConfigured()) {
        console.warn('[MongoDB] MONGO_URL is not configured. Skipping DB connection.');
        return;
    }
    
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(getMongoUrl(), { family: 4 });
        console.log('[MongoDB] Connected successfully to Database');
    } catch (err) {
        console.error('[MongoDB] Connection error:', err);
    }
};

const upsertLead = async (leadData) => {
    if (!isMongoConfigured()) {
        console.warn('[MongoDB] MONGO_URL not configured. Skipping DB upsert.');
        return null;
    }

    try {
        await connectDB();
        
        let payload = {
            ...leadData,
            updatedAt: new Date().toISOString()
        };

        const upsertedLead = await Lead.findOneAndUpdate(
            { contactName: leadData.contactName }, // Assuming contactName is unique per user chat
            { $set: payload },
            { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
        ).lean();

        console.log(`[MongoDB] Successfully upserted lead: ${upsertedLead.leadId}`);
        return upsertedLead;
    } catch (err) {
        console.error('[MongoDB] Upsert failed:', err);
        return null;
    }
};

const getLeads = async (filters = {}) => {
    if (!isMongoConfigured()) {
        return [];
    }
    
    try {
        await connectDB();

        let query = {};
        
        if (filters.updatedAfter) {
            query.updatedAt = { $gte: new Date(filters.updatedAfter) };
        }
        if (filters.category) {
            query.category = filters.category;
        }
        if (filters.urgency) {
            query.urgency = filters.urgency;
        }
        if (filters.followUpStatus) {
            query.followUpStatus = filters.followUpStatus;
        }

        let mongooseQuery = Lead.find(query).sort({ updatedAt: -1 });

        if (filters.limit) {
            mongooseQuery = mongooseQuery.limit(parseInt(filters.limit, 10));
        }

        const data = await mongooseQuery.lean();
        return data;
    } catch (error) {
        console.error('[MongoDB] Error fetching leads:', error);
        return [];
    }
};

module.exports = {
    connectDB,
    isMongoConfigured,
    upsertLead,
    getLeads
};
