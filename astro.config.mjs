import { defineConfig } from "astro/config";

// Served by GitHub Pages at https://radyalz.github.io/Cv-Builder/.
export default defineConfig({
  site: "https://radyalz.github.io",
  base: "/Cv-Builder",
  trailingSlash: "ignore",
  vite: {
    build: {
      // The CSS minifier merges prefixed and unprefixed pairs, keeping only
      // what these browsers need. Naming older Safari keeps the -webkit-
      // backdrop blur it relies on alongside the standard property.
      cssTarget: ["chrome100", "edge100", "firefox103", "safari15", "ios15"],
    },
  },
});
