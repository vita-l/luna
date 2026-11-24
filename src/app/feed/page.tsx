import type { Metadata } from "next";
import { FeedPage } from "@/components/feed/feed-page";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.home.feed.title };

export default function Page() {
  return <FeedPage />;
}
