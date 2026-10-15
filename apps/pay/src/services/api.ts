import { CheckoutPreview, PaymentReceipt, Wallet, WalletLedgerEntry } from '@nexa/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

class PayApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('nexa_pay_guest_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('nexa_pay_guest_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('nexa_pay_guest_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
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

  async initGuestSession(): Promise<{ guestUid: string; token: string; balanceCents: number }> {
    const data = await this.request<{ guestUid: string; token: string; balanceCents: number }>(
      '/v1/guest/session',
      { method: 'POST' }
    );
    this.setToken(data.token);
    return data;
  }

  async getWallet(): Promise<Wallet> {
    if (!this.getToken()) {
      await this.initGuestSession();
    }
    return this.request<Wallet>('/v1/pay/wallet');
  }

  async getTransactions(): Promise<{ items: WalletLedgerEntry[]; count: number }> {
    return this.request<{ items: WalletLedgerEntry[]; count: number }>('/v1/pay/transactions');
  }

  async getReceipt(receiptId: string): Promise<PaymentReceipt> {
    return this.request<PaymentReceipt>(`/v1/pay/transactions/${receiptId}`);
  }

  async transferPix(
    recipientKey: string,
    amountCents: number,
    description?: string
  ): Promise<PaymentReceipt> {
    const idempotencyKey = crypto.randomUUID();
    return this.request<PaymentReceipt>('/v1/pay/transfers', {
      method: 'POST',
      body: JSON.stringify({
        recipientKey,
        amountCents,
        description,
        idempotencyKey,
      }),
    });
  }

  async getCheckoutPreview(ticket: string): Promise<CheckoutPreview> {
    return this.request<CheckoutPreview>(`/v1/pay/checkouts/${ticket}`);
  }

  async confirmCheckout(ticket: string): Promise<PaymentReceipt> {
    const idempotencyKey = crypto.randomUUID();
    return this.request<PaymentReceipt>(`/v1/pay/checkouts/${ticket}/confirm`, {
      method: 'POST',
      body: JSON.stringify({
        ticket,
        idempotencyKey,
      }),
    });
  }
}

export const payApi = new PayApiClient();
