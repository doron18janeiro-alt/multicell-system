import clsx from "clsx";
import { forwardRef } from "react";

const baseClass =
  "prime-input w-full rounded-[16px] bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/40 focus:border-[#ffe8a3] focus:ring-2 focus:ring-[#ffe8a3]/30";

const labelClass =
  "text-xs uppercase tracking-[0.35em] text-[#cdb88d] font-semibold";

const helperClass = "text-xs text-[#9b8f75]";

const ELEMENTS = {
  input: "input",
  textarea: "textarea",
  select: "select",
};

const PrimeInput = forwardRef(function PrimeInput(
  { label, helperText, as = "input", className = "", children, ...props },
  ref
) {
  const Component = ELEMENTS[as] || ELEMENTS.input;

  return (
    <label className="flex flex-col gap-2 text-sm text-white/80">
      {label && <span className={labelClass}>{label}</span>}
      <Component ref={ref} className={clsx(baseClass, className)} {...props}>
        {children}
      </Component>
      {helperText && <span className={helperClass}>{helperText}</span>}
    </label>
  );
});

export default PrimeInput;
