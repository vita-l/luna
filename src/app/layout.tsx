import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MotionProvider } from "@/components/ui/motion-provider";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: copy.app.title,
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
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
