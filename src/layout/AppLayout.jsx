import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useNavigate } from "react-router-dom";
import { clearAuth, getAuthUser } from "../utils/auth";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };
  const user = getAuthUser();
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Topbar onLogout={handleLogout} usuario={user.nome || "Usuario"} />
        {children}
      </main>
    </div>
  );
}
