const { z } = require('zod');

const analyzeLeadSchema = z.object({
  consent: z.object({
    status: z.enum(['approved']),
    method: z.string(),
    requestedAt: z.string(),
    respondedAt: z.string(),
    response: z.string(),
    scope: z.string()
  }),
  conversation: z.object({
    contactName: z.string().min(1, 'Contact name is required'),
    source: z.string().default('whatsapp-web'),
    capturedAt: z.string().optional(),
    messages: z.array(
      z.object({
        id: z.string().optional(),
        sender: z.enum(['customer', 'agent']),
        text: z.string().min(1, 'Message text cannot be empty'),
        metadata: z.string().optional()
      })
    ).optional() // can be empty or missing if there are no prior messages
  })
});

module.exports = { analyzeLeadSchema };
