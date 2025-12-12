export default function Modal({ titulo, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[rgba(17,17,17,0.95)] border border-[var(--border)] shadow-[0_22px_50px_rgba(0,0,0,0.65)]">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-lg font-semibold text-[var(--title)]">
            {titulo}
          </h3>
          <button
            type="button"
            className="text-sm font-semibold text-[var(--gold-strong)] hover:text-white transition"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="px-6 py-4 text-sm text-[var(--text)] leading-relaxed">
          {children}
        </div>

        {footer && (
          <div className="border-t border-[var(--border)] px-6 py-4 bg-[rgba(23,23,23,0.9)] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
