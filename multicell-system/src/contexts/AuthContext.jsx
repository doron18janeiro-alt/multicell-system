import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/services/supabaseClient";

const AuthContext = createContext();

const resolveProprietarioId = (user) =>
  user?.user_metadata?.proprietario_id ||
  user?.app_metadata?.proprietario_id ||
  user?.user_metadata?.proprietarioId ||
  user?.id ||
  null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar sessão inicial
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      setLoading(false);
    };

    loadSession();

    // Escutar mudanças de sessão
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signed = Boolean(user);
  const proprietarioId = useMemo(() => resolveProprietarioId(user), [user]);

  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{ user, proprietarioId, signed, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
