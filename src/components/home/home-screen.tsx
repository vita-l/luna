/*
  DESKTOP HOME: "What do you want to know?" with 3 big buttons and a Tools link.
*/
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Page, PageTitle } from "@/components/shell/page";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { sections, type Section } from "@/lib/nav";

const big: Section["key"][] = ["food", "feed", "check"];

export function HomeScreen() {
  const tools = sections.find((s) => s.key === "tools")!;
  return (
    <Page wide>
      <PageTitle title={copy.home.title} intro={copy.home.intro} />

      <ul className="mt-6 grid grid-cols-3 gap-4">
        {sections
          .filter((s) => big.includes(s.key))
          .map((s) => (
            <li key={s.key}>
              <BigButton section={s} />
            </li>
          ))}
      </ul>

      <Link
        href={tools.href}
        className={cn(
          "group mt-4 flex items-center gap-4 rounded-card border border-line bg-card px-5 py-4 shadow-card",
          "transition-[transform,border-color] duration-200 ease-standard hover:-translate-y-0.5 hover:border-accent",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        )}
      >
        <tools.icon aria-hidden="true" className="size-6 text-accent" />
        <span className="flex-1">
          <span className="font-bold">{copy.home.tools.title}</span>
          <span className="ml-2 text-muted">{copy.home.tools.text}</span>
        </span>
        {!tools.ready && <SoonBadge />}
        <ChevronRight aria-hidden="true" className="size-5 text-muted transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Page>
  );
}

function BigButton({ section }: { section: Section }) {
  const words = copy.home[section.key];
  const Icon = section.icon;
  return (
    <Link
      href={section.href}
      className={cn(
        "group flex h-full min-h-[220px] flex-col rounded-card border border-line bg-card p-6 shadow-card",
        "transition-[transform,border-color] duration-200 ease-standard hover:-translate-y-1 hover:border-accent",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      )}
    >
      <span className="mb-5 flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        {!section.ready && <SoonBadge />}
      </span>
      <span className="mb-1.5 text-[20px] font-bold">{words.title}</span>
      <span className="flex-1 text-[15px] text-muted">{words.text}</span>
      <ChevronRight
        aria-hidden="true"
        className="mt-4 size-5 text-accent transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}

function SoonBadge() {
  return (
    <span className="rounded-full bg-track px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-muted">
      {copy.home.soon}
    </span>
  );
}
