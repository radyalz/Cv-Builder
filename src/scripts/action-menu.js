import { positionPopover } from "../lib/popover";

/* -------- The split button (tablets and phones) --------
   On tablets and phones the three actions (Generate, Download, All published copies)
   take one row: a split button whose main part performs the chosen action
   and whose caret opens a menu to choose it. Nothing is done twice: the
   main part relays its click to the original control, and mirrors that
   control's label and disabled state as builder.js changes them (while a
   build runs, when there is no copy to download, "Generate Again"...). The
   choice is remembered for the visit. */

const CHOICE_KEY = "cv-builder-action";
const ACTIONS = ["generate", "download", "allCopies"];
const MENU_OPEN_MS = 220;
const MENU_CLOSE_RATE = 1.3;

let started = false;

export function initActionMenu() {
  const split = document.querySelector(".action-split");
  const main = split?.querySelector(".split-main");
  const toggle = split?.querySelector(".split-toggle");
  const menu = document.getElementById("actionMenu");

  if (started || !split || !main || !toggle || !menu) {
    return;
  }

  started = true;

  // The card clips its overflow and its glass makes it the containing block
  // for fixed children, so the menu lives at the top level of the page.
  document.body.append(menu);

  const items = [...menu.querySelectorAll(".action-item")];
  const originals = {
    generate: document.getElementById("generateButton"),
    download: document.getElementById("downloadLatest"),
    allCopies: document.querySelector(".actions .secondary-link"),
  };

  let choice = "generate";

  try {
    const kept = sessionStorage.getItem(CHOICE_KEY);

    if (ACTIONS.includes(kept)) {
      choice = kept;
    }
  } catch {
    // Storage blocked: start from Generate every time.
  }

  function labelOf(action) {
    const original = originals[action];

    if (action === "generate") {
      return original.querySelector(".button-label")?.textContent.trim() || "";
    }

    if (action === "allCopies") {
      return original.querySelector("[data-i18n]")?.textContent.trim() || "";
    }

    return original.textContent.trim();
  }

  function isDisabled(action) {
    return Boolean(originals[action]?.disabled);
  }

  // Brings the main part and the menu in line with the originals.
  function mirror() {
    split.dataset.action = choice;
    main.querySelector(".split-label").textContent = labelOf(choice);
    main.querySelector(".split-icon").innerHTML =
      menu.querySelector(`[data-action="${choice}"] .action-item-icon`).innerHTML;
    main.disabled = isDisabled(choice);
    // Its tooltip is the chosen action's own, with that action's details.
    main.dataset.tip = choice;

    for (const item of items) {
      const action = item.dataset.action;

      item.setAttribute("aria-checked", String(action === choice));
      item.setAttribute("aria-disabled", String(isDisabled(action)));
    }
  }

  const watch = new MutationObserver(mirror);

  for (const original of Object.values(originals)) {
    watch.observe(original, {
      attributes: true,
      attributeFilter: ["disabled", "href"],
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  // Page language changes re-label the originals, which the observer
  // catches, and the menu items, through their data-i18n.
  document.addEventListener("prefs:change", () => {
    mirror();

    if (!menu.hidden) {
      place();
    }
  });

  main.addEventListener("click", () => {
    if (main.disabled) {
      return;
    }

    // The link opens itself in a new tab, like the original always did.
    originals[choice].click();
  });

  /* -------- The menu --------
     Opens below the split button, or above when there is no room, as wide
     as the button, with the same fade, slide and grow as the accessibility
     menu; closing plays it backwards. */

  let open = false;
  let motion = null;

  function place() {
    menu.style.width = `${split.getBoundingClientRect().width}px`;
    positionPopover(split, menu);

    const box = menu.getBoundingClientRect();
    const button = split.getBoundingClientRect();

    menu.style.transformOrigin = box.top >= button.bottom ? "50% 0" : "50% 100%";
  }

  function animation() {
    if (!motion) {
      motion = menu.animate(
        [
          { opacity: 0, transform: "translateY(-6px) scale(0.96)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: MENU_OPEN_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
      );
      motion.pause();
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    motion.effect.updateTiming({ duration: still ? 0 : MENU_OPEN_MS });

    return motion;
  }

  function openMenu() {
    open = true;
    menu.hidden = false;
    menu.style.pointerEvents = "";
    toggle.setAttribute("aria-expanded", "true");
    place();

    const run = animation();

    if (run.playState !== "running") {
      run.currentTime = 0;
    }

    run.updatePlaybackRate(1);
    run.play();

    (items.find((item) => item.dataset.action === choice) || items[0]).focus({ preventScroll: true });
  }

  function closeMenu({ refocus = false } = {}) {
    if (!open) {
      return;
    }

    open = false;
    menu.style.pointerEvents = "none";
    toggle.setAttribute("aria-expanded", "false");

    const run = animation();

    run.updatePlaybackRate(-MENU_CLOSE_RATE);
    run.play();
    run.finished.then(() => {
      if (!open) {
        menu.hidden = true;
      }
    });

    if (refocus) {
      toggle.focus({ preventScroll: true });
    }
  }

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();

    if (open) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.addEventListener("click", (event) => {
    event.stopPropagation();

    const item = event.target.closest(".action-item");

    if (!item) {
      return;
    }

    choice = item.dataset.action;

    try {
      sessionStorage.setItem(CHOICE_KEY, choice);
    } catch {
      // Remembering it is only a convenience.
    }

    mirror();
    closeMenu({ refocus: true });
  });

  menu.addEventListener("keydown", (event) => {
    const index = items.indexOf(document.activeElement);
    const move = { ArrowDown: 1, ArrowUp: -1 }[event.key];

    if (move) {
      event.preventDefault();
      items[(index + move + items.length) % items.length].focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1].focus();
    } else if (event.key === "Tab") {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      closeMenu({ refocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (open && !menu.contains(event.target) && !split.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (open) {
      place();
    }
  });

  mirror();
}
