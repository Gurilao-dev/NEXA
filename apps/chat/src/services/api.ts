import { ChatProfile, Conversation, Message, VirtualNumber, AuthUser } from '@nexa/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

class ChatApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.authToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      const err: any = new Error(errorData.detail || errorData.message || 'Erro na requisição');
      err.status = response.status;
      err.code = errorData.code;
      throw err;
    }

    return response.json();
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health/ready');
  }

  async getMyNumbers(): Promise<{ items: VirtualNumber[]; total: number }> {
    return this.request<{ items: VirtualNumber[]; total: number }>('/v1/mobile/me/numbers');
  }

  async activateChat(data: { numberId: string; displayName: string; about?: string }): Promise<ChatProfile> {
    return this.request<ChatProfile>('/v1/chat/activate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ChatProfile> {
    return this.request<ChatProfile>('/v1/chat/me');
  }

  async listConversations(): Promise<{ items: Conversation[]; total: number }> {
    return this.request<{ items: Conversation[]; total: number }>('/v1/chat/conversations');
  }

  async createDirectConversation(targetNumberFormatted: string): Promise<Conversation> {
    return this.request<Conversation>('/v1/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ targetNumberFormatted }),
    });
  }

  async createGroup(data: { title: string; memberUids: string[]; photoUrl?: string }): Promise<Conversation> {
    return this.request<Conversation>('/v1/chat/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(conversationId: string): Promise<{ items: Message[]; total: number }> {
    return this.request<{ items: Message[]; total: number }>(`/v1/chat/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, data: { text: string; clientMessageId: string; replyToMessageId?: string; mediaUrl?: string; mediaType?: string }): Promise<Message> {
    return this.request<Message>(`/v1/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContacts(): Promise<{ items: any[]; total: number }> {
    return this.request<{ items: any[]; total: number }>('/v1/chat/contacts');
  }

  async addContact(nexaNumber: string, nickname?: string): Promise<any> {
    return this.request<any>('/v1/chat/contacts', {
      method: 'POST',
      body: JSON.stringify({ nexaNumber, nickname }),
    });
  }

  async getUploadAuthorization(folder?: string, fileType?: string): Promise<{
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    uploadUrl: string;
  }> {
    return this.request('/v1/media/upload-authorizations', {
      method: 'POST',
      body: JSON.stringify({ folder, fileType }),
    });
  }
}

export const chatApi = new ChatApiClient();
