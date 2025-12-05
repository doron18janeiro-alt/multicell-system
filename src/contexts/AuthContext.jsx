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
    async (email, { skipLoading = false } = {}) => {
      if (!email) {
        limparSessao();
        return;
      }

      if (!skipLoading) {
        setLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from("proprietarios")
          .select("id,nome,email")
          .ilike("email", email)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          throw new Error(
            "Proprietário não encontrado para o e-mail informado."
          );
        }

        persistirSessao({
          id: data.id,
          nome: data.nome,
          email: data.email ?? email,
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

        const email = data.session?.user?.email;
        if (email) {
          await sincronizarProprietario(email, { skipLoading: true });
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
      const email = session?.user?.email;
      if (email) {
        sincronizarProprietario(email).catch(() => {});
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (error) {
          throw error;
        }

        await sincronizarProprietario(email, { skipLoading: true });
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
