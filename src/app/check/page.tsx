import type { Metadata } from "next";
import { CheckScreen } from "@/components/check/check-screen";
import { Page, PageTitle } from "@/components/shell/page";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.home.check.title };

export default function Page_() {
  return (
    <Page>
      <PageTitle title={copy.check.title} intro={copy.check.intro} />
      <CheckScreen />
    </Page>
  );
}
