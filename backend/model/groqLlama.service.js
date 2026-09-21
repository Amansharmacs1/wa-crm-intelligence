/**
 * Groq LLaMA Service
 * Provides deep sales reasoning, score calculation, objection handling,
 * and high-converting Hinglish response synthesis using Meta LLaMA models via Groq.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Execute a sales intelligence evaluation using LLaMA models on Groq
 * @param {Object} params
 * @param {string} params.contactName
 * @param {Array<{sender: string, text: string}>} params.messages
 * @param {Object} [params.witAiContext] Extra intent/entity context extracted from Meta WIT.ai
 * @param {string} [params.model]
 * @returns {Promise<Object>} Formatted sales analysis
 */
async function evaluateSalesConversation({
  contactName,
  messages,
  witAiContext = null,
  model = process.env.GROQ_MODEL || 'groq/compound-mini'
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in server environment.');
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

  const systemPrompt = `You are the Lead Scoring & Sales Intelligence Engine for Wa-CRM, an AI-powered revenue intelligence platform for WhatsApp sales.
Your role is to deeply analyze WhatsApp conversation transcripts, evaluate lead readiness, and guide the sales agent to close deals faster.

You must output STRICT, VALID JSON conforming exactly to this structure:
{
  "score": <number between 0 and 100>,
  "status": "<one of 'hot' | 'warm' | 'cold' | 'at_risk'>",
  "priority": "<one of 'high' | 'medium' | 'low'>",
  "intent": "<short descriptive intent string, e.g. 'Site Visit & Pricing', 'Commercial Demo'>",
  "estimatedValue": <realistic estimated deal value as an integer in INR, e.g. 500000 to 15000000>,
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
    "suggestedReply": "<a natural, persuasive, highly polite Hinglish (Hindi + English) or professional WhatsApp message for the agent to send immediately to convert this lead>"
  }
}

SCORING GUIDELINES:
- score 80-100 ('hot', 'high'): Strong buying signals, requested quote/visit/demo, high budget readiness.
- score 60-79 ('warm', 'medium'): Interested, asking clarifying questions, exploring options.
- score 40-59 ('at_risk', 'medium'/'high'): High intent previously but slowing down, objections raised, or missed agent follow-up.
- score 0-39 ('cold', 'low'): Low responsiveness, curt rejections, or complete mismatch.

Always tailor the suggestedReply with the customer's name (${contactName}) and address their specific questions or requests naturally.`;

  const userPrompt = `CUSTOMER NAME: ${contactName}

STAGE 1 WIT.AI EXTRACTION CONTEXT:
${witContextStr}

FULL WHATSAPP CONVERSATION TRANSCRIPT:
${formattedTranscript}

Analyze the above conversation and provide the complete sales evaluation in the required JSON format.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned an empty response.');
    }

    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('[GroqLlamaService] Inference failed:', error.message);
    throw error;
  }
}

module.exports = {
  evaluateSalesConversation
};
