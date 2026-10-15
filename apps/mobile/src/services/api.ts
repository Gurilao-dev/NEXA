import { TelecomOrder, VirtualNumber, AuthUser } from '@nexa/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

class MobileApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
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
      throw new Error(errorData.detail || errorData.message || 'Erro na requisição');
    }

    return response.json();
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health/ready');
  }

  async getNumbers(query?: { ddd?: string; pattern?: string }): Promise<{ items: VirtualNumber[]; total: number }> {
    const params = new URLSearchParams();
    if (query?.ddd) params.append('ddd', query.ddd);
    if (query?.pattern) params.append('pattern', query.pattern);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ items: VirtualNumber[]; total: number }>(`/v1/mobile/numbers${queryString}`);
  }

  async getNumber(id: string): Promise<VirtualNumber> {
    return this.request<VirtualNumber>(`/v1/mobile/numbers/${id}`);
  }

  async createOrder(numberId: string): Promise<{ orderId: string; checkoutTicket: string; expiresAt: string; amountCents: number }> {
    const idempotencyKey = crypto.randomUUID();
    return this.request('/v1/mobile/orders', {
      method: 'POST',
      body: JSON.stringify({ numberId, idempotencyKey }),
    });
  }

  async getOrder(orderId: string): Promise<TelecomOrder> {
    return this.request<TelecomOrder>(`/v1/mobile/orders/${orderId}`);
  }

  async getMyNumbers(): Promise<{ items: VirtualNumber[]; total: number }> {
    return this.request<{ items: VirtualNumber[]; total: number }>('/v1/mobile/me/numbers');
  }

  async setPrimaryNumber(numberId: string): Promise<{ success: boolean; primaryNumberId: string }> {
    return this.request('/v1/mobile/me/primary-number', {
      method: 'PATCH',
      body: JSON.stringify({ numberId }),
    });
  }

  async getUserProfile(): Promise<AuthUser> {
    return this.request<AuthUser>('/v1/me');
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    return this.request<AuthUser>('/v1/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const mobileApi = new MobileApiClient();
