const { z } = require('zod');

const conversationItemSchema = z.object({
  contactName: z.string().optional().default('Unknown Contact'),
  contactNumber: z.string().optional().nullable(),
  source: z.string().optional().default('whatsapp-web'),
  capturedAt: z.string().optional(),
  messages: z.array(
    z.object({
      id: z.union([z.number(), z.string()]).optional(),
      sender: z.enum(['customer', 'agent', 'bot']).optional().default('customer'),
      text: z.string().optional().default(''),
      timestamp: z.string().optional(),
      metadata: z.string().optional()
    }).passthrough()
  ).optional().default([])
}).passthrough();

const analyzeLeadSchema = z.object({
  consent: z.object({
    status: z.string().optional(),
    granted: z.boolean().optional(),
    purpose: z.string().optional(),
    grantedAt: z.string().optional(),
    scope: z.string().optional()
  }).passthrough().optional(),
  conversation: conversationItemSchema.optional(),
  conversations: z.array(conversationItemSchema).optional()
}).passthrough().refine(
  data => Boolean(data.conversation || (Array.isArray(data.conversations) && data.conversations.length > 0)),
  { message: 'Payload must contain either conversation object or conversations array' }
);

module.exports = { analyzeLeadSchema, conversationItemSchema };
