import { Loader2 } from "lucide-react";

export default function Loading({ descricao = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
      {descricao}
    </div>
  );
}
