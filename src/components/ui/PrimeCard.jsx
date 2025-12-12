import clsx from "clsx";

export default function PrimeCard({
  children,
  className = "",
  padding = "p-6",
}) {
  return (
    <div
      className={clsx(
        "rounded-[18px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_25px_rgba(255,215,0,0.08)] transition duration-500",
        "hover:shadow-[0_15px_45px_rgba(0,0,0,0.55)] hover:border-white/30",
        padding,
        className
      )}
    >
      {children}
    </div>
  );
}
