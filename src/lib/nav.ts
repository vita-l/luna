/*
  THE APP'S SECTIONS, in menu order.
  Phone: bottom tab bar. Desktop: top menu + home screen.
*/
import { Calculator, ClipboardCheck, PawPrint, ScanText, type LucideIcon } from "lucide-react";
import { copy } from "@/lib/copy";

export interface Section {
  key: "food" | "feed" | "check" | "tools";
  href: string;
  label: string;
  icon: LucideIcon;
  /** Built and usable (false = "Coming next") */
  ready: boolean;
}

export const sections: Section[] = [
  { key: "food", href: "/food", label: copy.nav.food, icon: ScanText, ready: true },
  { key: "feed", href: "/feed", label: copy.nav.feed, icon: PawPrint, ready: true },
  { key: "check", href: "/check", label: copy.nav.check, icon: ClipboardCheck, ready: true },
  { key: "tools", href: "/tools", label: copy.nav.tools, icon: Calculator, ready: false },
];

/** Which section a page belongs to. On phones, "/" shows Feed. */
export function activeSection(pathname: string, isPhone: boolean): Section["key"] | null {
  if (pathname === "/") return isPhone ? "feed" : null;
  return sections.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`))?.key ?? null;
}
