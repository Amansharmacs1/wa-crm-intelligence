/**
 * Lead Transformation Service
 * Transforms approved WhatsApp conversation data into structured Lead objects
 * using Google Gemini as the primary AI engine with resilient validation & fallback.
 */

const { evaluateConversationWithGemini } = require('./gemini.service');
const { leadObjectSchema } = require('../backend/src/schemas/leadObject.schema');

// In-memory daily counter to guarantee unique sequence numbers for lead IDs: LEAD-YYYYMMDD-XXX
const dailyCounters = new Map();

/**
 * Generate a unique lead ID in the format LEAD-YYYYMMDD-XXX
 * @param {Date} [date]
 * @returns {string}
 */
function generateLeadId(date = new Date()) {
  const d = date instanceof Date && !isNaN(date) ? date : new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const dateKey = `${yyyy}${mm}${dd}`;

  const currentCount = (dailyCounters.get(dateKey) || 0) + 1;
  dailyCounters.set(dateKey, currentCount);

  const seq = String(currentCount).padStart(3, '0');
  return `LEAD-${dateKey}-${seq}`;
}

/**
 * Format numerical amount into Indian currency display value (₹85 L, ₹1.5 Cr, ₹50 K)
 * @param {number|null} amount 
 * @returns {string|null}
 */
function formatDisplayValue(amount) {
  if (amount == null || isNaN(amount) || amount <= 0) return null;
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${Number(cr.toFixed(2))} Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${Number(l.toFixed(2))} L`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${Number(k.toFixed(1))} K`;
  }
  return `₹${amount}`;
}

/**
 * Extract ISO timestamps and duration from messages
 * Returns null for missing/unavailable fields without inventing data.
 */
function extractChatTime(messages) {
  const validTimestamps = [];

  for (const m of messages) {
    const rawTime = m.timestamp || m.capturedAt || m.time;
    if (rawTime) {
      const parsed = new Date(rawTime);
      if (!isNaN(parsed.getTime())) {
        validTimestamps.push(parsed);
      }
    }
  }

  if (validTimestamps.length === 0) {
    return {
      firstMessageAt: null,
      lastMessageAt: null,
      durationMinutes: null
    };
  }

  validTimestamps.sort((a, b) => a - b);
  const first = validTimestamps[0];
  const last = validTimestamps[validTimestamps.length - 1];

  const durationMs = Math.max(0, last.getTime() - first.getTime());
  const durationMinutes = Math.round(durationMs / 60000);

  return {
    firstMessageAt: first.toISOString(),
    lastMessageAt: last.toISOString(),
    durationMinutes: durationMinutes
  };
}

/**
 * Pre-process and sanitize raw WhatsApp messages:
 * - Removes consent prompt and response messages
 * - Removes duplicates and empty messages
 * - Preserves order and sender attribution
 */
function sanitizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];

  const consentRequestPattern = /(consent|permission|terms and conditions|opt-in|to analyze your conversation|privacy policy|reply with 1 or yes to accept)/i;
  const consentResponsePattern = /^(yes|y|1|yes i agree|i agree|agree|no|n|2|opt in|stop|unsubscribe)$/i;

  const sanitized = [];
  let lastText = '';
  let lastSender = '';

  for (const msg of rawMessages) {
    if (!msg || typeof msg !== 'object') continue;
    const text = (msg.text || '').trim();
    if (!text) continue;

    // Filter out automated consent exchange
    if (consentRequestPattern.test(text) || consentResponsePattern.test(text)) {
      continue;
    }

    const sender = (msg.sender === 'agent' || msg.sender === 'bot') ? 'agent' : 'customer';

    // Remove consecutive identical duplicates
    if (text === lastText && sender === lastSender) {
      continue;
    }

    lastText = text;
    lastSender = sender;

    sanitized.push({
      sender,
      text,
      timestamp: msg.timestamp || msg.capturedAt || null
    });
  }

  return sanitized;
}

