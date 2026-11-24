import { cn } from "@/lib/cn";

/**
 * A box for typing a number. Opens the number keyboard on phones.
 * Text input (not type="number") so people can type "4,5" or "3,500".
 */
export function NumberField({
  id,
  value,
  onChange,
  placeholder,
  suffix,
  invalid,
  describedBy,
  size = "full",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** A unit shown inside the box on the right, like "kcal/kg" */
  suffix?: string;
  invalid?: boolean;
  describedBy?: string;
  /** "full" fills the row; "short" fits about 4 digits and a dot, like 11.36 */
  size?: "full" | "short";
}) {
  const input = (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-[54px] min-w-0 appearance-none rounded-control border-[1.5px] border-line bg-field px-[14px]",
        size === "short" ? "w-[104px] flex-none" : "w-full",
        "text-[22px] tabular-nums text-ink placeholder:text-muted/60",
        "transition-[border-color,box-shadow] duration-150 ease-standard",
        "focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] focus:outline-none",
        "aria-invalid:border-danger",
        suffix && "pr-[88px]",
      )}
    />
  );
  if (!suffix) return input;
  return (
    <div className="relative">
      {input}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[14px] -translate-y-1/2 text-base text-muted"
      >
        {suffix}
      </span>
    </div>
  );
}
