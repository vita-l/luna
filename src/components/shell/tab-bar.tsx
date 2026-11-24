"use client";

/*
  PHONE: bottom tab bar (hidden on desktop).
  The highlight slides to the new tab, so you see where you moved.
*/
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { activeSection, sections } from "@/lib/nav";

export function TabBar() {
  const pathname = usePathname();
  const active = activeSection(pathname, true);

  return (
    <nav
      aria-label={copy.nav.label}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/90 backdrop-blur-md md:hidden",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="mx-auto flex max-w-[520px] px-2">
        {sections.map((s) => {
          const isActive = s.key === active;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex-1">
              <Link
                href={s.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[12px] font-semibold",
                  "transition-colors duration-150",
                  isActive ? "text-accent" : "text-muted",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-highlight"
                    aria-hidden="true"
                    className="absolute top-1.5 h-8 w-14 rounded-full bg-accent-soft"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon aria-hidden="true" className="relative mt-1 size-[22px]" strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="relative">{s.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
