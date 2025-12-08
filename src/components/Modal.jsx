export default function Modal({ titulo, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[rgba(15,15,15,0.95)] shadow-[0_25px_60px_rgba(0,0,0,0.55)] border border-[#2a2a2a]">
        <header className="flex items-center justify-between border-b border-[#2a2a2a] px-6 py-4">
          <h3 className="text-lg font-semibold text-[#F5F2D0] tracking-wide">
            {titulo}
          </h3>
          <button
            type="button"
            className="text-sm font-semibold text-[#E0DFD4] hover:text-white"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="px-6 py-4 text-sm text-[#E0DFD4]">{children}</div>

        {footer && (
          <div className="border-t border-[#2a2a2a] px-6 py-4 bg-black/20 text-[#E0DFD4]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
