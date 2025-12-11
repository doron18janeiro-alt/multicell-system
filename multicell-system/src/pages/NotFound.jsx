import { useNavigate } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import PrimeCard from "@/components/ui/PrimeCard";
import PrimeButton from "@/components/ui/PrimeButton";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050114] px-4">
      <PrimeCard className="max-w-2xl w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-500/20 blur-3xl" />
            <AlertCircle className="relative w-24 h-24 text-amber-400/80" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <h2 className="text-2xl font-semibold text-white/90">
            Página não encontrada
          </h2>
          <p className="text-white/60 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida para
            outro local.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <PrimeButton onClick={() => navigate("/dashboard")}>
            <Home size={18} />
            Ir para Dashboard
          </PrimeButton>
          <PrimeButton variant="ghost" onClick={() => navigate(-1)}>
            Voltar
          </PrimeButton>
        </div>
      </PrimeCard>
    </div>
  );
}
