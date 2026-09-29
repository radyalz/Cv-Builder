import { t, uiPrefs } from "../lib/prefs.js";

/* -------- The tour --------
   Started from the "How it works" popover. The page dims, a ring of light
   settles on one part at a time and a card beside it says what the part is
   and what to do with it. Desktop and the smaller layouts have different
   parts (the controls themselves, or the CV options field and the split
   button), so each has its own steps. Back and Next (or the arrow keys)
   move between parts; Escape, the close button or a tap on the dim page
   ends it. */

const ICONS = {
  options: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  accent: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
  edition: '<rect x="6" y="3.5" width="12" height="17" rx="1.5"/><path d="M9 8h6M9 11.5h6"/>',
  language: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17"/>',
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
  generate: '<path d="M13 2.5 4.5 13.5h6.5l-1 8 8.5-11h-6.5z"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
  all: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  choose: '<path d="M6 9.5l6 6 6-6"/>',
  preview: '<rect x="6" y="3.5" width="12" height="17" rx="1.5"/><path d="M9 8h6M9 11.5h6M9 15h4"/>',
  a11y: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.6" r="1.1"/><path d="M8 10.2c2.7.7 5.3.7 8 0M12 10.8v3.4M10 17.5l2-3.3 2 3.3"/>',
};

const A11Y = { target: "#a11yTrigger", icon: "a11y", title: "tourA11yTitle", text: "tourA11yText", round: true };

const DESKTOP_STEPS = [
  { target: "#colourTrigger", icon: "accent", title: "tourAccentTitle", text: "tourAccentText" },
  { target: "#variantToggle", icon: "edition", title: "tourEditionTitle", text: "tourEditionText" },
  { target: "#languageToggle", icon: "language", title: "tourLanguageTitle", text: "tourLanguageText" },
  { target: "#resetCv", icon: "reset", title: "tourResetTitle", text: "tourResetText" },
  { target: "#generateButton", icon: "generate", title: "tourGenerateTitle", text: "tourGenerateText" },
  { target: "#downloadLatest", icon: "download", title: "tourDownloadTitle", text: "tourDownloadText" },
  { target: ".actions .secondary-link", icon: "all", title: "tourAllTitle", text: "tourAllText" },
  { target: ".preview-frame", icon: "preview", title: "tourPreviewTitle", text: "tourPreviewDesktop" },
  A11Y,
];

const COMPACT_STEPS = [
  { target: "#formsTrigger", icon: "options", title: "tourOptionsTitle", text: "tourOptionsText" },
  { target: ".split-main", icon: "generate", title: "tourMainTitle", text: "tourMainText" },
  { target: ".split-toggle", icon: "choose", title: "tourChooseTitle", text: "tourChooseText" },
  {
    target: ".preview-frame",
    icon: "preview",
    title: "tourPreviewTitle",
    text: () => (window.matchMedia("(max-width: 599px)").matches ? "tourPreviewPhone" : "tourPreviewTablet"),
  },
  A11Y,
];

// The steps for the layout on screen.
function currentSteps() {
  return window.matchMedia("(max-width: 1023px)").matches ? COMPACT_STEPS : DESKTOP_STEPS;
}

// One button per part, for the popover: each starts the tour at its part.
export function renderTopics(container) {
  container.replaceChildren(
    ...currentSteps().map((step, index) => {
      const button = document.createElement("button");
      const label = document.createElement("span");

      button.type = "button";
      button.className = "tour-topic";
      button.dataset.step = String(index);
      button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[step.icon]}</svg>`;
      label.textContent = t(step.title);
      button.append(label);

      return button;
    })
  );
}

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

  let steps = COMPACT_STEPS;
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
  // beside it (a tall part like the preview), else at the bottom of the
  // window; always inside the window's edges.
  function placeCard(ring) {
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const room = {
      below: window.innerHeight - EDGE - (ring.top + ring.height + GAP),
      above: ring.top - GAP - EDGE,
      after: window.innerWidth - EDGE - (ring.left + ring.width + GAP),
      before: ring.left - GAP - EDGE,
    };
    const clampX = (x) => Math.min(Math.max(EDGE, x), window.innerWidth - width - EDGE);
    const clampY = (y) => Math.min(Math.max(EDGE, y), window.innerHeight - height - EDGE);
    const centreX = clampX(ring.left + ring.width / 2 - width / 2);
    const centreY = clampY(ring.top + ring.height / 2 - height / 2);
    let left;
    let top;

    if (room.below >= height) {
      [left, top] = [centreX, ring.top + ring.height + GAP];
    } else if (room.above >= height) {
      [left, top] = [centreX, ring.top - GAP - height];
    } else if (room.before >= width) {
      [left, top] = [ring.left - GAP - width, centreY];
    } else if (room.after >= width) {
      [left, top] = [ring.left + ring.width + GAP, centreY];
    } else {
      [left, top] = [centreX, window.innerHeight - height - EDGE];
    }

    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
  }

  function place() {
    const step = steps[index];
    const element = target(step);

    if (!element || !element.getClientRects().length) {
      end();
      return;
    }

    placeCard(placeSpot(step, element.getBoundingClientRect()));
  }

  function show(to) {
    index = Math.max(0, Math.min(steps.length - 1, to));

    const step = steps[index];
    const textKey = typeof step.text === "function" ? step.text() : step.text;

    stepLabel.textContent = t("tourStep", { n: number(index + 1), total: number(steps.length) });
    title.textContent = t(step.title);
    text.textContent = t(textKey);
    back.hidden = index === 0;
    next.textContent = t(index === steps.length - 1 ? "tourDone" : "tourNext");

    target(step)?.scrollIntoView({ block: "nearest", behavior: still() ? "auto" : "smooth" });
    place();

    // The card's words change with a small fade, so a step change reads as
    // one.
    if (!still()) {
      card.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
    }
  }

  function start(step) {
    steps = currentSteps();
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
    if (index === steps.length - 1) {
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
    } else if (event.key === forward && index < steps.length - 1) {
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
