import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
const output = fileURLToPath(new URL("../dist/site", import.meta.url));
const serviceWorkerTemplate = fileURLToPath(new URL("./sw-template.js", import.meta.url));
const previousWorkerTemplate = fileURLToPath(new URL("./sw-previous-test-template.js", import.meta.url));

function versionedServiceWorker() {
  return {
    name: "versioned-service-worker",
    apply: "build" as const,
    async closeBundle() {
      const hash = createHash("sha256");
      const candidates = (await readdir(output, { recursive: true }))
        .filter((file): file is string => typeof file === "string" && file !== "sw.js")
        .sort();
      const files = [];
      for (const file of candidates) {
        if ((await stat(join(output, file))).isFile()) files.push(file);
      }
      for (const file of files) {
        hash.update(file);
        hash.update(await readFile(join(output, file)));
      }
      hash.update(await readFile(serviceWorkerTemplate));
      const cacheName = `sbc-shell-${hash.digest("hex").slice(0, 12)}`;
      const template = await readFile(serviceWorkerTemplate, "utf8");
      const shell = files
        .filter((file) => file !== "staticwebapp.config.json")
        .map((file) => {
          if (file === "index.html") return "/";
          if (file.endsWith("/index.html")) return `/${file.slice(0, -"index.html".length)}`;
          return `/${file}`;
        });
      await writeFile(
        join(output, "sw.js"),
        template
          .replace("__SBC_CACHE_NAME__", cacheName)
          .replace("__SBC_SHELL__", JSON.stringify(shell))
      );
      if (process.env.SBC_TESTING === "1") {
        await writeFile(join(output, "sw-previous-test.js"), await readFile(previousWorkerTemplate));
      }
    }
  };
}

export default defineConfig({
  root,
  plugins: [versionedServiceWorker()],
  build: {
    outDir: "../dist/site",
    emptyOutDir: true,
    target: "es2022",
    modulePreload: false,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        demo: fileURLToPath(new URL("./demo/index.html", import.meta.url)),
        privacy: fileURLToPath(new URL("./privacy/index.html", import.meta.url)),
        terms: fileURLToPath(new URL("./terms/index.html", import.meta.url)),
        notFound: fileURLToPath(new URL("./404.html", import.meta.url))
      }
    }
  },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1", port: 4173 }
});
