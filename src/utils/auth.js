import { supabase } from "@/services/supabaseClient";

let currentUserCache = null;

// Fazer login com e-mail e senha
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  currentUserCache = data.user ?? null;
  return data;
}

// Cadastrar novo usuário
export async function signUpWithEmail(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;
  currentUserCache = data.user ?? null;
  return data;
}

// Sair da conta
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  currentUserCache = null;
}

// Pegar usuário atual (se estiver logado)
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  currentUserCache = data.user ?? null;
  return currentUserCache;
}

export function getAuthUser() {
  return currentUserCache;
}

// Listener para mudanças de autenticação
export function subscribeToAuthChanges(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    currentUserCache = session?.user ?? null;
    callback(currentUserCache);
  });

  return () => subscription.unsubscribe();
}
