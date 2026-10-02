import { closeA11y } from "../../../lib/prefs";
import { setSkullsPaused } from "../../../lib/skulls";
import { hideTip } from "../../../lib/tooltip";
import { closeMenu } from "../colour-menu";
import { generatedCopy } from "../copies";
import { el } from "../dom";
import { selectedKey } from "../selection";
import { app } from "../state";
import { GROW_MS, LEAVE_DELAY_MS, growBetween, holdPaper, previewOrigin, reducedMotion, settle, wait, within } from "./motion";
import { measureParts, pinParts, unpinParts } from "./pin";
import { expand, runQueued } from "./queue";

function measureTarget() {
  el.card.classList.add("is-expanded");

  const cardTo = el.card.getBoundingClientRect();
  const frameTo = within(el.previewBox.getBoundingClientRect(), cardTo);
  const room = parseFloat(getComputedStyle(el.previewDoc).paddingTop) - app.pdfView.pad();

  el.card.classList.remove("is-expanded");

  return { cardTo, frameTo, room };
}

export async function expandPreview(): Promise<void> {
  if (expand.state === "closing") {
    expand.queued = "open";
    return;
  }

  if (expand.state !== "closed" || !(app.variants.has(selectedKey()) || generatedCopy())) {
    return;
  }

  expand.state = "opening";
  hideTip();
  closeMenu();
  closeA11y();

  const quick = reducedMotion();
  const cardFrom = el.card.getBoundingClientRect();
  const frameFrom = within(previewOrigin(), cardFrom);
  const parts = measureParts();
  const { cardTo, frameTo, room } = measureTarget();
  const scrolled = el.previewDoc.scrollTop;

  el.card.style.height = `${cardFrom.height}px`;

  const scale = holdPaper(frameFrom, frameTo);

  if (scale) {
    el.previewDoc.style.transform = `scale(${scale})`;
    await app.pdfView.render();
  }

  document.body.classList.add("preview-open");
  pinParts(parts, { leaving: true });
  el.card.style.setProperty("--fade-delay", `${quick ? 0 : LEAVE_DELAY_MS}ms`);
  el.card.classList.add("is-expanded", "is-fading");
  el.previewDoc.scrollTop = Math.max(0, room) + (scale ? scrolled / scale : 0);

  const growing = growBetween({
    card: [within(cardFrom), within(cardTo)],
    frame: [frameFrom, frameTo],
    duration: quick ? 0 : GROW_MS,
    paper: scale ? { from: scale, to: 1 } : null,
  });

  await wait(quick ? 0 : GROW_MS * 0.2);
  el.card.classList.add("is-open");
  const done = await growing;

  el.card.style.removeProperty("height");
  settle(done);
  unpinParts();
  el.card.style.removeProperty("--fade-delay");
  expand.state = "open";
  setSkullsPaused("covered", true);
  window.setTimeout(() => app.pdfView.flashLinks(), 350);
  runQueued();
  el.previewCollapse.focus({ preventScroll: true });
}
