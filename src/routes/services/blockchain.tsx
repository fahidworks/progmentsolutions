import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { InfoPage } from "@/components/layout/InfoPage";
import { pages } from "@/data/pages";

const data = pages["blockchain"];

export const Route = createFileRoute("/services/blockchain")({
  head: () => ({
    meta: [
      { title: `${data.title} — Progment Solution` },
      { name: "description", content: data.subtitle },
      { property: "og:title", content: data.title },
      { property: "og:description", content: data.subtitle },
    ],
  }),
  component: () => (
    <SiteLayout>
      <InfoPage {...data} />
    </SiteLayout>
  ),
});