/**
 * Normalizes detected intent to strict enum value
 */
function normalizeIntent(rawIntent, text = '') {
  const validIntents = [
    'Buy', 'Sell', 'Site Visit', 'Product Enquiry', 'Price Enquiry',
    'Demo Request', 'Booking', 'Support', 'General Enquiry', 'Other'
  ];
  if (validIntents.includes(rawIntent)) return rawIntent;

  const lower = (rawIntent || '').toLowerCase();
  const lowerText = text.toLowerCase();

  // Strongest primary intent mapping
  if (lower.includes('site visit') || lowerText.includes('site visit') || lowerText.includes('flat dekhne') || lowerText.includes('dekhne aana') || lowerText.includes('visit')) {
    return 'Site Visit';
  }
  if (lower.includes('demo') || lowerText.includes('demo') || lowerText.includes('walkthrough')) {
    return 'Demo Request';
  }
  if (lower.includes('booking') || lower.includes('book') || lowerText.includes('booking') || lowerText.includes('slot book') || lowerText.includes('loi')) {
    return 'Booking';
  }
  if (lower.includes('price') || lower.includes('pricing') || lower.includes('rate') || lower.includes('cost') || lowerText.includes('price') || lowerText.includes('kimat') || lowerText.includes('keemat')) {
    return 'Price Enquiry';
  }
  if (lower.includes('buy') || lower.includes('purchase') || lowerText.includes('buy') || lowerText.includes('khareedna')) {
    return 'Buy';
  }
  if (lower.includes('sell') || lowerText.includes('sell') || lowerText.includes('bechna')) {
    return 'Sell';
  }
  if (lower.includes('product') || lower.includes('brochure') || lower.includes('feature') || lowerText.includes('brochure') || lowerText.includes('floor plan')) {
    return 'Product Enquiry';
  }
  if (lower.includes('support') || lowerText.includes('support') || lowerText.includes('issue')) {
    return 'Support';
  }
  if (lower.includes('general') || lowerText.includes('general')) {
    return 'General Enquiry';
  }

  return 'Other';
}

/**
 * Normalizes language to strict enum value
 */
function normalizeLanguage(rawLang, text = '') {
  const validLanguages = ['Hindi', 'English', 'Hinglish', 'Other'];
  if (validLanguages.includes(rawLang)) return rawLang;

  const lower = (rawLang || '').toLowerCase();
  if (lower === 'hindi' || /[\u0900-\u097F]/.test(text)) {
    return 'Hindi';
  }
  if (lower === 'hinglish' || /\b(kya|hai|hoga|chahiye|karna|batao|bhejo|hum|aap|bhai|dekhne|bhej|dekhna)\b/i.test(text)) {
    return 'Hinglish';
  }
  if (lower === 'english') {
    return 'English';
  }
  return 'English';
}

/**
 * Normalizes urgency to strict enum value
 */
function normalizeUrgency(rawUrgency, text = '') {
  const validUrgencies = ['Low', 'Medium', 'High', 'Critical'];
  if (validUrgencies.includes(rawUrgency)) return rawUrgency;

  const lower = (rawUrgency || '').toLowerCase();
  const lowerText = text.toLowerCase();

  if (lower === 'critical' || /\b(immediate|urgent|ab ke ab|aaj hi|today|asap)\b/i.test(lowerText)) {
    return 'Critical';
  }
  if (lower === 'high' || /\b(weekend|saturday|sunday|tomorrow|kal|by friday|by monday|thursday|diwali)\b/i.test(lowerText)) {
    return 'High';
  }
  if (lower === 'low' || /\b(just browsing|looking around|general enquiry)\b/i.test(lowerText)) {
    return 'Low';
  }
  return 'Medium';
}

/**
 * Normalizes followUpStatus to strict enum value
 */
