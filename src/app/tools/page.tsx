import type { Metadata } from "next";
import { ComingSoon } from "@/components/soon/coming-soon";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.home.tools.title };

export default function Page() {
  return <ComingSoon section="tools" />;
}
