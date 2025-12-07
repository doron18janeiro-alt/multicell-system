export default function Modal({ titulo, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <button
            type="button"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="px-6 py-4 text-sm text-gray-700">{children}</div>

        {footer && (
          <div className="border-t border-gray-100 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
