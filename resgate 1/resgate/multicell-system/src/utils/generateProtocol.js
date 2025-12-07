export function generateProtocol(sequence = 1) {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");
  return `OS-${year}-${padded}`;
}
