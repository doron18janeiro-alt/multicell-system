import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  // Arquivo legado: re-exporta o contexto real localizado em src/contexts/AuthContext.jsx
  export { AuthProvider, useAuth } from "../contexts/AuthContext";

  const limparSessao = useCallback(() => {
    setUsuario(null);
    setProprietarioId(null);
    setLoading(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("[AuthContext] Falha ao limpar storage", error);
    }
  }, []);

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

        aplicarSessao({
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
    [aplicarSessao, limparSessao]
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

  const login = useCallback(
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

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    limparSessao();
  }, [limparSessao]);

  const value = useMemo(
    () => ({
      user: usuario,
      usuario,
      proprietarioId,
      loading,
      login,
      logout,
    }),
    [usuario, proprietarioId, loading, login, logout]
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
