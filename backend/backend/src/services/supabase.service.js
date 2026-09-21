global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

const isSupabaseConfigured = () => {
    return Boolean(supabaseUrl) && Boolean(supabaseServiceKey) && !supabaseUrl.includes('placeholder');
};

const upsertLead = async (leadData) => {
    if (!isSupabaseConfigured()) {
        console.warn('[SupabaseService] Supabase is not configured. Skipping DB upsert.');
        return null;
    }

    try {
        const { data: existingLead, error: searchError } = await supabase
            .from('leads')
            .select('*')
            .eq('contactName', leadData.contactName)
            .maybeSingle();

        if (searchError) {
            console.error('[SupabaseService] Error searching for lead:', searchError);
            throw searchError;
        }

        let payload = {};

        if (existingLead) {
            payload = {
                ...existingLead,
                ...leadData,
                leadId: existingLead.leadId,
                createdAt: existingLead.createdAt,
                updatedAt: new Date().toISOString()
            };
        } else {
            payload = {
                ...leadData,
                updatedAt: leadData.createdAt
            };
        }

        const { data: upsertedLead, error: upsertError } = await supabase
            .from('leads')
            .upsert(payload, { onConflict: 'leadId' })
            .select()
            .single();

        if (upsertError) {
            console.error('[SupabaseService] Error upserting lead:', upsertError);
            throw upsertError;
        }

        console.log(`[SupabaseService] Successfully upserted lead: ${upsertedLead.leadId}`);
        return upsertedLead;

    } catch (err) {
        console.error('[SupabaseService] Upsert failed:', err);
        return null;
    }
};

const getLeads = async (filters = {}) => {
    if (!isSupabaseConfigured()) {
        return [];
    }
    
    let query = supabase.from('leads').select('*').order('updatedAt', { ascending: false });

    if (filters.updatedAfter) {
        query = query.gte('updatedAt', filters.updatedAfter);
    }
    if (filters.category) {
        query = query.eq('category', filters.category);
    }
    if (filters.urgency) {
        query = query.eq('urgency', filters.urgency);
    }
    if (filters.followUpStatus) {
        query = query.eq('followUpStatus', filters.followUpStatus);
    }
    if (filters.limit) {
        query = query.limit(parseInt(filters.limit, 10));
    }

    const { data, error } = await query;
    if (error) {
        console.error('[SupabaseService] Error fetching leads:', error);
        return [];
    }
    return data;
};

module.exports = {
    supabase,
    isSupabaseConfigured,
    upsertLead,
    getLeads
};
