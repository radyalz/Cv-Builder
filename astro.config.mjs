import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "astro/config";

// Fills the service worker (public/sw.js) in after each build: the list of
// files that make up the page's shell, cached when the worker installs, and
// a version made from their names, so every deploy with changed files
// installs a fresh copy. The PDF viewer and fonts are left out of the list:
// they are cached the first time they are used instead.
function serviceWorker() {
  return {
    name: "service-worker",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const assets = (await readdir(new URL("_astro/", dir)))
          .filter((name) => /\.(js|css)$/.test(name) && !name.startsWith("pdf."))
          .map((name) => `_astro/${name}`);
        const precache = ["./", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", ...assets];
        const version = createHash("sha256").update(precache.join("\n")).digest("hex").slice(0, 12);
        const file = new URL("sw.js", dir);
        const source = await readFile(file, "utf8");

        await writeFile(
          file,
          source
            .replace('const VERSION = "dev";', `const VERSION = "${version}";`)
            .replace("const PRECACHE = [];", `const PRECACHE = ${JSON.stringify(precache)};`)
        );
      },
    },
  };
}

// Served by GitHub Pages at https://radyalz.github.io/Cv-Builder/.
export default defineConfig({
  site: "https://radyalz.github.io",
  base: "/Cv-Builder",
  trailingSlash: "ignore",
  integrations: [serviceWorker()],
  vite: {
    build: {
      // The CSS minifier merges prefixed and unprefixed pairs, keeping only
      // what these browsers need. Naming older Safari keeps the -webkit-
      // backdrop blur it relies on alongside the standard property.
      cssTarget: ["chrome100", "edge100", "firefox103", "safari15", "ios15"],
    },
  },
});
