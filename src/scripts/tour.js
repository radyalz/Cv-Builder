import { closeA11y, openA11y, setAdmiring, t, uiPrefs } from "../lib/prefs";

/* -------- The tour --------
   Started from the "How it works" popover. The page dims, a ring of light
   settles on one part at a time and a card beside it says what the part is
   and what to do with it. Desktop and the smaller layouts have different
   parts (the controls themselves, or the CV options field and the split
   button), so each has its own steps.

   It goes inside things too: a step can open a menu (CV options, the list
   of actions, accessibility) or the expanded preview, so their parts can
   be ringed one by one, and
   the last steps show the background being admired. Menus open and close,
   and the card comes back, as the tour moves; ending it puts everything
   back. Steps for parts that are not on screen (the link count before a
   copy has links) are passed over.

   Back and Next (or the arrow keys) move between parts; Escape, the close
   button or a tap on the dim page ends it. */

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
  links: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1"/>',
  expand: '<path d="M15 4h5v5M9 20H4v-5M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
  a11y: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.6" r="1.1"/><path d="M8 10.2c2.7.7 5.3.7 8 0M12 10.8v3.4M10 17.5l2-3.3 2 3.3"/>',
  admire: '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
};

// Step fields: `when`, a media query for the screens it is on; `target` to ring (everything it matches on screen, in one
// ring); `title` and `text` keys (text may be a function of the layout);
// `menu` to have open while it shows ("forms", "actions", "a11y", or
// "expanded" for the preview grown to full screen); `admire` to show the background alone; `round`
// for a circular ring; `optional` to pass over when not on screen;
// `topic` to offer it in the popover (with `icon`).

const LINKS = {
  target: ".preview-foot .links-hint",
  icon: "links",
  title: "tourLinksTitle",
  text: "tourLinksText",
  optional: true,
  topic: true,
};

const EXPAND = { target: "#previewExpand", icon: "expand", title: "tourExpandTitle", text: "tourExpandText", optional: true };

const width = (query) => window.matchMedia(query).matches;

// The expanded preview and its bar. Each tool's step is passed over on
// screens that fold it into a picker, and the picker's where they do.
const EXPANDED = [
  {
    target: ".expanded-info",
    icon: "expand",
    title: "tourReadTitle",
    text: () => (width("(max-width: 399px)") ? "tourReadNarrow" : "tourReadText"),
    menu: "expanded",
    topic: true,
  },
  { target: ".expanded-actions > .links-hint", title: "tourLinksTitle", text: "tourBarLinksText", menu: "expanded" },
  { target: ".pdf-tools > [data-pdf='fit-width']", title: "fitWidth", text: "tourFitWidthText", menu: "expanded", when: "(min-width: 350px)" },
  { target: ".pdf-tools > [data-pdf='fit-page']", title: "fitPage", text: "tourFitPageText", menu: "expanded", when: "(min-width: 350px)" },
  { target: ".fit-select", title: "pdfTools", text: "tourFitSelectText", menu: "expanded", when: "(max-width: 349px)" },
  {
    target: ".pdf-tools > [data-pdf^='zoom'], #pdfZoom",
    title: "zoom",
    text: () => (width("(min-width: 1024px)") ? "tourZoomText" : "tourZoomTabletText"),
    menu: "expanded",
    when: "(min-width: 600px)",
  },
  { target: ".zoom-select", title: "zoom", text: "tourZoomPhoneText", menu: "expanded", when: "(max-width: 599px)" },
  { target: "#expandedDownload", title: "downloadShort", text: "tourBarDownloadText", menu: "expanded" },
  { target: "#previewCollapse", title: "close", text: "tourCloseText", menu: "expanded" },
];

const ACCESSIBILITY = [
  { target: "#a11yTrigger", icon: "a11y", title: "tourA11yTitle", text: "tourAccessibilityText", round: true, topic: true },
  { target: "#a11yMenu > .a11y-group:nth-child(2)", title: "tourPageLangTitle", text: "tourPageLangText", menu: "a11y" },
  { target: "#a11yMenu > .a11y-group:nth-child(3)", title: "tourAppearanceTitle", text: "tourAppearanceText", menu: "a11y" },
  { target: "#a11yMenu > .a11y-group:nth-child(4)", title: "tourTextSizeTitle", text: "tourTextSizeText", menu: "a11y" },
  { target: "#a11yMenu [data-font-lang]:not([hidden])", title: "tourFontTitle", text: "tourFontText", menu: "a11y" },
  { target: "#admireFromMenu", icon: "admire", title: "tourAdmireButtonTitle", text: "tourAdmireButtonText", menu: "a11y", topic: true },
  { target: "#admireToggle", title: "tourAdmireTitle", text: "tourAdmireText", admire: true, round: true },
];

const ACTION_ITEMS = [
  { target: '#actionMenu [data-action="generate"]', title: "tourGenerateTitle", text: "tourGenerateText", menu: "actions" },
  { target: '#actionMenu [data-action="download"]', title: "tourDownloadTitle", text: "tourDownloadText", menu: "actions" },
  { target: '#actionMenu [data-action="allCopies"]', title: "tourAllTitle", text: "tourAllText", menu: "actions" },
];

