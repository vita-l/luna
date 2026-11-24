import { cn } from "@/lib/cn";

/** Space around one question or input */
export function Field({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-5", className)}>{children}</div>;
}

/** The bold label above a field. Use `htmlFor` for inputs, `id` for button groups. */
export function FieldLabel({
  id,
  htmlFor,
  hidden,
  children,
}: {
  id?: string;
  htmlFor?: string;
  /** Hidden on screen, still read by screen readers */
  hidden?: boolean;
  children: React.ReactNode;
}) {
  const className = hidden ? "sr-only" : "mb-2 block font-semibold";
  return htmlFor ? (
    <label id={id} htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ) : (
    <div id={id} className={className}>
      {children}
    </div>
  );
}

type MessageTone = "help" | "error" | "warn" | "ideal" | "note";

const toneClass: Record<MessageTone, string> = {
  help: "mt-2 text-[15px] text-muted",
  error: "mt-2 text-[15px] text-danger",
  warn: "mt-2 rounded-note bg-warn-bg px-3 py-2 text-[15px] text-warn-ink",
  ideal: "mt-2 rounded-note bg-accent-soft px-3 py-2 text-[15px] text-ink",
  note: "mb-3 rounded-note bg-track px-3 py-2.5 text-[15px] text-muted",
};

/** Small text under or above a field: help, error, warning, notes */
export function Message({
  id,
  tone = "help",
  role,
  children,
}: {
  id?: string;
  tone?: MessageTone;
  role?: "alert" | "status";
  children: React.ReactNode;
}) {
  return (
    <p id={id} role={role} className={toneClass[tone]}>
      {children}
    </p>
  );
}
