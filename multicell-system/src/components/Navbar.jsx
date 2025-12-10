import { useAuth } from "@/contexts/AuthContext.jsx";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <div className="w-full bg-gray-100 p-3 flex justify-between">
      <span>Painel Multicell</span>
      <span>{user?.email}</span>
    </div>
  );
}
