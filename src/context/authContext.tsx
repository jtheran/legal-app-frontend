'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LAWYER';
  dni: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string, userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Al cargar la app, verificamos si hay sesión activa
    const storedToken = localStorage.getItem('legal_auth_token');
    const storedUser = localStorage.getItem('legal_user_data');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Si hay error de parsing, limpiamos
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: any) => {
    // Guardamos de forma independiente ambos tokens en el almacenamiento del navegador
    localStorage.setItem('legal_auth_token', accessToken);
    localStorage.setItem('legal_refresh_token', refreshToken);
    
    // Guardamos los datos planos del usuario si es necesario persistirlos ante un F5
    localStorage.setItem('legal_user_data', JSON.stringify(userData));
  
    // Actualizamos el estado reactivo que lee tu Layout
    setUser(userData);
    setToken(accessToken);
  };

  const logout = async () => {
    try {
      // Llamamos a tu endpoint de cierre de sesión en Express
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al notificar logout al backend:', error);
    } finally {
      // Siempre limpiamos el cliente de todos modos
      localStorage.removeItem('legal_auth_token');
      localStorage.removeItem('legal_user_data');
      localStorage.removeItem('legal_refresh_token');
      setUser(null);
      setToken(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}