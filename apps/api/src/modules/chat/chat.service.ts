import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/firebase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ChatProfile, Conversation, Message, VirtualNumber } from '@nexa/types';
import { ActivateChatInput, SendMessageInput } from '@nexa/validation';

export class ChatService {
  /**
   * Ativação da conta no NEXA Chat com validação estrita de posse da linha virtual.
   */
  static async activateChat(userUid: string, input: ActivateChatInput): Promise<ChatProfile> {
    const numberDoc = await db.collection('numbers').doc(input.numberId).get();
    if (!numberDoc.exists) {
      throw new AppError('Número virtual informado não existe.', 404, 'NUMBER_NOT_FOUND');
    }

    const number = numberDoc.data() as VirtualNumber;
    if (number.ownerUid !== userUid || number.status !== 'ACTIVE') {
      throw new AppError(
        'Você não é o proprietário desta linha NEXA ativa. Adquira um número na NEXA Mobile para entrar no chat.',
        403,
        'CHAT_ACTIVATION_FORBIDDEN'
      );
    }

    const now = new Date().toISOString();
    const profileRef = db.collection('chatProfiles').doc(userUid);
    const profile: ChatProfile = {
      uid: userUid,
      activeNumberId: number.numberId,
      formattedNumber: number.formatted,
      displayName: input.displayName,
      avatarUrl: null,
      about: input.about || 'Olá! Estou usando o NEXA Chat.',
      isOnline: true,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    };

    await profileRef.set(profile, { merge: true });
    return profile;
  }

  /**
   * Obtém o perfil de chat do usuário autenticado.
   */
  static async getProfile(userUid: string): Promise<ChatProfile> {
    const doc = await db.collection('chatProfiles').doc(userUid).get();
    if (!doc.exists) {
      throw new AppError('Perfil de chat não ativado.', 404, 'CHAT_PROFILE_NOT_FOUND');
    }
    return doc.data() as ChatProfile;
  }

  /**
   * Lista as conversas das quais o usuário faz parte.
   */
  static async listConversations(userUid: string): Promise<Conversation[]> {
    const snapshot = await db
      .collection('conversations')
      .where('memberUids', 'array-contains', userUid)
      .get();

    const conversations = snapshot.docs.map((doc: any) => doc.data() as Conversation);
    return conversations.sort((a: Conversation, b: Conversation) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Inicia conversa direta 1:1 informando o número NEXA do contato.
   */
  static async createDirectConversation(userUid: string, targetNumberFormatted: string): Promise<Conversation> {
    // Resolve o número do destinatário
    const snapshot = await db.collection('numbers').where('formatted', '==', targetNumberFormatted).get();
    if (snapshot.empty) {
      throw new AppError('Contato não encontrado com este número NEXA.', 404, 'CONTACT_NOT_FOUND');
    }

    const targetNumber = snapshot.docs[0].data() as VirtualNumber;
    if (!targetNumber.ownerUid) {
      throw new AppError('Este número ainda não foi ativado por nenhum usuário.', 404, 'CONTACT_NOT_ACTIVATED');
    }

    const recipientUid = targetNumber.ownerUid;
    if (recipientUid === userUid) {
      throw new AppError('Não é possível criar conversa consigo mesmo.', 400, 'SELF_CONVERSATION_PROHIBITED');
    }

    // Checa se já existe conversa entre os dois
    const existing = await db
      .collection('conversations')
      .where('memberUids', 'array-contains', userUid)
      .get();

    for (const doc of existing.docs) {
      const conv = doc.data() as Conversation;
      if (conv.type === 'DIRECT' && conv.memberUids.includes(recipientUid)) {
        return conv;
      }
    }

    const now = new Date().toISOString();
    const conversationId = `conv_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    const newConv: Conversation = {
      conversationId,
      type: 'DIRECT',
      memberUids: [userUid, recipientUid],
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('conversations').doc(conversationId).set(newConv);
    return newConv;
  }

  /**
   * Mensagens da conversa com ordenação cronológica.
   */
  static async getMessages(conversationId: string, userUid: string): Promise<Message[]> {
    const convDoc = await db.collection('conversations').doc(conversationId).get();
    if (!convDoc.exists) {
      throw new AppError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');
    }

    const conv = convDoc.data() as Conversation;
    if (!conv.memberUids.includes(userUid)) {
      throw new AppError('Você não tem permissão para visualizar mensagens desta conversa.', 403, 'FORBIDDEN');
    }

    const messagesSnapshot = await db
      .collection(`conversations/${conversationId}/messages`)
      .get();

    const messages = messagesSnapshot.docs.map((doc: any) => doc.data() as Message);
    return messages.sort((a: Message, b: Message) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  /**
   * Envio de mensagem com persistência autoritativa única no Firestore.
   */
  static async sendMessage(senderUid: string, input: SendMessageInput): Promise<Message> {
    const convRef = db.collection('conversations').doc(input.conversationId);
    const convDoc = await convRef.get();
    if (!convDoc.exists) {
      throw new AppError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');
    }

    const conv = convDoc.data() as Conversation;
    if (!conv.memberUids.includes(senderUid)) {
      throw new AppError('Você não participa desta conversa.', 403, 'FORBIDDEN');
    }

    const now = new Date().toISOString();
    const messageId = `msg_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    const messageDoc: Message = {
      messageId,
      conversationId: input.conversationId,
      senderUid,
      clientMessageId: input.clientMessageId,
      text: input.text,
      status: 'SENT',
      replyToMessageId: input.replyToMessageId,
      createdAt: now,
      updatedAt: now,
    };

    // Grava mensagem na subcoleção autoritativa
    await db.collection(`conversations/${input.conversationId}/messages`).doc(messageId).set(messageDoc);

    // Atualiza resumo da última mensagem na conversa
    await convRef.update({
      lastMessage: {
        text: input.text,
        senderUid,
        createdAt: now,
      },
      updatedAt: now,
    });

    return messageDoc;
  }

  /**
   * Criação de grupos no chat.
   */
  static async createGroup(ownerUid: string, title: string, memberUids: string[], photoUrl?: string): Promise<Conversation> {
    const allMembers = Array.from(new Set([ownerUid, ...memberUids]));
    const now = new Date().toISOString();
    const conversationId = `grp_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

    const group: Conversation = {
      conversationId,
      type: 'GROUP',
      title,
      photoUrl,
      memberUids: allMembers,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('conversations').doc(conversationId).set(group);
    return group;
  }

  /**
   * Catálogo de contatos do usuário.
   */
  static async getContacts(userUid: string): Promise<any[]> {
    const snapshot = await db.collection(`contacts/${userUid}/items`).get();
    return snapshot.docs.map((doc: any) => doc.data());
  }

  /**
   * Adiciona contato informando o número NEXA e um apelido privado opcional.
   */
  static async addContact(userUid: string, nexaNumber: string, nickname?: string): Promise<any> {
    const snapshot = await db.collection('numbers').where('formatted', '==', nexaNumber).get();
    if (snapshot.empty) {
      throw new AppError('Número NEXA não cadastrado.', 404, 'NUMBER_NOT_FOUND');
    }

    const number = snapshot.docs[0].data() as VirtualNumber;
    const contactId = `cnt_${uuidv4().substring(0, 8)}`;
    const contact = {
      contactId,
      targetUid: number.ownerUid || null,
      nexaNumber: number.formatted,
      nickname: nickname || number.formatted,
      createdAt: new Date().toISOString(),
    };

    await db.collection(`contacts/${userUid}/items`).doc(contactId).set(contact);
    return contact;
  }
}
