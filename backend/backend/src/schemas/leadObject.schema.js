const { z } = require('zod');

const leadObjectSchema = z.object({
  leadId: z.string().regex(/^LEAD-\d{8}-\d{3,}$/, {
    message: 'leadId must follow the format LEAD-YYYYMMDD-XXX'
  }),
  contactName: z.string().min(1, 'contactName must not be empty'),
  contactNumber: z.string().nullable(),
  chatTime: z.object({
    firstMessageAt: z.string().nullable(),
    lastMessageAt: z.string().nullable(),
    durationMinutes: z.number().nullable()
  }),
  intent: z.enum([
    'Site Visit',
    'Sell',
    'Buy',
    'General Enquiry'
  ]),
  language: z.enum(['Hindi', 'English', 'Hinglish', 'Other']),
  urgency: z.enum(['Low', 'Medium', 'High', 'Festival based']),
  urgencyReason: z.string(),
  priority: z.enum(['Hot', 'Warm', 'Cold', 'At-Risk']),
  followUpRequired: z.boolean(),
  followUpStatus: z.enum(['Not Required', 'Pending', 'Due', 'Missed', 'Completed']),
  category: z.enum(['Safe', 'At Risk']),
  leadScore: z.number().int().min(0).max(100),
  estimatedValue: z.object({
    amount: z.number().nullable(),
    currency: z.literal('INR'),
    displayValue: z.string().nullable()
  }),
  summary: z.string().min(10, 'summary must be a comprehensive summary'),
  buyingSignals: z.array(z.string()),
  recommendedAction: z.string().min(5, 'recommendedAction must be specific'),
  createdAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/))
});

const leadObjectArrayResponseSchema = z.object({
  success: z.literal(true),
  totalLeads: z.number().int().min(0),
  leads: z.array(leadObjectSchema)
});

module.exports = {
  leadObjectSchema,
  leadObjectArrayResponseSchema
};