const DESKTOP_STEPS = [
  { target: "#colourTrigger", icon: "accent", title: "tourAccentTitle", text: "tourAccentText", topic: true },
  { target: "#variantToggle", icon: "edition", title: "tourEditionTitle", text: "tourEditionText", topic: true },
  { target: "#languageToggle", icon: "language", title: "tourLanguageTitle", text: "tourLanguageText", topic: true },
  { target: "#resetCv", icon: "reset", title: "tourResetTitle", text: "tourResetText", topic: true },
  { target: "#generateButton", icon: "generate", title: "tourGenerateTitle", text: "tourGenerateText", topic: true },
  { target: "#downloadLatest", icon: "download", title: "tourDownloadTitle", text: "tourDownloadText", topic: true },
  { target: ".actions .secondary-link", icon: "all", title: "tourAllTitle", text: "tourAllText", topic: true },
  { target: ".preview-frame", icon: "preview", title: "tourPreviewTitle", text: "tourPreviewDesktop", topic: true },
  LINKS,
  EXPAND,
  ...EXPANDED,
  ...ACCESSIBILITY,
];

const COMPACT_STEPS = [
  { target: "#formsTrigger", icon: "options", title: "tourOptionsTitle", text: "tourOptionsInside", topic: true },
  { target: "#colourTrigger", title: "tourAccentTitle", text: "tourAccentText", menu: "forms" },
  { target: "#variantToggle", title: "tourEditionTitle", text: "tourEditionText", menu: "forms" },
  { target: "#languageToggle", title: "tourLanguageTitle", text: "tourLanguageText", menu: "forms" },
  { target: "#resetCvTop", title: "tourResetTitle", text: "tourResetText", menu: "forms", round: true },
  { target: ".split-main", icon: "generate", title: "tourMainTitle", text: "tourMainText", topic: true },
  { target: "#actionMenu", icon: "choose", title: "tourActionsTitle", text: "tourActionsText", menu: "actions", topic: true },
  ...ACTION_ITEMS,
  {
    target: ".preview-frame",
    icon: "preview",
    title: "tourPreviewTitle",
    text: () => (window.matchMedia("(max-width: 599px)").matches ? "tourPreviewPhone" : "tourPreviewTablet"),
    topic: true,
  },
  LINKS,
  EXPAND,
  ...EXPANDED,
  ...ACCESSIBILITY,
];

function onScreen(element) {
  return (
    Boolean(element?.getClientRects().length) &&
    (element.checkVisibility ? element.checkVisibility({ visibilityProperty: true }) : true)
  );
}

// The steps for the layout on screen, less the optional ones for parts
// that are not there (so the count only counts what will be shown).
function currentSteps() {
  const steps = window.matchMedia("(max-width: 1023px)").matches ? COMPACT_STEPS : DESKTOP_STEPS;

  return steps.filter(
    (step) =>
      (!step.when || width(step.when)) && (!step.optional || onScreen(document.querySelector(step.target)))
  );
}

// A step's parts on screen, and the box around them all.
function targetsOf(step) {
  return [...document.querySelectorAll(step.target)].filter(onScreen);
}

function boxAround(elements) {
  const boxes = elements.map((element) => element.getBoundingClientRect());
  const left = Math.min(...boxes.map((box) => box.left));
  const top = Math.min(...boxes.map((box) => box.top));

  return {
    left,
    top,
    width: Math.max(...boxes.map((box) => box.right)) - left,
    height: Math.max(...boxes.map((box) => box.bottom)) - top,
  };
}

