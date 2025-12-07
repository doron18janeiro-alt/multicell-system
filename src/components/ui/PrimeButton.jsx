import clsx from "clsx";

const variants = {
  primary:
    "bg-gradient-to-r from-[#cda64d] to-[#ffe8a3] text-[#1f1405] font-semibold shadow-[0_12px_30px_rgba(205,166,77,0.35)]",
  ghost:
    "border border-[#cda64d]/70 text-[#f4e9cf] hover:bg-white/10 hover:text-white",
  danger:
    "bg-[#b34343] text-white font-semibold shadow-[0_12px_30px_rgba(179,67,67,0.35)]",
};

export default function PrimeButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm uppercase tracking-[0.2em] transition duration-300",
        variants[variant] || variants.primary,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
