/**
 * NEXA Ecosystem — Tipos do Mensageiro (NEXA Chat)
 */

export interface ChatProfile {
  uid: string;
  activeNumberId: string;
  formattedNumber: string;
  displayName: string;
  avatarUrl: string | null;
  about: string | null;
  lastSeen?: string;
  isOnline?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConversationType = 'DIRECT' | 'GROUP';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface ConversationMember {
  uid: string;
  role: MemberRole;
  joinedAt: string;
  lastReadTimestamp: string;
  unreadCount: number;
  isMuted: boolean;
}

export interface Conversation {
  conversationId: string;
  type: ConversationType;
  title?: string;
  photoUrl?: string;
  memberUids: string[];
  lastMessage?: {
    text: string;
    senderUid: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface MessageAttachment {
  attachmentId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  cloudinaryPublicId: string;
  secureUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  durationSeconds?: number;
}

export interface MessageReaction {
  emoji: string;
  userUid: string;
  createdAt: string;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderUid: string;
  clientMessageId: string;
  text: string;
  status: MessageStatus;
  attachment?: MessageAttachment;
  reactions?: MessageReaction[];
  replyToMessageId?: string;
  isEdited?: boolean;
  isDeletedForEveryone?: boolean;
  createdAt: string;
  updatedAt: string;
}
