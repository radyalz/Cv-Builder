import { t } from "../../lib/prefs";
import { saveImage, videoType } from "./files";
import { wallpaperPopover, type WallpaperPopover } from "./popover";
import { record, type Recording } from "./recorder";
import { findUi, pickLength, refresh, selectedSeconds, showProgress, type WallpaperUi } from "./ui";

let started = false;

function controller(ui: WallpaperUi, popover: WallpaperPopover) {
  const type = videoType();
  let job: Recording | null = null;
  const update = () => refresh(ui, Boolean(type), Boolean(job));

  const start = () => {
    if (!type || job) {
      return;
    }

    job = record(type, selectedSeconds(ui), {
      onProgress: (fraction, left) => showProgress(ui, fraction, left),
      onEnd: (saved) => {
        job = null;
        ui.button.classList.remove("is-recording");
        ui.button.style.removeProperty("--progress");
        ui.bar.style.transform = "scaleX(0)";

        if (saved) ui.status.textContent = t("recordingDone");
        update();
      },
    });
    ui.button.classList.add("is-recording");
    update();
    ui.cancelButton.focus({ preventScroll: true });
  };

  return {
    start,
    cancel: () => job?.cancel(),
    show: () => {
      update();
      popover.show(job ? ui.cancelButton : ui.imageButton);
    },
    update,
  };
}

function wire(ui: WallpaperUi, popover: WallpaperPopover): void {
  const control = controller(ui, popover);

  ui.button.addEventListener("click", (event) => {
    event.stopPropagation();
    popover.isOpen() ? popover.hide() : control.show();
  });

  ui.menu.addEventListener("click", (event) => {
    event.stopPropagation();
    pickLength(ui, event.target as Element);
  });

  ui.imageButton.addEventListener("click", saveImage);
  ui.videoButton.addEventListener("click", control.start);
  ui.cancelButton.addEventListener("click", control.cancel);
  document.addEventListener("click", () => popover.hide());

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && popover.isOpen()) {
        event.stopImmediatePropagation();
        popover.hide({ refocus: true });
      }
    },
    true
  );

  new MutationObserver(() => {
    if (!document.body.classList.contains("is-admiring")) {
      popover.hide();
      control.cancel();
    }
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", () => popover.isOpen() && (control.update(), popover.place()));
  document.addEventListener("prefs:change", () => popover.isOpen() && control.update());
}

export function initWallpaper(): void {
  const button = document.getElementById("wallpaperToggle");
  const menu = document.getElementById("wallpaperMenu");

  if (started || !button || !menu) {
    return;
  }

  started = true;
  wire(findUi(button, menu), wallpaperPopover(button, menu));
}
