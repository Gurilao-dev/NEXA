import React, { createContext, useContext, useState, useEffect } from 'react';
import { mobileApi } from '../services/api.js';
import {
  firebaseAuth,
  firebaseGoogleProvider,
  isFirebaseConfigured,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onIdTokenChanged,
} from '../services/firebase.js';
import { AuthUser } from '@nexa/types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Inicialização de sessão e sincronização de tokens
  useEffect(() => {
    // 1. Tenta carregar dados em cache para renderização inicial instantânea
    const savedToken = localStorage.getItem('nexa_mobile_auth_token');
    const savedUser = localStorage.getItem('nexa_mobile_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        mobileApi.setAuthToken(savedToken);
      } catch {
        localStorage.removeItem('nexa_mobile_auth_token');
        localStorage.removeItem('nexa_mobile_auth_user');
      }
    }

    // Se Firebase não estiver configurado (ex: modo dev offline)
    if (!isFirebaseConfigured || !firebaseAuth) {
      setLoading(false);
      return;
    }

    // 2. Trata retorno de fluxo Redirect caso popup tenha sido bloqueado
    getRedirectResult(firebaseAuth)
      .then(async (result) => {
        if (result?.user) {
          const idToken = await result.user.getIdToken();
          localStorage.setItem('nexa_mobile_auth_token', idToken);
          mobileApi.setAuthToken(idToken);
          setToken(idToken);
          try {
            const profile = await mobileApi.getUserProfile();
            setUser(profile);
            localStorage.setItem('nexa_mobile_auth_user', JSON.stringify(profile));
          } catch (profileErr) {
            console.error('[NEXA Mobile] Erro ao obter perfil após redirect:', profileErr);
          }
        }
      })
      .catch((err) => {
        console.error('[NEXA Mobile] Erro no redirect de autenticação:', err);
      });

    // 3. Listener de tokens Firebase: garante que o ID Token seja sempre válido e renovado
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          localStorage.setItem('nexa_mobile_auth_token', idToken);
          mobileApi.setAuthToken(idToken);
          setToken(idToken);

          // Sincroniza dados atualizados com o backend
          const profile = await mobileApi.getUserProfile();
          setUser(profile);
          localStorage.setItem('nexa_mobile_auth_user', JSON.stringify(profile));
        } catch (err) {
          console.error('[NEXA Mobile] Erro ao sincronizar sessão Firebase com backend:', err);
        }
      } else {
        if (isFirebaseConfigured) {
          setUser(null);
          setToken(null);
          mobileApi.setAuthToken(null);
          localStorage.removeItem('nexa_mobile_auth_token');
          localStorage.removeItem('nexa_mobile_auth_user');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);

    // Validação de configuração
    if (!isFirebaseConfigured || !firebaseAuth || !firebaseGoogleProvider) {
      if (import.meta.env.PROD) {
        const errorMsg = 'Firebase Authentication não está configurado. Configure as variáveis VITE_FIREBASE_* na Vercel.';
        console.error(`[NEXA Mobile] ${errorMsg}`);
        setAuthError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      // Em desenvolvimento local sem credenciais Firebase, fallback seguro para testes
      console.warn('[NEXA Mobile] Firebase não configurado em ambiente dev. Usando sessão local de teste.');
      try {
        const mockUid = `usr_${Math.random().toString(36).substring(2, 10)}`;
        const mockToken = `mock_${mockUid}`;

        localStorage.setItem('nexa_mobile_auth_token', mockToken);
        mobileApi.setAuthToken(mockToken);
        setToken(mockToken);

        const profile = await mobileApi.getUserProfile();
        setUser(profile);
        localStorage.setItem('nexa_mobile_auth_user', JSON.stringify(profile));
      } catch (err: any) {
        console.error('Falha no login de teste:', err);
        setAuthError(err.message || 'Falha ao autenticar.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // 1. Abre popup de login do Google
      let userCredential;
      try {
        userCredential = await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
      } catch (popupErr: any) {
        if (popupErr?.code === 'auth/popup-blocked') {
          console.warn('[NEXA Mobile] Popup bloqueado pelo navegador, usando redirect...');
          await signInWithRedirect(firebaseAuth, firebaseGoogleProvider);
          return;
        }
        if (popupErr?.code === 'auth/popup-closed-by-user') {
          setLoading(false);
          return;
        }
        throw popupErr;
      }

      // 2. Obtém o Firebase ID Token legítimo assinado pelo Google
      const idToken = await userCredential.user.getIdToken();

      // 3. Atualiza cliente com o Bearer Token
      localStorage.setItem('nexa_mobile_auth_token', idToken);
      mobileApi.setAuthToken(idToken);
      setToken(idToken);

      // 4. Cria ou carrega perfil no backend no Render
      const profile = await mobileApi.getUserProfile();
      setUser(profile);
      localStorage.setItem('nexa_mobile_auth_user', JSON.stringify(profile));
    } catch (err: any) {
      console.error('Falha no login Google:', err);
      let message = err.message || 'Falha ao autenticar com o Google.';
      if (err?.code === 'auth/unauthorized-domain') {
        message = 'Domínio da Vercel não autorizado no Firebase. Adicione o domínio no Firebase Console > Authentication > Settings > Authorized Domains.';
      }
      setAuthError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (firebaseAuth) {
        await signOut(firebaseAuth);
      }
    } catch (err) {
      console.error('[NEXA Mobile] Erro ao deslogar do Firebase:', err);
    } finally {
      setUser(null);
      setToken(null);
      mobileApi.setAuthToken(null);
      localStorage.removeItem('nexa_mobile_auth_token');
      localStorage.removeItem('nexa_mobile_auth_user');
    }
  };

  const refreshUser = async () => {
    if (firebaseAuth?.currentUser) {
      try {
        const freshToken = await firebaseAuth.currentUser.getIdToken(true);
        mobileApi.setAuthToken(freshToken);
        setToken(freshToken);
        localStorage.setItem('nexa_mobile_auth_token', freshToken);
      } catch (err) {
        console.warn('[NEXA Mobile] Falha ao renovar Firebase ID token:', err);
      }
    }
    try {
      const profile = await mobileApi.getUserProfile();
      setUser(profile);
      localStorage.setItem('nexa_mobile_auth_user', JSON.stringify(profile));
    } catch (err) {
      console.error('[NEXA Mobile] Falha ao atualizar perfil:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginWithGoogle,
        logout,
        refreshUser,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

