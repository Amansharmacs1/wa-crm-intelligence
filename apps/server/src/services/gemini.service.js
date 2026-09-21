/**
 * Google Gemini AI Service
 * Provides deep conversational reasoning, lead qualification (0-100 score),
 * objection/risk extraction, and high-conversion Hinglish sales replies using Google Gemini models.
 */

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Preferred model fallback chain to handle transient high demand (503) seamlessly
const MODEL_FALLBACK_CANDIDATES = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
];

/**
 * Evaluate a WhatsApp conversation using Google Gemini AI with automatic resilient model failover
 * @param {Object} params
 * @param {string} params.contactName
 * @param {Array<{sender: string, text: string}>} params.messages
 * @param {Object} [params.witAiContext] Extra intent/entity context from Meta WIT.ai
 * @param {string} [params.model]
 * @param {string} [params.systemInstructionOverride] Custom system prompt
 * @param {string} [params.userContentOverride] Custom user content prompt
 * @returns {Promise<Object>} Formatted sales analysis
 */
async function evaluateConversationWithGemini({
  contactName,
  messages,
  witAiContext = null,
  model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  systemInstructionOverride = null,
  userContentOverride = null
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const formattedTranscript = (messages || [])
    .map(m => `[${(m.sender || 'unknown').toUpperCase()}]: ${m.text}`)
    .join('\n');

  let witContextStr = 'No Wit.ai entities detected.';
  if (witAiContext) {
    const intents = (witAiContext.topIntents || []).map(i => `${i.name} (conf: ${Math.round((i.confidence || 0) * 100)}%)`).join(', ');
    const signals = (witAiContext.extractedSignals || []).join('; ');
    witContextStr = `Extracted Intents: ${intents || 'None'}\nExtracted Entities/Signals: ${signals || 'None'}`;
  }

  const defaultSystemInstruction = `You are the Chief Sales Intelligence Engine for Wa-CRM, an AI-powered revenue intelligence platform for WhatsApp sales.
Your role is to deeply analyze WhatsApp conversation transcripts, evaluate lead readiness, and guide the sales rep to close deals faster.

You must output STRICT, VALID JSON conforming exactly to this structure:
{
  "score": <number between 0 and 100>,
  "status": "<one of 'hot' | 'warm' | 'cold' | 'at_risk'>",
  "priority": "<one of 'high' | 'medium' | 'low'>",
  "intent": "<one of 'Buy' | 'Sell' | 'Site Visit' | 'Product Enquiry' | 'Price Enquiry' | 'Demo Request' | 'Booking' | 'Support' | 'General Enquiry' | 'Other'>",
  "estimatedValue": <realistic estimated deal value as an integer in INR, e.g. 500000 to 15000000, or null if not mentioned>,
  "currency": "INR",
  "conversionLikelihood": <float between 0.00 and 1.00>,
  "sentiment": "<one of 'positive' | 'neutral' | 'skeptical' | 'frustrated'>",
  "summary": "<2-3 sentence strategic executive summary of where this prospect stands in the pipeline>",
  "buyingSignals": ["<specific buying signal 1>", "<signal 2>", "<signal 3>"],
  "objections": ["<explicit or implicit objection or friction point, e.g. pricing, timeline>"],
  "riskFactors": ["<risk factor such as unresponsive delay, competitive interest, missing decision maker>"],
  "recommendedAction": {
    "type": "<one of 'urgent_follow_up' | 'pricing_walkthrough' | 'demo_booking' | 'discount_approval' | 're_engage'>",
    "reason": "<clear explanation for the sales rep on WHY this action should be taken now>",
    "suggestedReply": "<a natural, persuasive, polite Hinglish (Hindi + English) or professional WhatsApp message for the agent to send immediately to convert this lead>"
  }
}

SCORING GUIDELINES:
- score 80-100 ('hot', 'high'): Strong buying signals, requested quote/visit/demo, high budget readiness.
- score 60-79 ('warm', 'medium'): Interested, asking clarifying questions, exploring options.
- score 40-59 ('at_risk', 'medium'/'high'): High intent previously but slowing down, objections raised, or missed agent follow-up.
- score 0-39 ('cold', 'low'): Low responsiveness, curt rejections, or complete mismatch.

Always tailor the suggestedReply with the customer's name (${contactName}) and address their specific questions or requests naturally.`;

  const defaultUserContent = `CUSTOMER NAME: ${contactName}

STAGE 1 WIT.AI EXTRACTION CONTEXT:
${witContextStr}

FULL WHATSAPP CONVERSATION TRANSCRIPT:
${formattedTranscript}

Analyze the conversation and return the complete sales evaluation in the required JSON format.`;

  const systemInstruction = systemInstructionOverride || defaultSystemInstruction;
  const userContent = userContentOverride || defaultUserContent;

  // Build model attempt list starting with requested model
  const modelsToTry = [model, ...MODEL_FALLBACK_CANDIDATES.filter(m => m !== model)];
  let lastError = null;

  for (const targetModel of modelsToTry) {
    const requestUrl = `${GEMINI_API_BASE_URL}/${targetModel}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userContent }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // If 503 (high demand), 404, or 429 (rate limited), try next model in fallback list
        if (response.status === 503 || response.status === 404 || response.status === 429) {
          console.warn(`[GeminiService] Model ${targetModel} returned ${response.status}. Trying next available model...`);
          lastError = new Error(`Model ${targetModel} unavailable (${response.status}): ${errorText.slice(0, 150)}`);
          continue;
        }
        throw new Error(`Google Gemini API returned HTTP ${response.status}: ${errorText.slice(0, 150)}`);
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        throw new Error(`Google Gemini (${targetModel}) returned an empty response.`);
      }

      const parsed = JSON.parse(candidateText);
      return parsed;
    } catch (err) {
      lastError = err;
      if (err.message && (err.message.includes('503') || err.message.includes('429'))) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Google Gemini models failed.');
}

module.exports = {
  evaluateConversationWithGemini
};
