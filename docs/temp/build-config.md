# Build config and the service worker

## `astro.config.mjs`

- Served by GitHub Pages at https://radyalz.github.io/Cv-Builder/ (`base`
  `/Cv-Builder`).
- The `service-worker` integration fills `public/sw.js` in after each build:
  the list of files that make up the page's shell, cached when the worker
  installs, and a version made from their names, so every deploy with
  changed files installs a fresh copy. The PDF viewer and fonts are left out
  of the list: they are cached the first time they are used instead.
- `cssTarget`: the CSS minifier merges prefixed and unprefixed pairs, keeping
  only what the named browsers need. Naming older Safari keeps the `-webkit-`
  backdrop blur it relies on alongside the standard property.

## `public/sw.js`

Makes the site an installable app that opens at once, even offline.

- The page's shell (its HTML, styles and scripts) is cached when the worker
  installs, from the list the build fills in; each deploy installs a fresh
  copy and clears the old one.
- The page itself is fetched from the network first, so a new deploy shows
  straight away; the cached copy is only used offline.
- Everything else of the site's own (the PDF viewer, fonts, icons) has a
  unique name per version, so it is served from the cache once it has been
  fetched the first time.
- Requests to other sites (the CV API, GitHub) are left alone: the page keeps
  its own cache of previews (`cv-previews-v1`), which this worker never
  touches.
