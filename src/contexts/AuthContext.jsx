import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import supabase from "../services/supabase";

const STORAGE_KEY = "multicell:proprietario";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [proprietarioId, setProprietarioId] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistirSessao = useCallback((owner) => {
    setUsuario(owner);
    setProprietarioId(owner?.id ?? null);
    try {
      if (owner) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(owner));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn("[AuthContext] Falha ao manipular storage", error);
    }
  }, []);

  const limparSessao = useCallback(() => {
    persistirSessao(null);
    setLoading(false);
  }, [persistirSessao]);

  const sincronizarProprietario = useCallback(
    async (user, { skipLoading = false } = {}) => {
      if (!user?.id) {
        limparSessao();
        return;
      }

      if (!skipLoading) {
        setLoading(true);
      }

      try {
        const { data: owner, error: ownerError } = await supabase
          .from("proprietarios")
          .select("id,nome,email,auth_user_id")
          .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();

        if (ownerError) {
          throw ownerError;
        }

        if (!owner) {
          throw new Error("Nenhum proprietário vinculado a este usuário.");
        }

        persistirSessao({
          id: owner.id,
          nome: owner.nome,
          email: owner.email ?? user.email,
        });
      } catch (error) {
        console.error("[AuthContext] Falha ao sincronizar proprietário", error);
        limparSessao();
        throw error;
      } finally {
        if (!skipLoading) {
          setLoading(false);
        }
      }
    },
    [limparSessao, persistirSessao]
  );

  useEffect(() => {
    let ativo = true;

    async function restaurarSessao() {
      setLoading(true);
      try {
        const storedRaw = localStorage.getItem(STORAGE_KEY);
        if (storedRaw) {
          const stored = JSON.parse(storedRaw);
          if (stored?.id && ativo) {
            setUsuario(stored);
            setProprietarioId(stored.id);
          }
        }

        const { data } = await supabase.auth.getSession();
        if (!ativo) return;

        const user = data.session?.user;
        if (user?.id) {
          await sincronizarProprietario(user, { skipLoading: true });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("[AuthContext] Erro ao restaurar sessão", error);
        limparSessao();
      }
    }

    restaurarSessao();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!ativo) return;
      const user = session?.user;
      if (user?.id) {
        sincronizarProprietario(user).catch(() => {});
      } else {
        limparSessao();
      }
    });

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, [limparSessao, sincronizarProprietario]);

  const signIn = useCallback(
    async (email, senha) => {
      if (!email || !senha) {
        throw new Error("Informe e-mail e senha para continuar.");
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (error) {
          throw error;
        }

        await sincronizarProprietario(data?.user, { skipLoading: true });
      } catch (error) {
        console.error("[AuthContext] Login falhou", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sincronizarProprietario]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    limparSessao();
  }, [limparSessao]);

  const value = useMemo(
    () => ({
      user: usuario,
      usuario,
      proprietarioId,
      loading,
      signIn,
      signOut,
      // compatibilidade retroativa
      login: signIn,
      logout: signOut,
    }),
    [usuario, proprietarioId, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
