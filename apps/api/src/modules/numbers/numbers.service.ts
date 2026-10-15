import { db } from '../../config/firebase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { VirtualNumber, NumberPattern, NumberStatus } from '@nexa/types';

export class NumbersService {
  /**
   * Inicializa o catálogo de números virtuais com dados de alta qualidade se estiver vazio.
   */
  static async seedNumbersIfEmpty(): Promise<void> {
    const snapshot = await db.collection('numbers').get();
    if (!snapshot.empty) return;

    const sampleNumbers: Array<{ ddd: string; suffix: string; pattern: NumberPattern; priceCents: number }> = [
      { ddd: '11', suffix: '98888-0001', pattern: 'platinum', priceCents: 9990 },
      { ddd: '11', suffix: '98765-4321', pattern: 'consecutive', priceCents: 6990 },
      { ddd: '11', suffix: '99123-1234', pattern: 'golden', priceCents: 4990 },
      { ddd: '11', suffix: '97452-8910', pattern: 'standard', priceCents: 2990 },
      { ddd: '11', suffix: '96321-4587', pattern: 'standard', priceCents: 2990 },
      { ddd: '21', suffix: '99999-2121', pattern: 'platinum', priceCents: 9990 },
      { ddd: '21', suffix: '98811-2233', pattern: 'golden', priceCents: 4990 },
      { ddd: '21', suffix: '97100-5020', pattern: 'standard', priceCents: 2990 },
      { ddd: '21', suffix: '96541-2365', pattern: 'standard', priceCents: 2990 },
      { ddd: '31', suffix: '99876-5432', pattern: 'consecutive', priceCents: 6990 },
      { ddd: '31', suffix: '98450-3020', pattern: 'standard', priceCents: 2990 },
      { ddd: '41', suffix: '99111-4141', pattern: 'golden', priceCents: 4990 },
      { ddd: '41', suffix: '97320-1090', pattern: 'standard', priceCents: 2990 },
      { ddd: '51', suffix: '99555-5151', pattern: 'golden', priceCents: 4990 },
      { ddd: '51', suffix: '98124-7896', pattern: 'standard', priceCents: 2990 },
      { ddd: '61', suffix: '99961-0001', pattern: 'platinum', priceCents: 9990 },
      { ddd: '71', suffix: '98771-1020', pattern: 'standard', priceCents: 2990 },
      { ddd: '81', suffix: '99881-8181', pattern: 'golden', priceCents: 4990 },
      { ddd: '85', suffix: '98885-1234', pattern: 'golden', priceCents: 4990 },
      { ddd: '91', suffix: '99191-5060', pattern: 'standard', priceCents: 2990 },
    ];

    const now = new Date().toISOString();
    for (const item of sampleNumbers) {
      const e164 = `+55${item.ddd}${item.suffix.replace(/[^0-9]/g, '')}`;
      const formatted = `+55 (${item.ddd}) ${item.suffix}`;
      const numberId = `num_${item.ddd}_${item.suffix.replace(/[^0-9]/g, '')}`;

      const numDoc: VirtualNumber = {
        numberId,
        e164,
        formatted,
        ddd: item.ddd,
        pattern: item.pattern,
        priceCents: item.priceCents,
        status: 'AVAILABLE',
        ownerUid: null,
        reservedUntil: null,
        reservedByUid: null,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('numbers').doc(numberId).set(numDoc);
    }
  }

  /**
   * Lista catálogo de números com filtros de DDD, padrão e status.
   */
  static async listNumbers(query: { ddd?: string; pattern?: string; status?: NumberStatus }): Promise<VirtualNumber[]> {
    await this.seedNumbersIfEmpty();

    const snapshot = await db.collection('numbers').get();
    let numbers = snapshot.docs.map((doc: any) => doc.data() as VirtualNumber);

    if (query.ddd) {
      numbers = numbers.filter((n: VirtualNumber) => n.ddd === query.ddd);
    }

    if (query.pattern) {
      numbers = numbers.filter((n: VirtualNumber) => n.pattern === query.pattern);
    }

    if (query.status) {
      numbers = numbers.filter((n: VirtualNumber) => n.status === query.status);
    } else {
      // Por padrão, exibe apenas números disponíveis
      numbers = numbers.filter((n: VirtualNumber) => n.status === 'AVAILABLE');
    }

    return numbers;
  }

  /**
   * Detalhes de um número virtual específico.
   */
  static async getNumber(numberId: string): Promise<VirtualNumber> {
    const doc = await db.collection('numbers').doc(numberId).get();
    if (!doc.exists) {
      throw new AppError('Número virtual não encontrado.', 404, 'NUMBER_NOT_FOUND');
    }
    return doc.data() as VirtualNumber;
  }
}
