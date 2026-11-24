import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MotionProvider } from "@/components/ui/motion-provider";
import { TabBar } from "@/components/shell/tab-bar";
import { TopBar } from "@/components/shell/top-bar";
import { copy } from "@/lib/copy";
import { FeedStateProvider } from "@/lib/state/feed-state";
import { FoodStateProvider } from "@/lib/state/food-state";

export const metadata: Metadata = {
  title: { default: copy.app.title, template: `%s · ${copy.app.name}` },
  description: copy.app.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#161513" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <MotionProvider>
          <FeedStateProvider>
            <FoodStateProvider>
              <TopBar />
              {children}
              <TabBar />
            </FoodStateProvider>
          </FeedStateProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
