import type { Metadata } from "next";
import { FoodScreen } from "@/components/food/food-screen";
import { Page, PageTitle } from "@/components/shell/page";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.home.food.title };

export default function Page_() {
  return (
    <Page>
      <PageTitle title={copy.food.title} intro={copy.food.intro} />
      <FoodScreen />
    </Page>
  );
}
