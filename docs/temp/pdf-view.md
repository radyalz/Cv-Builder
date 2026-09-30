# PDF viewer — `src/lib/pdf-view/`

Built on PDF.js instead of the browser's own viewer, which cannot be styled,
shows its own toolbar, re-lays itself out on every resize, and does not show
inside a page at all on Android. Each page is a canvas in a scrolling box, the
document's web links are real `<a>` elements laid over it, and it sizes three
ways: fit width, fit page, or a zoom level (0.3–4). PDF.js and its worker are
only downloaded the first time a document is opened.

## Files

- `library.ts` — loads PDF.js lazily and creates **one shared worker** for
  every document; without it PDF.js starts a new worker (and loads its 1 MB
  script again) for each copy opened. Documents are freed through the task
  that loaded them (`loadingTask.destroy()`; PDF.js 6 has no `doc.destroy`).
  - PDF.js 6's generated types declare the worker's `name` as `null` only,
    while its own `PDFWorkerParameters` says `string`; the options are passed
    through `PDFWorkerParameters` with a cast for that reason.
  - `isEvalSupported` was dropped: PDF.js 6 no longer reads it.
- `open.ts` — `openInto(view, source)`. `source` is the PDF as a Blob (read
  straight into PDF.js) or, as a fallback, its URL. Page 1 is shown as soon as
  it is ready; the rest are added one by one after it. Every open takes a new
  token and only shows its pages while it is still the newest, so switching
  copies quickly can never land an older copy on top of (or mix its pages
  into) the one asked for last.
- `page.ts` — `preparePage`, and `drawPage`, which draws off-screen at the new
  scale and swaps the canvas in only when done, so the old drawing stays
  visible (just softer) until the sharper one is ready. A newer render cancels
  an older one.
- `links.ts` — the link overlay. The links cover drawn text and have none of
  their own, so each gets an `aria-label` ("Email …", "Call …", "Open
  host/path") for screen readers and accessibility checks.
- `fit.ts` — the scale for the fit mode. It measures the box's own padding,
  which can keep extra room at the top and bottom (for the pills over the
  expanded preview).
- `index.ts` — the `PdfView` class. It re-renders when its box changes size
  (debounced 90ms), except while `hold(true)`: during the card's grow
  animation the box is scaled as a picture, and re-rendering mid-way would only
  waste frames. `pdf:rendered` reports `{ scale, links }` after each render;
  `flashLinks()` lights every link for 2.2s.

Checked against the previous single file at desktop and phone width: identical
page pixels, and the same 9 links with the same positions and labels.