function normalizeFollowUpStatus(rawStatus, followUpRequired = true, isLastFromCustomer = false) {
  const validStatuses = ['Not Required', 'Pending', 'Due', 'Missed', 'Completed'];
  if (validStatuses.includes(rawStatus)) return rawStatus;

  const lower = (rawStatus || '').toLowerCase();
  if (lower === 'missed') return 'Missed';
  if (lower === 'due') return 'Due';
  if (lower === 'completed') return 'Completed';
  if (lower === 'pending') return 'Pending';
  if (lower === 'not required' || !followUpRequired) return 'Not Required';

  return isLastFromCustomer ? 'Pending' : 'Completed';
}

/**
 * Normalizes category to strict enum value: Safe | At Risk
 */
function normalizeCategory(rawCat, followUpStatus, text = '', score = 75) {
  if (rawCat === 'Safe' || rawCat === 'At Risk') return rawCat;

  const lower = (rawCat || '').toLowerCase();
  if (lower === 'at risk' || lower === 'at_risk' || followUpStatus === 'Missed') {
    return 'At Risk';
  }
  if (lower === 'safe') {
    return 'Safe';
  }

  const lowerText = text.toLowerCase();
  const hasCompetitor = /lodha|godrej|oberoi|dlf|hiranandani|competitor|other project/i.test(lowerText);
  const hasObjection = /higher|expensive|discount|delay|concern/i.test(lowerText);

  if (hasCompetitor || hasObjection || followUpStatus === 'Missed') {
    return 'At Risk';
  }

  return 'Safe';
}

/**
 * Deterministic rule-based lead evaluation fallback
 */
