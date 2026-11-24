import { FeedScreen } from "@/components/feed/feed-screen";
import { Page, PageTitle } from "@/components/shell/page";
import { copy } from "@/lib/copy";

/** "Feed my pet": the page around the calculator */
export function FeedPage() {
  return (
    <Page>
      <PageTitle title={copy.feed.title} intro={copy.feed.intro} />
      <FeedScreen />
      <footer className="px-2 pt-2 text-center text-sm text-muted">{copy.feed.disclaimer}</footer>
    </Page>
  );
}
