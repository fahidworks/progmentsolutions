import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

const paths = [
  "/", "/about", "/contact",
  "/products/sms", "/products/ems", "/products/tender-alerts", "/products/foa",
  "/services/ai", "/services/blockchain", "/services/iot", "/services/consulting", "/services/development",
  "/industries/edtech", "/industries/fintech", "/industries/healthcare", "/industries/insurance",
  "/industries/logistics", "/industries/manufacturing", "/industries/on-demand", "/industries/travel",
  "/our-work/consultation", "/our-work/cost-estimate", "/our-work/kickoff",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});