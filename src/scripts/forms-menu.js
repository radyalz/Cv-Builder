import { closeA11y } from "../lib/prefs";
import { positionPopover } from "../lib/popover";

/* -------- Tablets and phones: the controls in a menu --------
   Under 1024px the accent, edition and CV language controls leave the card
   for a menu opened from one "CV options" field, which shows what is
   chosen. The controls themselves are moved, not copied, so everything
   builder.js wires to them keeps working; they go back into the card when
   the screen is wide enough again. The menu rises out of the field and
   sinks back into it, the same motion as the accessibility menu. */

const COMPACT = "(max-width: 1023px)";
const OPEN_MS = 260;
const CLOSE_RATE = 1.3;

let started = false;

export function initFormsMenu() {
  const controls = document.getElementById("cvControls");
  const trigger = document.getElementById("formsTrigger");
  const menu = document.getElementById("formsMenu");
  const body = menu?.querySelector(".forms-body");
  const summary = document.getElementById("formsSummary");
  const label = document.getElementById("previewLabel");

  if (started || !controls || !trigger || !menu || !body) {
    return;
  }

  started = true;

  // Where the controls live in the card, to put them back.
  const home = document.createComment("controls");
  controls.before(home);

  let open = false;
  let motion = null;

  function animation() {
    if (!motion) {
      motion = menu.animate(
        [
          { opacity: 0, transform: "translateY(-8px) scale(0.94)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: OPEN_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
      );
      motion.pause();
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    motion.effect.updateTiming({ duration: still ? 0 : OPEN_MS });

    return motion;
  }

  // As wide as the field, under it (or above it when there is no room),
  // growing out of the field's side of it.
  function place() {
    menu.style.width = `${trigger.getBoundingClientRect().width}px`;
    positionPopover(trigger, menu);
    menu.style.transformOrigin =
      menu.getBoundingClientRect().top >= trigger.getBoundingClientRect().bottom ? "50% 0" : "50% 100%";
  }

  function openMenu() {
    document.dispatchEvent(new CustomEvent("menus:close", { detail: "forms" }));
    closeA11y();
    open = true;
    menu.hidden = false;
    menu.style.pointerEvents = "";
    trigger.setAttribute("aria-expanded", "true");
    place();

    const run = animation();

    if (run.playState !== "running") {
      run.currentTime = 0;
    }

    run.updatePlaybackRate(1);
    run.play();
  }

  function closeMenu({ refocus = false, instant = false } = {}) {
    if (!open) {
      return;
    }

    open = false;
    menu.style.pointerEvents = "none";
    trigger.setAttribute("aria-expanded", "false");

    if (instant) {
      animation().cancel();
      menu.hidden = true;
    } else {
      const run = animation();

      run.updatePlaybackRate(-CLOSE_RATE);
      run.play();
      run.finished.then(() => {
        if (!open) {
          menu.hidden = true;
        }
      });
    }

    if (refocus) {
      trigger.focus({ preventScroll: true });
    }
  }

  // The colour menu opens from the accent control; it sits above this one
  // and closes itself, so this one stays open around it.
  const colourOpen = () => !document.getElementById("colourMenu")?.hidden;

  function arrange(compact) {
    if (compact && controls.parentElement !== body) {
      body.append(controls);
    } else if (!compact && controls.parentElement === body) {
      closeMenu({ instant: true });
      home.after(controls);
    }
  }

  const compact = window.matchMedia(COMPACT);

  arrange(compact.matches);
  compact.addEventListener("change", (event) => arrange(event.matches));

  // The field shows the same "Purple · Digital · English" as the preview.
  const mirror = () => {
    summary.textContent = label.textContent;
  };

  new MutationObserver(mirror).observe(label, { childList: true, characterData: true, subtree: true });
  mirror();

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();

    if (open) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (open && !menu.contains(event.target) && !colourOpen()) {
      closeMenu();
    }
  });

  // Captured first, so an Escape meant for the colour menu closes only that.
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && open && !colourOpen()) {
        closeMenu({ refocus: true });
      }
    },
    true
  );

  document.addEventListener("menus:close", (event) => {
    if (event.detail !== "forms") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (open) {
      place();
    }
  });
}