// One button per main part, for the popover: each starts the tour there.
export function renderTopics(container) {
  const steps = currentSteps();

  container.replaceChildren(
    ...steps
      .filter((step) => step.topic)
      .map((step) => {
        const button = document.createElement("button");
        const label = document.createElement("span");

        button.type = "button";
        button.className = "tour-topic";
        button.dataset.step = String(steps.indexOf(step));
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
const MENU_MS = 320; // long enough for a menu to finish opening
const GROW_MS = 1200; // and for the preview to grow or shrink

let started = false;
let api = null;

export function startTour(step = 0) {
  api?.start(step);
}

/* -------- The menus a step can open -------- */

function isOpen(name) {
  if (name === "expanded") {
    return document.querySelector(".builder-card")?.classList.contains("is-expanded");
  }

  const trigger = {
    forms: "#formsTrigger",
    actions: ".split-toggle",
    a11y: "#a11yTrigger",
  }[name];

  return document.querySelector(trigger)?.getAttribute("aria-expanded") === "true";
}

function openMenu(name) {
  if (isOpen(name)) {
    return;
  }

  if (name === "forms") document.getElementById("formsTrigger").click();
  if (name === "actions") document.querySelector(".split-toggle").click();
  if (name === "a11y") openA11y();

  // Expand, or on phones (where there is no Expand button) the preview.
  if (name === "expanded") {
    const expand = document.getElementById("previewExpand");

    (onScreen(expand) ? expand : document.querySelector(".preview-frame")).click();
  }
}

function closeMenu(name) {
  if (!isOpen(name)) {
    return;
  }

  if (name === "forms") document.getElementById("formsTrigger").click();
  if (name === "actions") document.querySelector(".split-toggle").click();
  if (name === "a11y") closeA11y();
  if (name === "expanded") document.getElementById("previewCollapse").click();
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
  let menu = null; // the menu the tour has open
  let admiring = false;
  let token = 0;

  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const number = (n) => (uiPrefs.lang === "fa" ? n.toLocaleString("fa-IR") : String(n));
  const pause = (ms) => new Promise((resolve) => window.setTimeout(resolve, still() ? 0 : ms));

  // The ring: a rounded box around the part (a circle for round buttons),
  // with the dimming as its enormous shadow, so the part itself stays lit.
  function placeSpot(step, parts, box) {
    const radius = parts.length === 1 ? parseFloat(getComputedStyle(parts[0]).borderRadius) || 0 : 12;
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
    const parts = targetsOf(step);

    if (!parts.length) {
      return;
    }

    placeCard(placeSpot(step, parts, boxAround(parts)));
  }

  // Opens the menu a step needs (closing any other the tour opened) and
  // shows or hides the background alone, waiting for either to settle.
  async function stage(step) {
    const wanted = step.menu ?? null;
    let waited = 0;

    if (menu !== wanted) {
      if (menu) {
        closeMenu(menu);
        waited = menu === "expanded" ? GROW_MS : MENU_MS;
      }

      menu = wanted;

      if (wanted) {
        openMenu(wanted);
        waited = wanted === "expanded" ? GROW_MS : Math.max(waited, MENU_MS);
      }
    }

    if (admiring !== Boolean(step.admire)) {
      admiring = Boolean(step.admire);
      setAdmiring(admiring);
      waited = Math.max(waited, MENU_MS);
    }

    // The dim is lighter over the background alone, so it can be seen.
    tour.classList.toggle("is-light", admiring);

    if (waited) {
      await pause(waited);
      // Opening a menu can move the focus into it; it belongs on the card.
      next.focus({ preventScroll: true });
    }
  }

  async function show(to, direction = 1) {
    const mine = ++token;

    index = Math.max(0, Math.min(steps.length - 1, to));

    let step = steps[index];

    await stage(step);

    if (mine !== token) {
      return;
    }

    // A part not on screen is passed over, in the direction of travel.
    if (!targetsOf(step).length) {
      const onward = index + direction;

      if ((step.optional || step.menu) && onward >= 0 && onward < steps.length) {
        show(onward, direction);
      } else {
        end();
      }

      return;
    }

    step = steps[index];

    const textKey = typeof step.text === "function" ? step.text() : step.text;

    stepLabel.textContent = t("tourStep", { n: number(index + 1), total: number(steps.length) });
    title.textContent = t(step.title);
    text.textContent = t(textKey);
    back.hidden = index === 0;
    next.textContent = t(index === steps.length - 1 ? "tourDone" : "tourNext");

    targetsOf(step)[0].scrollIntoView({ block: "nearest", behavior: still() ? "auto" : "smooth" });
    place();

    // The card's words change with a small fade, so a step change reads as
    // one.
    if (!still()) {
      card.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
    }
  }

  async function start(step) {
    steps = currentSteps();
    document.dispatchEvent(new CustomEvent("menus:close", { detail: "tour" }));
    returnTo = document.getElementById("introInfo");
    open = true;
    menu = null;
    admiring = false;
    tour.hidden = false;
    tour.classList.remove("is-open", "is-light");

    // The ring starts where it lands, without sliding in from the corner.
    spot.style.transition = "none";
    await show(step);
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
    token++;

    if (menu) {
      closeMenu(menu);
      menu = null;
    }

    if (admiring) {
      setAdmiring(false);
      admiring = false;
    }

    tour.classList.remove("is-open");
    window.setTimeout(() => {
      if (!open) {
        tour.hidden = true;
        tour.classList.remove("is-light");
      }
    }, still() ? 0 : 260);
    returnTo?.focus({ preventScroll: true });
  }

  next.addEventListener("click", () => {
    if (index === steps.length - 1) {
      end();
    } else {
      show(index + 1, 1);
    }
  });

  back.addEventListener("click", () => show(index - 1, -1));
  close.addEventListener("click", end);

  // Clicks on the tour stay with it: the menus it has open would otherwise
  // take a click on the card as a click outside them and close. A tap on
  // the dim page (not on the card) ends the tour.
  tour.addEventListener("click", (event) => {
    event.stopPropagation();

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
      event.stopImmediatePropagation();
      show(index + 1, 1);
    } else if (event.key === backward && index > 0) {
      event.stopImmediatePropagation();
      show(index - 1, -1);
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