function evaluateLeadDeterministically(contactName, contactNumber, messages, chatTime) {
  const fullText = messages.map(m => m.text).join(' ');
  const lowerText = fullText.toLowerCase();

  const customerMessages = messages.filter(m => m.sender === 'customer');

  const language = normalizeLanguage(null, fullText);
  const intent = normalizeIntent(null, fullText);
  const urgency = normalizeUrgency(null, fullText);

  let urgencyReason = 'Customer showed active interest in the conversation.';
  if (urgency === 'Critical') {
    urgencyReason = 'Customer requested immediate action today or indicated urgent decision timeline.';
  } else if (urgency === 'High') {
    urgencyReason = 'Customer wants to arrange a visit or take action soon (e.g. this week or weekend).';
  } else if (urgency === 'Low') {
    urgencyReason = 'General exploratory enquiry with no immediate timeline stated.';
  }

  // Scoring Rules
  let score = 0;
  const buyingSignals = [];

  if (/price|cost|rate|quotation|kitna|keemat|kimat/i.test(lowerText)) {
    score += 15;
    buyingSignals.push('Asked about final price or quotation');
  }
  if (/budget|cr|crore|crores|lakh|lakhs|under|range/i.test(lowerText)) {
    score += 15;
    buyingSignals.push('Shared a budget parameter');
  }
  if (/visit|demo|call|schedule|milna|dekhne/i.test(lowerText)) {
    score += 25;
    buyingSignals.push('Requested a site visit, demo, or phone consultation');
  }
  if (/weekend|tomorrow|saturday|sunday|friday|thursday|timeline|diwali|month/i.test(lowerText)) {
    score += 15;
    buyingSignals.push('Mentioned a specific purchase timeline');
  }
  if (/book|booking|token|loi|deposit|payment/i.test(lowerText)) {
    score += 20;
    buyingSignals.push('Asked about booking, LOI, or payment terms');
  }
  if (customerMessages.length >= 2) {
    score += 10;
    buyingSignals.push('Repeated customer engagement');
  }
  if (contactNumber) {
    score += 10;
    buyingSignals.push('Shared contact number');
  }
  if (/bad|poor|worst|waste|cheat|scam|bekaar/i.test(lowerText)) {
    score -= 10;
  }
  if (score === 0) {
    score = 25;
  }

  score = Math.min(100, Math.max(0, score));

  // Follow-up & Category Evaluation
  const lastMsg = messages[messages.length - 1];
  const isLastFromCustomer = lastMsg && lastMsg.sender === 'customer';
  const hasCompetitor = /lodha|godrej|oberoi|dlf|hiranandani|competitor|other project/i.test(lowerText);
  const hasObjection = /higher|expensive|discount|match|delay|concern/i.test(lowerText);

  let followUpRequired = true;
  let followUpStatus = 'Pending';
  let category = 'Safe';

  if (isLastFromCustomer && (score >= 60 || urgency === 'High' || urgency === 'Critical' || hasCompetitor || hasObjection)) {
    category = 'At Risk';
    followUpStatus = 'Missed';
  } else if (hasCompetitor || hasObjection) {
    category = 'At Risk';
    followUpStatus = 'Due';
  } else if (!isLastFromCustomer && !hasCompetitor && !hasObjection) {
    category = 'Safe';
    followUpStatus = 'Completed';
    followUpRequired = false;
  }

  // Estimated Value Extraction
  let amount = null;
  const crMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores|करोड़)/i);
  const lakhMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:l|lac|lacs|lakh|lakhs|लाख)/i);
  const numMatch = lowerText.match(/(?:rs\.?|inr|₹|रुपये|रुपए)\s*(\d[\d,]+)/i);

  if (crMatch) {
    amount = Math.round(parseFloat(crMatch[1]) * 10000000);
  } else if (lakhMatch) {
    amount = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (numMatch) {
    amount = parseInt(numMatch[1].replace(/,/g, ''), 10);
  }

  const estimatedValue = {
    amount: amount || null,
    currency: 'INR',
    displayValue: formatDisplayValue(amount)
  };

  let recommendedAction = `Contact ${contactName} promptly to progress the opportunity.`;
  if (intent === 'Site Visit') {
    recommendedAction = `Call ${contactName} immediately to confirm the requested site visit date and time.`;
  } else if (intent === 'Demo Request') {
    recommendedAction = `Schedule a product walkthrough demo with ${contactName} at their preferred time.`;
  } else if (intent === 'Price Enquiry') {
    recommendedAction = `Provide a detailed price walkthrough and quotation to ${contactName}.`;
  } else if (intent === 'Booking') {
    recommendedAction = `Send booking documentation to ${contactName} to lock the unit.`;
  }

  const summary = `${contactName} has expressed interest regarding ${intent.toLowerCase()} with ${urgency.toLowerCase()} urgency. The lead is evaluated with a score of ${score}/100 and classified as ${category} because ${category === 'At Risk' ? 'an important customer query or timeline requires immediate confirmation' : 'the opportunity is progressing in a normal cycle'}.`;

  return {
    contactName,
    contactNumber: contactNumber || null,
    chatTime,
    intent,
    language,
    urgency,
    urgencyReason,
    priority: score >= 75 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold',
    followUpRequired,
    followUpStatus,
    category,
    leadScore: score,
    estimatedValue,
    summary,
    buyingSignals,
    recommendedAction,
    createdAt: new Date().toISOString()
  };
}

/**
 * Transform a single conversation using Google Gemini AI
 */
