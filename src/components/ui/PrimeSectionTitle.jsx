import clsx from "clsx";

export default function PrimeSectionTitle({
  title,
  subtitle,
  icon: Icon,
  align = "start",
  className = "",
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3 text-white",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div className="flex items-center gap-3 text-[#ffe8a3]">
        {Icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#ffe8a3] shadow-[0_0_20px_rgba(255,232,163,0.18)]">
            <Icon size={22} />
          </span>
        )}
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.45em] text-[#c1b6a0]">
            Prime Edition
          </p>
          <h1 className="text-3xl font-black leading-tight">{title}</h1>
        </div>
      </div>
      {subtitle && (
        <p className="max-w-2xl text-sm text-[#dacfb5]">{subtitle}</p>
      )}
      <span className="block h-px w-24 rounded-full bg-gradient-to-r from-[#8f5eff] via-[#cda64d] to-transparent" />
    </div>
  );
}
