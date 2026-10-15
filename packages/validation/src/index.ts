import { z } from 'zod';

/**
 * NEXA Ecosystem — Schemas de Validação Universal Zod
 */

// 1. Telecom & Orders
export const createOrderSchema = z.object({
  numberId: z.string().min(1, 'O ID do número é obrigatório.'),
  idempotencyKey: z.string().uuid('A chave de idempotência deve ser um UUIDv4 válido.'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// 2. Pay & Checkout
export const confirmCheckoutSchema = z.object({
  ticket: z.string().min(16, 'O ticket de checkout informado é inválido.'),
  idempotencyKey: z.string().uuid('A chave de idempotência deve ser um UUIDv4 válido.'),
});

export type ConfirmCheckoutInput = z.infer<typeof confirmCheckoutSchema>;

export const internalPixTransferSchema = z.object({
  recipientKey: z.string().min(5, 'Chave de destinatário inválida.'),
  amountCents: z.number().int().positive('O valor deve ser um inteiro positivo em centavos.'),
  description: z.string().max(140, 'Descrição não pode exceder 140 caracteres.').optional(),
  idempotencyKey: z.string().uuid('A chave de idempotência deve ser um UUIDv4 válido.'),
});

export type InternalPixTransferInput = z.infer<typeof internalPixTransferSchema>;

// 3. Chat Profile & Activation
export const activateChatSchema = z.object({
  numberId: z.string().min(1, 'O número virtual NEXA é obrigatório.'),
  displayName: z.string().min(2, 'O nome deve conter pelo menos 2 caracteres.').max(50),
  about: z.string().max(160).optional(),
});

export type ActivateChatInput = z.infer<typeof activateChatSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  about: z.string().max(160).optional(),
  photoURL: z.string().url().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// 4. Chat Messaging
export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'ID da conversa é obrigatório.'),
  clientMessageId: z.string().min(1, 'ID otimista da mensagem é obrigatório.'),
  text: z.string().max(4000, 'Mensagem não pode exceder 4000 caracteres.').default(''),
  replyToMessageId: z.string().optional(),
  attachmentId: z.string().optional(),
}).refine(data => data.text.trim().length > 0 || !!data.attachmentId, {
  message: 'A mensagem deve conter texto ou anexo.',
  path: ['text'],
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// 5. Calls Signaling
export const callInviteSchema = z.object({
  targetUid: z.string().min(1, 'UID de destino é obrigatório.'),
  callType: z.enum(['AUDIO', 'VIDEO']),
});

export type CallInviteInput = z.infer<typeof callInviteSchema>;
