import { t, uiPrefs } from "../lib/prefs.js";

/* -------- The tour --------
   Started from the "How it works" popover on tablets and phones. The page
   dims, a ring of light settles on one part at a time (the CV options
   field, the main button, its arrow, the preview, the accessibility
   button) and a card beside it says what the part is and what to do with
   it, in the words for the layout on screen. Back and Next (or the arrow
   keys) move between parts; Escape, the close button or a tap on the dim
   page ends it. */

const STEPS = [
  { target: "#formsTrigger", title: "tourOptionsTitle", text: "tourOptionsText" },
  { target: ".split-main", title: "tourMainTitle", text: "tourMainText" },
  { target: ".split-toggle", title: "tourChooseTitle", text: "tourChooseText" },
  {
    target: ".preview-frame",
    title: "tourPreviewTitle",
    text: () => (window.matchMedia("(max-width: 599px)").matches ? "tourPreviewPhone" : "tourPreviewTablet"),
  },
  { target: "#a11yTrigger", title: "tourA11yTitle", text: "tourA11yText", round: true },
];

const GAP = 14; // between the ring and the card
const EDGE = 16; // the card keeps this far from the window's edges
const RING = 6; // the ring stands this far off the part it lights

let started = false;
let api = null;

export function startTour(step = 0) {
  api?.start(step);
}

export function initTour() {
  const tour = document.getElementById("tour");

  if (started || !tour) {
    return;
  }

  started = true;

  const spot = tour.querySelector(".tour-spot");
  const card = tour.querySelector(".tour-card");
  const stepLabel = document.getElementById("tourStep");
  const title = document.getElementById("tourTitle");
  const text = document.getElementById("tourText");
  const back = document.getElementById("tourBack");
  const next = document.getElementById("tourNext");
  const close = document.getElementById("tourClose");

  let index = 0;
  let open = false;
  let returnTo = null;

  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const number = (n) => (uiPrefs.lang === "fa" ? n.toLocaleString("fa-IR") : String(n));
  const target = (step) => document.querySelector(step.target);

  // The ring: a rounded box around the part (a circle for round buttons),
  // with the dimming as its enormous shadow, so the part itself stays lit.
  function placeSpot(step, box) {
    const radius = parseFloat(getComputedStyle(target(step)).borderRadius) || 0;
    let left = box.left - RING;
    let top = box.top - RING;
    let width = box.width + RING * 2;
    let height = box.height + RING * 2;
    let corner = `${radius + RING}px`;

    if (step.round) {
      const size = Math.max(width, height);

      left = box.left + box.width / 2 - size / 2;
      top = box.top + box.height / 2 - size / 2;
      width = height = size;
      corner = "50%";
    }

    Object.assign(spot.style, {
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: corner,
      transform: `translate(${left}px, ${top}px)`,
    });

    return { left, top, width, height };
  }

  // The card goes under the ring when there is room, else above it, else
  // at the bottom of the window; always inside the window's edges.
  function placeCard(ring) {
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const centre = ring.left + ring.width / 2;
    let left = Math.min(Math.max(EDGE, centre - width / 2), window.innerWidth - width - EDGE);
    let top = ring.top + ring.height + GAP;

    if (top + height > window.innerHeight - EDGE) {
      top = ring.top - GAP - height;
    }

    if (top < EDGE) {
      top = window.innerHeight - height - EDGE;
    }

    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
  }

  function place() {
    const step = STEPS[index];
    const element = target(step);

    if (!element || !element.getClientRects().length) {
      end();
      return;
    }

    placeCard(placeSpot(step, element.getBoundingClientRect()));
  }

  function show(to) {
    index = Math.max(0, Math.min(STEPS.length - 1, to));

    const step = STEPS[index];
    const textKey = typeof step.text === "function" ? step.text() : step.text;

    stepLabel.textContent = t("tourStep", { n: number(index + 1), total: number(STEPS.length) });
    title.textContent = t(step.title);
    text.textContent = t(textKey);
    back.hidden = index === 0;
    next.textContent = t(index === STEPS.length - 1 ? "tourDone" : "tourNext");

    target(step)?.scrollIntoView({ block: "nearest", behavior: still() ? "auto" : "smooth" });
    place();

    // The card's words change with a small fade, so a step change reads as
    // one.
    if (!still()) {
      card.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
    }
  }

  function start(step) {
    document.dispatchEvent(new CustomEvent("menus:close", { detail: "tour" }));
    returnTo = document.getElementById("introInfo");
    open = true;
    tour.hidden = false;
    tour.classList.remove("is-open");

    // The ring starts where it lands, without sliding in from the corner.
    spot.style.transition = "none";
    show(step);
    void spot.offsetWidth;
    spot.style.transition = "";

    requestAnimationFrame(() => tour.classList.add("is-open"));
    next.focus({ preventScroll: true });
  }

  function end() {
    if (!open) {
      return;
    }

    open = false;
    tour.classList.remove("is-open");
    window.setTimeout(() => {
      if (!open) {
        tour.hidden = true;
      }
    }, still() ? 0 : 260);
    returnTo?.focus({ preventScroll: true });
  }

  next.addEventListener("click", () => {
    if (index === STEPS.length - 1) {
      end();
    } else {
      show(index + 1);
    }
  });

  back.addEventListener("click", () => show(index - 1));
  close.addEventListener("click", end);

  // A tap on the dim page (not on the card) ends the tour.
  tour.addEventListener("click", (event) => {
    if (!card.contains(event.target)) {
      end();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!open) {
      return;
    }

    // Arrow keys follow the reading direction.
    const forward = document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = forward === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";

    if (event.key === "Escape") {
      event.stopImmediatePropagation();
      end();
    } else if (event.key === forward && index < STEPS.length - 1) {
      show(index + 1);
    } else if (event.key === backward && index > 0) {
      show(index - 1);
    } else if (event.key === "Tab") {
      // Focus stays on the card's buttons while the tour is open.
      const buttons = [...card.querySelectorAll("button")].filter((button) => !button.hidden);
      const at = buttons.indexOf(document.activeElement);

      event.preventDefault();
      buttons[(at + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
    }
  }, true);

  window.addEventListener("resize", () => {
    if (open) {
      place();
    }
  });

  // A language change re-words the open step.
  document.addEventListener("prefs:change", () => {
    if (open) {
      show(index);
    }
  });

  api = { start };
}
