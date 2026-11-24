/** A numbered step card: "① Daily calorie needs" with a short line under it */
export function StepCard({
  step,
  id,
  title,
  subtitle,
  children,
}: {
  step: number;
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="mb-4 rounded-card border border-line bg-card px-4 py-5 shadow-card"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-full bg-accent text-[15px] font-bold text-accent-ink"
        >
          {step}
        </span>
        <h2 id={id} className="m-0 text-[20px] font-bold">
          {title}
        </h2>
      </div>
      {subtitle && <p className="-mt-2 mb-[18px] text-base text-muted">{subtitle}</p>}
      {children}
    </section>
  );
}