async function transformSingleConversation(convData, index = 1) {
  const contactName = (convData.contactName || 'Unknown Contact').trim();
  const contactNumber = convData.contactNumber ? String(convData.contactNumber).trim() : null;
  const messages = sanitizeMessages(convData.messages || []);
  const chatTime = extractChatTime(convData.messages || []);

  const leadId = generateLeadId();

  if (messages.length === 0) {
    return {
      leadId,
      contactName,
      contactNumber,
      chatTime,
      intent: 'General Enquiry',
      language: 'English',
      urgency: 'Low',
      urgencyReason: 'No substantive conversation messages available.',
      priority: 'Cold',
      followUpRequired: false,
      followUpStatus: 'Not Required',
      category: 'Safe',
      leadScore: 20,
      estimatedValue: {
        amount: null,
        currency: 'INR',
        displayValue: null
      },
      summary: `${contactName} initiated contact, but no message history was recorded. Lead is in safe status with no action required.`,
      buyingSignals: [],
      recommendedAction: 'Verify customer contact details before initiating outreach.',
      createdAt: new Date().toISOString()
    };
  }

  const transcript = messages
    .map(m => `[${m.sender.toUpperCase()}]: ${m.text}`)
    .join('\n');

  const systemInstruction = `You are the Lead Intelligence Transformation Engine for Wa-CRM.
Analyze the provided WhatsApp conversation and return a single strictly formatted JSON object.

MANDATORY ENUMS (YOU MUST USE ONLY ONE OF THESE EXACT STRINGS):
- "intent": "Buy" | "Sell" | "Site Visit" | "Product Enquiry" | "Price Enquiry" | "Demo Request" | "Booking" | "Support" | "General Enquiry" | "Other"
  * Note: Choose only the single strongest primary intent. Do not combine words.
- "language": "Hindi" | "English" | "Hinglish" | "Other"
  * Note: Use "Hinglish" when Hindi and English are mixed in Roman script. Use "Hindi" for Devanagari script.
- "urgency": "Low" | "Medium" | "High" | "Critical"
- "urgencyReason": string explaining the urgency context or timeline driver.
- "priority": "Hot" | "Warm" | "Cold" | "At-Risk"
  * Note: Use "At-Risk" if they are highly likely to drop off. Use "Hot" for immediate intent. Use "Warm" for interested. Use "Cold" for unengaged.
- "followUpRequired": boolean (true/false)
- "followUpStatus": "Not Required" | "Pending" | "Due" | "Missed" | "Completed"
  * Note: Use "Missed" when customer showed meaningful intent but agent failed to respond appropriately.
- "category": "Safe" | "At Risk"
  * Note: Use "At Risk" when follow-up was missed, customer compares competitors, unresolved objection exists, or purchase timeline is urgent. Use "Safe" otherwise.
- "leadScore": integer between 0 and 100 based on suggested scoring rules (+15 price, +15 budget, +25 visit, +15 timeline, +20 booking, -10 negative).
- "estimatedValue": object { "amount": integer or null, "currency": "INR", "displayValue": string (e.g. "₹85 L", "₹4.5 Cr") or null }. NEVER invent value if not mentioned.
- "summary": 2-3 sentence professional sales summary.
- "buyingSignals": array of short detected strings.
- "recommendedAction": practical next step for the salesperson.

Output strictly valid JSON conforming to these fields.`;

  const userPrompt = `CUSTOMER NAME: ${contactName}
CONTACT NUMBER: ${contactNumber || 'None'}

CONVERSATION TRANSCRIPT:
${transcript}

Analyze the conversation and output JSON.`;

  try {
    const rawAiResult = await evaluateConversationWithGemini({
      contactName,
      messages,
      witAiContext: null,
      systemInstructionOverride: systemInstruction,
      userContentOverride: userPrompt
    });

    const isLastFromCustomer = messages[messages.length - 1]?.sender === 'customer';

    // Strictly normalize enums against transcript and AI response
    const intent = normalizeIntent(rawAiResult.intent, transcript);
    const language = normalizeLanguage(rawAiResult.language, transcript);
    const urgency = normalizeUrgency(rawAiResult.urgency, transcript);
    const followUpRequired = rawAiResult.followUpRequired !== undefined
      ? Boolean(rawAiResult.followUpRequired)
      : isLastFromCustomer;
    const followUpStatus = normalizeFollowUpStatus(rawAiResult.followUpStatus, followUpRequired, isLastFromCustomer);
    const leadScore = Math.min(100, Math.max(0, Math.round(Number(rawAiResult.leadScore ?? rawAiResult.score ?? 75))));
    const category = normalizeCategory(rawAiResult.category, followUpStatus, transcript, leadScore);

    let amount = rawAiResult.estimatedValue?.amount ?? (typeof rawAiResult.estimatedValue === 'number' ? rawAiResult.estimatedValue : null);
    if (typeof amount === 'number' && amount <= 0) amount = null;

    // Check if transcript had clear amount
    if (amount == null) {
      const crMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores|करोड़)/i);
      const lakhMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:l|lac|lacs|lakh|lakhs|लाख)/i);
      if (crMatch) amount = Math.round(parseFloat(crMatch[1]) * 10000000);
      else if (lakhMatch) amount = Math.round(parseFloat(lakhMatch[1]) * 100000);
    }

    const estimatedValue = {
      amount: amount,
      currency: 'INR',
      displayValue: rawAiResult.estimatedValue?.displayValue || formatDisplayValue(amount)
    };

    const candidateLead = {
      leadId,
      contactName,
      contactNumber,
      chatTime,
      intent,
      language,
      urgency,
      urgencyReason: rawAiResult.urgencyReason || 'Customer engaged with specific timeline requirements.',
      followUpRequired,
      followUpStatus,
      category,
      leadScore,
      estimatedValue,
      summary: rawAiResult.summary || `${contactName} is inquiring about ${intent.toLowerCase()}. Lead score is ${leadScore}/100 and classified as ${category}.`,
      buyingSignals: Array.isArray(rawAiResult.buyingSignals) ? rawAiResult.buyingSignals : [],
      recommendedAction: typeof rawAiResult.recommendedAction === 'string'
        ? rawAiResult.recommendedAction
        : (rawAiResult.recommendedAction?.reason || rawAiResult.recommendedAction?.suggestedReply || 'Follow up with customer promptly.'),
      createdAt: new Date().toISOString()
    };

    const parsed = leadObjectSchema.safeParse(candidateLead);
    if (parsed.success) {
      return parsed.data;
    } else {
      console.warn('[LeadTransformation] Schema parse warning, using deterministic normalization:', parsed.error.format());
      const fallback = evaluateLeadDeterministically(contactName, contactNumber, messages, chatTime);
      fallback.leadId = leadId;
      return fallback;
    }
  } catch (err) {
    if (process.env.BENCHMARK_SILENT !== 'true') {
      const summaryMsg = (err.message || 'Unknown error').split('\n')[0].slice(0, 100);
      console.warn('[LeadTransformation] AI invocation failed, using deterministic fallback:', summaryMsg);
    }
    const fallback = evaluateLeadDeterministically(contactName, contactNumber, messages, chatTime);
    fallback.leadId = leadId;
    return fallback;
  }
}

