import admin from 'firebase-admin';
import { env } from './env.js';

let isFirebaseInitialized = false;
let firestoreDb: any = null;
let authAdmin: any = null;

// Armazenamento em memória para desenvolvimento local isolado / testes sem credenciais
class InMemoryStore {
  private collections: Map<string, Map<string, any>> = new Map();

  private getCollection(name: string): Map<string, any> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }

  collection(collectionName: string) {
    const self = this;
    const col = this.getCollection(collectionName);

    return {
      doc(id?: string) {
        const docId = id || Math.random().toString(36).substring(2, 15);
        return {
          id: docId,
          collection(subColName: string) {
            return self.collection(`${collectionName}/${docId}/${subColName}`);
          },
          async get() {
            const data = col.get(docId);
            return {
              id: docId,
              exists: !!data,
              data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
            };
          },
          async set(data: any, options?: { merge?: boolean }) {
            const existing = col.get(docId);
            const toSave = options?.merge && existing ? { ...existing, ...data } : { ...data };
            col.set(docId, toSave);
            return { writeTime: new Date() };
          },
          async update(data: any) {
            const existing = col.get(docId);
            if (!existing) throw new Error(`Document ${docId} does not exist`);
            col.set(docId, { ...existing, ...data });
            return { writeTime: new Date() };
          },
          async delete() {
            col.delete(docId);
            return { writeTime: new Date() };
          },
        };
      },
      where(field: string, opStr: string, value: any) {
        return {
          async get() {
            const results: any[] = [];
            for (const [id, data] of col.entries()) {
              let match = false;
              if (opStr === '==' && data[field] === value) match = true;
              else if (opStr === '!=' && data[field] !== value) match = true;
              else if (opStr === '<' && data[field] < value) match = true;
              else if (opStr === '<=' && data[field] <= value) match = true;
              else if (opStr === '>' && data[field] > value) match = true;
              else if (opStr === '>=' && data[field] >= value) match = true;
              else if (opStr === 'array-contains' && Array.isArray(data[field]) && data[field].includes(value)) match = true;

              if (match) {
                results.push({
                  id,
                  exists: true,
                  data: () => JSON.parse(JSON.stringify(data)),
                });
              }
            }
            return {
              docs: results,
              empty: results.length === 0,
              size: results.length,
            };
          },
        };
      },
      async get() {
        const results: any[] = [];
        for (const [id, data] of col.entries()) {
          results.push({
            id,
            exists: true,
            data: () => JSON.parse(JSON.stringify(data)),
          });
        }
        return {
          docs: results,
          empty: results.length === 0,
          size: results.length,
        };
      },
    };
  }

  async runTransaction(updateFunction: (transaction: any) => Promise<any>): Promise<any> {
    const transaction = {
      get: async (docRef: any) => docRef.get(),
      set: (docRef: any, data: any, options?: any) => docRef.set(data, options),
      update: (docRef: any, data: any) => docRef.update(data),
      delete: (docRef: any) => docRef.delete(),
    };
    return updateFunction(transaction);
  }
}

const memoryStore = new InMemoryStore();

export function initializeFirebase() {
  if (isFirebaseInitialized) return { db: firestoreDb, auth: authAdmin, isMock: firestoreDb === memoryStore };

  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    try {
      let privateKey = env.FIREBASE_PRIVATE_KEY.trim();
      if (
        (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))
      ) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n').replace(/\r/g, '');

      const app =
        admin.apps.length > 0
          ? admin.app()
          : admin.initializeApp({
              credential: admin.credential.cert({
                projectId: env.FIREBASE_PROJECT_ID,
                clientEmail: env.FIREBASE_CLIENT_EMAIL,
                privateKey,
              }),
            });
      firestoreDb = admin.firestore(app);
      authAdmin = admin.auth(app);
      isFirebaseInitialized = true;
      console.log('✅ Firebase Admin SDK inicializado com credenciais reais.');
      return { db: firestoreDb, auth: authAdmin, isMock: false };
    } catch (err) {
      console.warn('⚠️ Falha ao inicializar Firebase Admin com credenciais, ativando adaptador local:', err);
    }
  } else if (env.FIRESTORE_EMULATOR_HOST) {
    admin.initializeApp({ projectId: env.FIREBASE_PROJECT_ID || 'nexa-ecosystem-demo' });
    firestoreDb = admin.firestore();
    authAdmin = admin.auth();
    isFirebaseInitialized = true;
    console.log('✅ Firebase Admin SDK conectado ao emulador local:', env.FIRESTORE_EMULATOR_HOST);
    return { db: firestoreDb, auth: authAdmin, isMock: false };
  }

  // Fallback seguro em memória para desenvolvimento e testes
  firestoreDb = memoryStore;
  authAdmin = {
    async verifyIdToken(token: string) {
      if (token.startsWith('mock_')) {
        return {
          uid: token.replace('mock_', ''),
          email: `${token.replace('mock_', '')}@nexa.local`,
          email_verified: true,
        };
      }
      throw new Error('Token inválido');
    },
    async createCustomToken(uid: string) {
      return `custom_token_${uid}`;
    },
  };

  isFirebaseInitialized = true;
  console.log('ℹ️ Firebase operando com armazenamento transacional local em memória (modo dev/teste).');
  return { db: firestoreDb, auth: authAdmin, isMock: true };
}

export const { db, auth } = initializeFirebase();
