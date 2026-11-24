"use client";

/*
  DESKTOP: top bar with the app name (goes home) and the menu (hidden on phones).
  The underline slides to the new page.
*/
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { PawPrint } from "lucide-react";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { activeSection, sections } from "@/lib/nav";

export function TopBar() {
  const pathname = usePathname();
  const active = activeSection(pathname, false);

  return (
    <header className="sticky top-0 z-20 hidden border-b border-line bg-bg/85 backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-ink">
            <PawPrint aria-hidden="true" className="size-[18px]" />
          </span>
          <span className="text-[18px]">{copy.app.name}</span>
          <span className="text-[15px] font-medium text-muted">{copy.app.tagline}</span>
        </Link>

        <nav aria-label={copy.nav.label}>
          <ul className="flex gap-1">
            {sections.map((s) => {
              const isActive = s.key === active;
              return (
                <li key={s.key}>
                  <Link
                    href={s.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative block rounded-control px-3.5 py-2 font-semibold transition-colors duration-150",
                      isActive ? "text-ink" : "text-muted hover:text-ink",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    )}
                  >
                    {s.label}
                    {isActive && (
                      <motion.span
                        layoutId="top-underline"
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
