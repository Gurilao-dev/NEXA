import React, { createContext, useContext, useState, useEffect } from 'react';
import { mobileApi } from '../services/api.js';
import { AuthUser } from '@nexa/types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializa sessão a partir do armazenamento local
  useEffect(() => {
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
    setLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Cria sessão de demonstração autenticada Google compatível com o backend
      const mockUid = `usr_${Math.random().toString(36).substring(2, 10)}`;
      const mockToken = `mock_${mockUid}`;

      localStorage.setItem('nexa_mobile_auth_token', mockToken);
      mobileApi.setAuthToken(mockToken);
      setToken(mockToken);

      // Obtém ou inicializa perfil no backend
      const profile = await mobileApi.getUserProfile();
      setUser(profile);
      localStorage.setItem('nexa_mobile_auth_user', JSON.stringify(profile));
    } catch (err) {
      console.error('Falha no login Google:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    mobileApi.setAuthToken(null);
    localStorage.removeItem('nexa_mobile_auth_token');
    localStorage.removeItem('nexa_mobile_auth_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const profile = await mobileApi.getUserProfile();
      setUser(profile);
      localStorage.setItem('nexa_mobile_auth_user', JSON.stringify(profile));
    } catch {
      // Ignora erro de refresh transitório
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
