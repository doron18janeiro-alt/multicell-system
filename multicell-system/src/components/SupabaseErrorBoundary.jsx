import React from "react";

export default class SupabaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[SupabaseErrorBoundary]", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
          <div className="max-w-lg w-full border border-rose-700 bg-rose-950/60 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-400">
                Falha ao inicializar Supabase
              </p>
              <h1 className="text-2xl font-bold">
                Algo deu errado com a autenticação
              </h1>
            </div>

            <p className="text-sm text-slate-200">
              Verifique se as variáveis <code>VITE_SUPABASE_URL</code> e
              <code className="ml-1">VITE_SUPABASE_ANON_KEY</code> estão
              definidas corretamente no arquivo
              <code className="ml-1">.env</code> e reinicie o servidor do Vite.
            </p>

            {this.state.error?.message && (
              <pre className="bg-black/40 border border-rose-800 rounded-xl p-3 text-xs text-rose-200 overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Passos sugeridos:</span>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Confirme a URL e a chave pública do projeto no Supabase.
                </li>
                <li>
                  Garanta que os nomes das variáveis começam com{" "}
                  <code>VITE_</code>.
                </li>
                <li>
                  Reinicie o servidor de desenvolvimento após alterações no{" "}
                  <code>.env</code>.
                </li>
              </ul>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
