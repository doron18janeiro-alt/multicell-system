import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { proprietarioId, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Validando sessão...
      </div>
    );
  }

  if (!proprietarioId) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
