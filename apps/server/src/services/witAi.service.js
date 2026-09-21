/**
 * Meta WIT.ai Service
 * Integrates Meta Wit.ai NLP API for fast intent classification and entity recognition.
 */

const WIT_API_URL = 'https://api.wit.ai/message';
const WIT_API_VERSION = '20240304';

/**
 * Extract intent and entities from a single text query using Meta WIT.ai
 * @param {string} text 
 * @param {string} token 
 * @returns {Promise<{intents: Array, entities: Object, traits: Object, text: string}>}
 */
async function queryWitAi(text, token = process.env.WIT_AI_SERVER_TOKEN) {
  if (!token) {
    console.warn('[WitAiService] No WIT_AI_SERVER_TOKEN provided, skipping Wit.ai API call.');
    return { intents: [], entities: {}, traits: {}, text };
  }

  const cleanText = (text || '').trim();
  if (!cleanText) {
    return { intents: [], entities: {}, traits: {}, text: '' };
  }

  // Wit.ai message API works best with concise utterances (max 250 chars)
  const queryChunk = cleanText.length > 250 ? cleanText.substring(0, 250) : cleanText;
  const url = `${WIT_API_URL}?v=${WIT_API_VERSION}&q=${encodeURIComponent(queryChunk)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[WitAiService] Wit.ai responded with status ${response.status}: ${errorText}`);
      return { intents: [], entities: {}, traits: {}, text: cleanText };
    }

    const data = await response.json();
    return {
      intents: data.intents || [],
      entities: data.entities || {},
      traits: data.traits || {},
      text: cleanText
    };
  } catch (error) {
    console.error('[WitAiService] Error querying Wit.ai:', error.message);
    return { intents: [], entities: {}, traits: {}, text: cleanText };
  }
}

/**
 * Extract aggregated NLP entities and intents from a list of conversation messages
 * @param {Array<{sender: string, text: string}>} messages 
 * @returns {Promise<{topIntents: Array, entitiesSummary: Object, extractedSignals: Array<string>}>}
 */
async function analyzeConversationMessages(messages) {
  const customerMessages = (messages || [])
    .filter(m => m.sender === 'customer' && m.text && m.text.trim())
    .map(m => m.text.trim());

  if (customerMessages.length === 0) {
    return {
      topIntents: [],
      entitiesSummary: {},
      extractedSignals: []
    };
  }

  // Analyze the last 3 customer messages with Wit.ai for the most relevant real-time intent
  const recentUtterances = customerMessages.slice(-3);
  const results = await Promise.all(
    recentUtterances.map(txt => queryWitAi(txt))
  );

  const allIntents = [];
  const mergedEntities = {};
  const extractedSignals = [];

  for (const res of results) {
    if (res.intents && res.intents.length > 0) {
      allIntents.push(...res.intents);
    }
    if (res.entities) {
      for (const [key, val] of Object.entries(res.entities)) {
        if (!mergedEntities[key]) mergedEntities[key] = [];
        mergedEntities[key].push(...val);
      }
    }
  }

  // Sort intents by confidence descending
  allIntents.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

  // Extract signals from entities
  for (const [entityName, entityList] of Object.entries(mergedEntities)) {
    for (const item of entityList) {
      const val = item.value || item.body;
      if (val) {
        extractedSignals.push(`${entityName.replace('wit$', '')}: ${val}`);
      }
    }
  }

  return {
    topIntents: allIntents.slice(0, 3),
    entitiesSummary: mergedEntities,
    extractedSignals
  };
}

module.exports = {
  queryWitAi,
  analyzeConversationMessages
};
