export function formatSupabaseError(error) {
  if (!error) return "Erro desconhecido.";
  if (error.message) return error.message;
  return String(error);
}
