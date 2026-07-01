import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Plain TanStack Start setup — no Lovable wrappers.
// Deployment target (Node / Vercel / etc.) is configured downstream by
// the deploy provider consuming the SSR build output.
export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.PORT ?? 8080),
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
