import { cn } from "@/lib/cn";

/**
 * The frame around every screen.
 * Phones: extra space at the bottom so the tab bar never covers content.
 * `wide` is for the desktop home screen.
 */
export function Page({ wide, children }: { wide?: boolean; children: React.ReactNode }) {
  return (
    <main
      className={cn(
        "mx-auto px-4 pt-6 pb-[calc(96px+env(safe-area-inset-bottom))] md:px-6 md:pt-10 md:pb-16",
        wide ? "max-w-[960px]" : "max-w-[520px]",
      )}
    >
      {children}
    </main>
  );
}

/** The big title at the top of a screen, with a short line under it */
export function PageTitle({ title, intro }: { title: string; intro?: string }) {
  return (
    <header>
      <h1 className="mt-2 mb-1.5 text-[26px] leading-[1.2] font-bold tracking-[-0.01em] md:text-[30px]">{title}</h1>
      {intro && <p className="mb-5 text-muted">{intro}</p>}
    </header>
  );
}
