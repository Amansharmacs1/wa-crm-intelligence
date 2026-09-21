const { z } = require('zod');

const analyzeLeadSchema = z.object({
  consent: z.object({
    granted: z.boolean(),
    purpose: z.string(),
    grantedAt: z.string(),
    scope: z.string()
  }),
  conversation: z.object({
    contactName: z.string().min(1, 'Contact name is required'),
    source: z.string().default('whatsapp-web'),
    capturedAt: z.string().optional(),
    messages: z.array(
      z.object({
        id: z.number().optional(),
        sender: z.enum(['customer', 'agent']),
        text: z.string().min(1, 'Message text cannot be empty'),
        metadata: z.string().optional()
      })
    ).min(1, 'At least one message is required')
  })
});

module.exports = { analyzeLeadSchema };
