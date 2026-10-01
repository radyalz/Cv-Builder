import { setSkullsPaused } from "../../../lib/skulls";
import { hideTip } from "../../../lib/tooltip";
import { setBarMenu } from "../bar-menus";
import { el } from "../dom";
import { app } from "../state";
import { RETURN_AT, RETURN_FADE_MS, SHRINK_MS, growBetween, holdPaper, previewOrigin, reducedMotion, settle, wait, within } from "./motion";
import { measureParts, pinParts, unpinParts } from "./pin";
import { expand, runQueued } from "./queue";

function measureReturn() {
  el.card.classList.remove("is-expanded");

  const cardTo = el.card.getBoundingClientRect();
  const frameTo = within(previewOrigin(), cardTo);
  const parts = measureParts();

  el.card.classList.add("is-expanded");

  return { cardTo, frameTo, parts };
}

export async function collapsePreview(): Promise<void> {
  if (expand.state === "opening") {
    expand.queued = "close";
    return;
  }

  if (expand.state !== "open") {
    return;
  }

  expand.state = "closing";
  hideTip();
  setBarMenu(null);
  setSkullsPaused("covered", false);

  const quick = reducedMotion();

  if (app.pdfView.fit !== "width" && !el.previewDoc.hidden) {
    app.pdfView.fit = "width";
    await app.pdfView.render();
  }

  const cardFrom = el.card.getBoundingClientRect();
  const frameFrom = within(el.previewBox.getBoundingClientRect(), cardFrom);
  const { cardTo, frameTo, parts } = measureReturn();

  pinParts(parts);

  const room = parseFloat(getComputedStyle(el.previewDoc).paddingTop) - app.pdfView.pad();
  const scrolled = Math.max(0, el.previewDoc.scrollTop - room);
  const scale = holdPaper(frameTo, frameFrom);

  el.card.classList.remove("is-open");

  const shrinking = growBetween({
    card: [within(cardFrom), within(cardTo)],
    frame: [frameFrom, frameTo],
    duration: quick ? 0 : SHRINK_MS,
    paper: scale ? { from: 1, to: scale } : null,
  });

  await wait(quick ? 0 : SHRINK_MS * RETURN_AT);
  el.card.style.setProperty("--fade-ms", `${RETURN_FADE_MS}ms`);
  el.card.classList.remove("is-fading");

  const animations = await shrinking;

  el.card.classList.remove("is-expanded");
  settle(animations);
  el.previewDoc.scrollTop = scale ? scrolled * scale : 0;
  unpinParts();
  document.body.classList.remove("preview-open");
  void wait(quick ? 0 : RETURN_FADE_MS).then(() => el.card.style.removeProperty("--fade-ms"));
  expand.state = "closed";

  if (expand.queued) {
    runQueued();
    return;
  }

  el.previewExpand.focus({ preventScroll: true });

  if (document.activeElement !== el.previewExpand) el.previewBox.focus({ preventScroll: true });
}
