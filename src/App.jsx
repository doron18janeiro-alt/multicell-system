import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import SplashScreen from "./components/SplashScreen";
import { createAppRouter } from "./router";
import { getCurrentUser, subscribeToAuthChanges, signOut } from "./utils/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Carrega usuário ao abrir o app
  useEffect(() => {
    async function loadUser() {
      try {
        const current = await getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();

    // Listener de mudanças (login/logout)
    const unsubscribe = subscribeToAuthChanges((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      await signOut();
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/login");
      }
    } catch (err) {
      console.error("Erro ao sair:", err);
      alert("Erro ao sair: " + (err.message || ""));
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  const router = useMemo(() => {
    if (!user) return null;
    return createAppRouter({ user, onLogout: handleLogout });
  }, [user]);

  if (showSplash) {
    return (
      <BrowserRouter>
        <SplashScreen />
      </BrowserRouter>
    );
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        Carregando usuário...
      </div>
    );
  }

  // Se não tiver usuário → mostra tela de login com BrowserRouter para habilitar navegação
  if (!user) {
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.history.replaceState(null, "", "/login");
    }
    return (
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  }

  // Quando autenticado, renderiza o RouterProvider com as rotas protegidas
  return router ? <RouterProvider router={router} /> : null;
}
