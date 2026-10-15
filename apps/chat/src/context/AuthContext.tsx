import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatApi } from '../services/api.js';
import { chatSocket } from '../services/socket.js';
import { callsSocket } from '../services/callsSocket.js';
import { AuthUser } from '@nexa/types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithToken: (customToken: string, customUser?: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const initSession = (authToken: string, authUser: AuthUser) => {
    setToken(authToken);
    setUser(authUser);
    chatApi.setAuthToken(authToken);
    chatSocket.connect(authToken);
    callsSocket.connect(authToken);
    localStorage.setItem('nexa_chat_auth_token', authToken);
    localStorage.setItem('nexa_chat_auth_user', JSON.stringify(authUser));
  };

  useEffect(() => {
    // 1. Checa se veio token pela URL (ex: redirecionamento ou deep-link da NEXA Mobile)
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token');
    if (queryToken) {
      const uid = queryToken.replace(/^(mock_|guest_)/, '');
      const userFromQuery: AuthUser = {
        uid,
        email: `${uid}@nexa.local`,
        displayName: 'Operador NEXA',
        photoURL: null,
        primaryNumberId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      initSession(queryToken, userFromQuery);
      setLoading(false);
      // Limpa a query string para URL limpa
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // 2. Checa token salvo especificamente no NEXA Chat
    const savedToken = localStorage.getItem('nexa_chat_auth_token');
    const savedUser = localStorage.getItem('nexa_chat_auth_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        initSession(savedToken, parsedUser);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('nexa_chat_auth_token');
        localStorage.removeItem('nexa_chat_auth_user');
      }
    }

    // 3. Checa se o usuário já fez login na NEXA Mobile neste navegador (SSO do Ecossistema)
    const mobileToken = localStorage.getItem('nexa_mobile_auth_token');
    const mobileUser = localStorage.getItem('nexa_mobile_auth_user');
    if (mobileToken && mobileUser) {
      try {
        const parsedUser = JSON.parse(mobileUser);
        initSession(mobileToken, parsedUser);
        setLoading(false);
        return;
      } catch {
        // Ignora se inválido
      }
    }

    setLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const mockUid = `usr_${Math.random().toString(36).substring(2, 10)}`;
      const mockToken = `mock_${mockUid}`;
      const mockUser: AuthUser = {
        uid: mockUid,
        email: `${mockUid}@nexa.local`,
        displayName: 'Membro NEXA',
        photoURL: null,
        primaryNumberId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      initSession(mockToken, mockUser);
    } catch (err) {
      console.error('Erro no login do Chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = (customToken: string, customUser?: AuthUser) => {
    const uid = customToken.replace(/^(mock_|guest_)/, '');
    const resolvedUser: AuthUser = customUser || {
      uid,
      email: `${uid}@nexa.local`,
      displayName: 'Membro NEXA',
      photoURL: null,
      primaryNumberId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    initSession(customToken, resolvedUser);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    chatApi.setAuthToken(null);
    chatSocket.disconnect();
    callsSocket.disconnect();
    localStorage.removeItem('nexa_chat_auth_token');
    localStorage.removeItem('nexa_chat_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
