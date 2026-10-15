import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import { ChatService } from './chat.service.js';
import { activateChatSchema, sendMessageSchema } from '@nexa/validation';

export async function chatRoutes(fastify: FastifyInstance) {
  // Ativação do chat exigindo posse de número virtual
  fastify.post('/v1/chat/activate', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const input = activateChatSchema.parse(request.body);
    const profile = await ChatService.activateChat(user.uid, input);
    return profile;
  });

  // Obter perfil de chat
  fastify.get('/v1/chat/me', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const profile = await ChatService.getProfile(user.uid);
    return profile;
  });

  // Listar conversas
  fastify.get('/v1/chat/conversations', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const conversations = await ChatService.listConversations(user.uid);
    return { items: conversations, total: conversations.length };
  });

  // Iniciar conversa direta informando o número do contato
  fastify.post('/v1/chat/conversations', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const { targetNumberFormatted } = request.body as { targetNumberFormatted: string };
    const conversation = await ChatService.createDirectConversation(user.uid, targetNumberFormatted);
    return conversation;
  });

  // Mensagens da conversa
  fastify.get('/v1/chat/conversations/:id/messages', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const { id } = request.params as { id: string };
    const messages = await ChatService.getMessages(id, user.uid);
    return { items: messages, total: messages.length };
  });

  // Enviar mensagem (caminho autoritativo com escrita no Firestore)
  fastify.post('/v1/chat/conversations/:id/messages', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    const { id } = request.params as { id: string };
    const body = { ...(request.body as object), conversationId: id };
    const input = sendMessageSchema.parse(body);
    const message = await ChatService.sendMessage(user.uid, input);
    return reply.status(201).send(message);
  });

  // Criar grupo
  fastify.post('/v1/chat/groups', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    const { title, memberUids, photoUrl } = request.body as { title: string; memberUids: string[]; photoUrl?: string };
    const group = await ChatService.createGroup(user.uid, title, memberUids, photoUrl);
    return reply.status(201).send(group);
  });

  // Contatos
  fastify.get('/v1/chat/contacts', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const contacts = await ChatService.getContacts(user.uid);
    return { items: contacts, total: contacts.length };
  });

  fastify.post('/v1/chat/contacts', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const { nexaNumber, nickname } = request.body as { nexaNumber: string; nickname?: string };
    const contact = await ChatService.addContact(user.uid, nexaNumber, nickname);
    return contact;
  });
}
