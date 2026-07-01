import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Plain TanStack Start setup — targets Node/Vercel by default.
// Set VITE_START_TARGET to override (e.g. "vercel", "netlify", "node-server").
const target = (process.env.VITE_START_TARGET ?? "vercel") as
  | "vercel"
  | "netlify"
  | "node-server"
  | "bun"
  | "cloudflare-module";

export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.PORT ?? 8080),
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({ target }),
    viteReact(),
  ],
});
