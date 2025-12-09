import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "40px" }}>
        Validando sessão...
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
