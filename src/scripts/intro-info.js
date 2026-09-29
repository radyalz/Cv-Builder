import { closeA11y } from "../lib/prefs.js";
import { positionPopover } from "../lib/popover.js";
import { initTour, startTour } from "./tour.js";

/* -------- The intro on tablets and phones --------
   Under 1024px the line under the name is replaced by an info button
   beside it, which opens the explanation for the controls on that screen
   in a small popover, with the same rise and fade as the other menus. Its
   buttons start the tour (tour.js): all of it, or straight at one part. */

const OPEN_MS = 240;
const CLOSE_RATE = 1.3;

let started = false;

export function initIntroInfo() {
  const button = document.getElementById("introInfo");
  const pop = document.getElementById("introPop");

  if (started || !button || !pop) {
    return;
  }

  started = true;

  let open = false;
  let motion = null;

  function animation() {
    if (!motion) {
      motion = pop.animate(
        [
          { opacity: 0, transform: "translateY(-6px) scale(0.94)" },
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

  // Under the button, growing out of its side.
  function place() {
    positionPopover(button, pop);

    const box = pop.getBoundingClientRect();
    const from = button.getBoundingClientRect();
    const x = Math.min(box.width, Math.max(0, from.left + from.width / 2 - box.left));

    pop.style.transformOrigin = `${Math.round(x)}px ${box.top >= from.bottom ? 0 : "100%"}`;
  }

  function show() {
    document.dispatchEvent(new CustomEvent("menus:close", { detail: "intro" }));
    closeA11y();
    open = true;
    pop.hidden = false;
    pop.style.pointerEvents = "";
    button.setAttribute("aria-expanded", "true");
    place();

    const run = animation();

    if (run.playState !== "running") {
      run.currentTime = 0;
    }

    run.updatePlaybackRate(1);
    run.play();

    // Keyboard and screen reader users land in the popover.
    document.getElementById("tourStart")?.focus({ preventScroll: true });
  }

  function hide({ refocus = false, instant = false } = {}) {
    if (!open) {
      return;
    }

    open = false;
    pop.style.pointerEvents = "none";
    button.setAttribute("aria-expanded", "false");

    const run = animation();

    if (instant) {
      run.cancel();
      pop.hidden = true;
    } else {
      run.updatePlaybackRate(-CLOSE_RATE);
      run.play();
      run.finished.then(() => {
        if (!open) {
          pop.hidden = true;
        }
      });
    }

    if (refocus) {
      button.focus({ preventScroll: true });
    }
  }

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    if (open) {
      hide();
    } else {
      show();
    }
  });

  document.addEventListener("click", (event) => {
    if (open && !pop.contains(event.target)) {
      hide();
    }
  });

  initTour();

  pop.addEventListener("click", (event) => {
    const start = event.target.closest("#tourStart, .tour-topic");

    if (start) {
      hide({ instant: true });
      startTour(Number(start.dataset.step || 0));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      hide({ refocus: true });
    }
  });

  document.addEventListener("menus:close", (event) => {
    if (event.detail !== "intro") {
      hide();
    }
  });

  // Desktop shows the intro under the name again, so the popover goes.
  window.matchMedia("(max-width: 1023px)").addEventListener("change", (event) => {
    if (!event.matches) {
      hide({ instant: true });
    }
  });

  window.addEventListener("resize", () => {
    if (open) {
      place();
    }
  });
}
