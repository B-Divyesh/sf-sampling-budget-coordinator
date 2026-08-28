import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root,
  build: {
    outDir: "../dist/site",
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        privacy: fileURLToPath(new URL("./privacy/index.html", import.meta.url)),
        terms: fileURLToPath(new URL("./terms/index.html", import.meta.url))
      }
    }
  },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1", port: 4173 }
});
