import { ChevronDown } from "lucide-react";

/**
 * A dropdown. Uses the phone's own picker (best on small screens).
 */
export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Shown as the first, empty choice */
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[54px] w-full min-w-0 cursor-pointer appearance-none rounded-control border-[1.5px] border-line bg-field pr-11 pl-[14px] text-[17px] text-ink transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] focus:outline-none"
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-[14px] size-5 -translate-y-1/2 text-muted" />
    </div>
  );
}

/** A box for typing words (like the food's name) */
export function TextField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      onChange={(e) => onChange(e.target.value)}
      className="h-[54px] w-full min-w-0 rounded-control border-[1.5px] border-line bg-field px-[14px] text-[17px] text-ink placeholder:text-muted/60 transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] focus:outline-none"
    />
  );
}
