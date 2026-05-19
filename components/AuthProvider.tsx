'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setMockUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setMockUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão ativa ao carregar o app
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Sessão Supabase indisponível (verifique as variáveis .env):", error.message);
          setLoading(false);
          return;
        }
        setUser(session?.user ?? null);
      } catch (e) {
        console.error("Erro ao inicializar autenticação:", e);
      } finally {
        setLoading(false);
      }
    };

    // Monitora as alterações de login e logout em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    setData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Atalho para o bypass de login no ambiente local
  const setMockUser = (mockUser: User | null) => {
    setUser(mockUser);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Erro ao executar signOut no Supabase:", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setMockUser }}>
      {children}
    </AuthContext.Provider>
  );
}