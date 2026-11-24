import { FeedPage } from "@/components/feed/feed-page";
import { HomeScreen } from "@/components/home/home-screen";

/**
 * "/" — Desktop: the home screen with 3 big buttons.
 *       Phone: opens straight on Feed my pet (the tab bar does the navigating).
 */
export default function Home() {
  return (
    <>
      <div className="hidden md:block">
        <HomeScreen />
      </div>
      <div className="md:hidden">
        <FeedPage />
      </div>
    </>
  );
}
