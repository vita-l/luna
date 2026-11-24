/*
  A section that is not built yet: says what it will do, and links to what works now.
*/
import Link from "next/link";
import { Page, PageTitle } from "@/components/shell/page";
import { copy } from "@/lib/copy";
import { sections, type Section } from "@/lib/nav";

export function ComingSoon({ section }: { section: Exclude<Section["key"], "feed"> }) {
  const s = sections.find((x) => x.key === section)!;
  const Icon = s.icon;
  return (
    <Page>
      <PageTitle title={copy.home[section].title} intro={copy.home[section].text} />
      <section className="rounded-card border border-line bg-card px-5 py-6 shadow-card">
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mb-1 text-[20px] font-bold">{copy.soon.title}</h2>
        <p className="mb-4 text-muted">{copy.soon.text}</p>
        <ul className="mb-6 grid gap-2">
          {copy.soon[section].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-[9px] size-1.5 flex-none rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/feed"
          className="inline-flex min-h-11 items-center rounded-control bg-accent px-5 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {copy.soon.back}
        </Link>
      </section>
    </Page>
  );
}
