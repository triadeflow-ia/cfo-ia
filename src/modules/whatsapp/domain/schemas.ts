/**
 * Domain schemas for WhatsApp module
 */

import { z } from 'zod'

export const PhoneE164Schema = z.string().regex(/^\+[1-9]\d{1,14}$/, 'Formato E.164 inválido')

export const CreateWhatsappUserLinkSchema = z.object({
  userId: z.string().min(1),
  phoneE164: PhoneE164Schema,
  isActive: z.boolean().optional().default(true),
})

export const UpdateWhatsappUserLinkSchema = CreateWhatsappUserLinkSchema.partial()

export const WebhookMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  type: z.enum(['text', 'interactive', 'button']),
  text: z.object({
    body: z.string(),
  }).optional(),
  interactive: z.object({
    type: z.string(),
    button_reply: z.object({
      id: z.string(),
      title: z.string(),
    }).optional(),
  }).optional(),
  timestamp: z.string(),
})

export const WebhookPayloadSchema = z.object({
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: z.object({
        messaging_product: z.string(),
        metadata: z.object({
          display_phone_number: z.string(),
          phone_number_id: z.string(),
        }),
        contacts: z.array(z.object({
          profile: z.object({
            name: z.string(),
          }),
          wa_id: z.string(),
        })).optional(),
        messages: z.array(WebhookMessageSchema).optional(),
        statuses: z.array(z.object({
          id: z.string(),
          status: z.string(),
        })).optional(),
      }),
    })),
  })),
})

export const ConfirmActionSchema = z.object({
  actionId: z.string(),
  confirm: z.boolean(),
})





