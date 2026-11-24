import { FeedScreen } from "@/components/feed/feed-screen";
import { copy } from "@/lib/copy";

export default function Home() {
  return (
    <main className="mx-auto max-w-[520px] px-4 pt-6 pb-[calc(32px+env(safe-area-inset-bottom))]">
      <header>
        <h1 className="mt-2 mb-1.5 text-[26px] leading-[1.2] font-bold tracking-[-0.01em]">{copy.feed.title}</h1>
        <p className="mb-5 text-muted">{copy.feed.intro}</p>
      </header>

      <FeedScreen />

      <footer className="px-2 pt-2 text-center text-sm text-muted">{copy.feed.disclaimer}</footer>
    </main>
  );
}