/**
 * Main transformation entry point
 * Handles single or multiple conversations and returns an array of structured lead objects.
 * @param {Object} payload 
 * @returns {Promise<Array<Object>>}
 */
async function transformConversations(payload) {
  const conversationsToProcess = [];

  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (item.conversation) {
        conversationsToProcess.push(item.conversation);
      } else if (item.contactName && item.messages) {
        conversationsToProcess.push(item);
      }
    }
  } else if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.conversations)) {
      conversationsToProcess.push(...payload.conversations);
    } else if (payload.conversation) {
      conversationsToProcess.push(payload.conversation);
    } else if (payload.contactName && payload.messages) {
      conversationsToProcess.push(payload);
    }
  }

  if (conversationsToProcess.length === 0) {
    return [];
  }

  const leads = [];
  for (let i = 0; i < conversationsToProcess.length; i++) {
    const lead = await transformSingleConversation(conversationsToProcess[i], i + 1);
    leads.push(lead);
  }

  return leads;
}

module.exports = {
  transformConversations,
  transformSingleConversation,
  sanitizeMessages,
  extractChatTime,
  generateLeadId,
  formatDisplayValue,
  evaluateLeadDeterministically,
  normalizeIntent,
  normalizeLanguage,
  normalizeUrgency,
  normalizeFollowUpStatus,
  normalizeCategory
};
