# Installing the app — `src/scripts/install/` and `public/`

## Pieces

- `public/manifest.webmanifest`, `public/icons/` (skull on the accent
  gradient; a maskable one for Android; the favicon is the portrait).
  `related_applications` names the manifest itself so a normal Chrome tab can
  ask whether the app is installed (`getInstalledRelatedApps`).
- `public/sw.js`, filled in after each build by the `service-worker`
  integration in `astro.config.mjs` (precache list + a version made from the
  file names). The page's shell is cached on install; the page itself is
  network-first (a deploy shows at once, the cache is only for offline);
  other own files are cache-first once fetched (their names change per
  version); other origins (the CV API, GitHub) are left alone, and so is the
  page's own `cv-previews-v1` cache. Old `cv-app-*` caches are removed on
  activate.
- `Base.astro` has an inline script that catches Chrome's
  `beforeinstallprompt` before the page's modules run: on a fast, cached load
  it can arrive before them, and the offer would never hear about it.

## Behaviour (`src/scripts/install/`)

- The worker registers only in the built site (`initInstall(PROD)`), so
  development never serves a stale cached copy.
- **Offer** (`offer.ts`): rises in the bottom-left corner as soon as the page
  has loaded, for 30 seconds (a first-visit touch hint moves to the top of the
  screen while it is up); hovering or focusing it holds the
  time. It rises from below the edge with a slight overshoot and sends three
  accent ripples (like How it works) until it is hovered or focused. Closing it
  (× or Escape) only closes it for this page load: nothing is stored, so it
  comes back on the next load. Menus no longer close it (they used to, for the
  rest of the visit, which on phones meant it vanished at the first tap); it
  sits under them (z-index 39, menus 40+). Only starting the tour hides it. Hidden while the preview is expanded or the background
  admired (CSS).
- **Installing**: Chrome, Edge and Samsung Internet announce installability;
  Install then opens their own prompt (usable once; if declined the browser
  announces again later). Where it is not announced, the offer and the menu
  button show the browser's own steps (see below). Firefox on desktop, and
  once installed, neither shows.
- **Uninstalling** (`uninstall.ts`): a page cannot remove an installed app,
  so "Uninstall the app" shows how on this device (desktop, Android or
  iPhone), and can delete the offline copy — the worker and every `cv-`
  cache — which then stays off (`cv-builder-offline-off`) until the app is
  installed again. Shown inside the installed app, or in a tab when Chrome
  says the app is installed.
- Opening steps or status in the accessibility menu makes it taller, so it is
  re-placed above its button and the new part scrolled into view (`refit`).

Checked against the previous single file: identical behaviour for the offer
(timing, position, hold, closing), iPhone steps, the uninstall
steps on desktop/Android/iPhone, and removing the offline copy.

## When the install card shows (2026-10-01)

- It shows on every page load as soon as the page has loaded (the window
  `load` event: styles, scripts and fonts; the preview PDF is fetched by
  script and does not hold it), until it runs out or is closed. The old
  once-per-tab rule and the 7/14-day dismissal are gone: reloading the same tab never brought it back,
  which looked like it was broken.
- Chrome does not always announce that the site is installable
  (`beforeinstallprompt`), e.g. after the app was uninstalled. If no
  announcement has come within 0.8s of the page loading, browsers that can install by hand get the
  card anyway, with their own steps instead of the Install button
  (`manualSteps()` in `env.ts`: Chromium desktop, Android, iPhone/iPad,
  Safari on macOS 17+). Firefox on desktop cannot install sites, so it gets
  nothing. The Install button in the accessibility menu shows the same steps.
- If the announcement comes after the card is up, the card switches back to
  the Install button (`offer.refresh()`).
- `invite.ts` runs this; `countdown.ts` is the 30s bar, which pauses while
  hovered or focused.

## Icons

All app icons are the favicon's portrait crop (the source photo
`docs/private/IMG_20260926_035252_628.jpg` in the private repo, square crop
at 150,40, 280px): `icon-192`/`icon-512` round with a transparent outside
like the favicon; `maskable-512` full-bleed and widened to 350px (115,5) so
the face stays inside the maskable safe zone; `apple-touch-icon` square (iOS
fills transparency with black). Quantised to 256 colours to keep the
precache small.
