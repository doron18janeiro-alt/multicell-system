export default function Modal({ titulo, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f0f0f]/95 border border-[#2a2a2a] shadow-2xl shadow-black/60">
        <header className="flex items-center justify-between gap-4 border-b border-[#2a2a2a] px-6 py-4">
          <h3 className="text-lg font-semibold text-[#f5f2d0]">{titulo}</h3>
          <button
            type="button"
            className="text-sm font-semibold text-[#c9a959] hover:text-white transition"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="px-6 py-4 text-sm text-[#e5e3d4]">{children}</div>

        {footer && (
          <div className="border-t border-[#2a2a2a] px-6 py-4 bg-[#111] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
