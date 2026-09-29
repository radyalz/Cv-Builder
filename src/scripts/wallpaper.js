import { positionPopover } from "../lib/popover.js";
import { t, uiPrefs } from "../lib/prefs.js";

/* -------- Saving the background --------
   While the background is being admired, a download button beside the eye
   saves it alone (no card, no buttons) at the window's size in device
   pixels: as a PNG of this moment, or as a 15 to 30 second video to use as
   a wallpaper. The background is two canvases, the gradient and halftone
   (halftone.js) and the skulls (skulls.js); each frame they are drawn one
   over the other onto a third canvas, which is what gets saved or
   recorded. The video is MP4 where the browser can record it (Chrome,
   Edge, Safari) and WebM elsewhere (Firefox). Leaving admire mode cancels
   a recording. */

const MAX_SIDE = 3840; // the longest side saved, in pixels
const FPS = 30;
const OPEN_MS = 220;
const CLOSE_RATE = 1.3;
const TYPES = ["video/mp4;codecs=avc1.640028", "video/mp4", "video/webm;codecs=vp9", "video/webm"];

let started = false;

// The window's size in device pixels, capped, and even (as video needs).
function outputSize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  let width = window.innerWidth * ratio;
  let height = window.innerHeight * ratio;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const even = (value) => Math.max(2, Math.round((value * scale) / 2) * 2);

  width = even(width);
  height = even(height);

  return { width, height };
}

// The background alone, drawn at the given size.
function compose(context, width, height) {
  const tone = document.querySelector(".tone-field canvas");
  const skulls = document.querySelector(".skull-field canvas");

  context.fillStyle = getComputedStyle(document.body).backgroundColor || "#050506";
  context.fillRect(0, 0, width, height);

  for (const canvas of [tone, skulls]) {
    if (canvas?.width) {
      context.drawImage(canvas, 0, 0, width, height);
    }
  }
}

function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = name;
  // Kept to itself: the page would take it as a click outside the menu.
  link.addEventListener("click", (event) => event.stopPropagation());
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function fileName(width, height, extension, seconds) {
  return `radman-skulls-${width}x${height}${seconds ? `-${seconds}s` : ""}.${extension}`;
}

function videoType() {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    return null;
  }

  return TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

export function initWallpaper() {
  const button = document.getElementById("wallpaperToggle");
  const menu = document.getElementById("wallpaperMenu");

  if (started || !button || !menu) {
    return;
  }

  started = true;

  const imageButton = document.getElementById("wallpaperImage");
  const videoButton = document.getElementById("wallpaperVideo");
  const cancelButton = document.getElementById("wallpaperCancel");
  const lengths = document.getElementById("wallpaperLength");
  const sizeLabel = menu.querySelector(".wallpaper-size");
  const choices = menu.querySelector(".wallpaper-video");
  const recording = menu.querySelector(".wallpaper-recording");
  const bar = menu.querySelector(".wallpaper-bar span");
  const status = menu.querySelector(".wallpaper-status");
  const type = videoType();

  let open = false;
  let motion = null;
  let job = null; // the recording under way

  const number = (n) => (uiPrefs.lang === "fa" ? n.toLocaleString("fa-IR") : String(n));

  /* -------- The menu, with the same rise and fade as the others -------- */

  function animation() {
    if (!motion) {
      motion = menu.animate(
        [
          { opacity: 0, transform: "translateY(8px) scale(0.94)" },
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

  function place() {
    positionPopover(button, menu);

    const box = menu.getBoundingClientRect();
    const from = button.getBoundingClientRect();
    const x = Math.min(box.width, Math.max(0, from.left + from.width / 2 - box.left));

    menu.style.transformOrigin = `${Math.round(x)}px ${box.top >= from.bottom ? 0 : "100%"}`;
  }

  function refresh() {
    const { width, height } = outputSize();

    sizeLabel.textContent = `${number(width)} × ${number(height)} PNG`;
    videoButton.disabled = !type || Boolean(job);
    choices.hidden = Boolean(job);
    recording.hidden = !job;

    if (!type && !job) {
      status.textContent = t("noVideo");
      recording.hidden = false;
      recording.querySelector(".wallpaper-bar").hidden = true;
      cancelButton.hidden = true;
    } else {
      recording.querySelector(".wallpaper-bar").hidden = false;
      cancelButton.hidden = false;
    }
  }

  function show() {
    open = true;
    refresh();
    menu.hidden = false;
    menu.style.pointerEvents = "";
    button.setAttribute("aria-expanded", "true");
    place();

    const run = animation();

    if (run.playState !== "running") {
      run.currentTime = 0;
    }

    run.updatePlaybackRate(1);
    run.play();
    (job ? cancelButton : imageButton).focus({ preventScroll: true });
  }

  function hide({ refocus = false } = {}) {
    if (!open) {
      return;
    }

    open = false;
    menu.style.pointerEvents = "none";
    button.setAttribute("aria-expanded", "false");

    const run = animation();

    run.updatePlaybackRate(-CLOSE_RATE);
    run.play();
    run.finished.then(() => {
      if (!open) {
        menu.hidden = true;
      }
    });

    if (refocus) {
      button.focus({ preventScroll: true });
    }
  }

  /* -------- Saving -------- */

  function saveImage() {
    const { width, height } = outputSize();
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;
    compose(canvas.getContext("2d"), width, height);
    canvas.toBlob((blob) => blob && save(blob, fileName(width, height, "png")), "image/png");
  }

  function selectedSeconds() {
    return Number(lengths.querySelector('[aria-checked="true"]')?.dataset.seconds || 15);
  }

  function record() {
    if (!type || job) {
      return;
    }

    const seconds = selectedSeconds();
    const { width, height } = outputSize();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, {
      mimeType: type,
      // About 8 Mbit/s for a 1080p frame, scaled with the frame's size.
      videoBitsPerSecond: Math.round(Math.min(24e6, Math.max(4e6, (width * height * 8e6) / (1920 * 1080)))),
    });
    const chunks = [];
    const startedAt = performance.now();

    canvas.width = width;
    canvas.height = height;

    job = { recorder, stream, frame: 0, cancelled: false, seconds };

    // Each frame, the background as it is now onto the recorded canvas.
    const tick = (now) => {
      if (!job || job.recorder !== recorder) {
        return;
      }

      compose(context, width, height);

      const elapsed = (now - startedAt) / 1000;
      const left = Math.max(0, Math.ceil(seconds - elapsed));

      bar.style.transform = `scaleX(${Math.min(1, elapsed / seconds)})`;
      button.style.setProperty("--progress", String(Math.min(1, elapsed / seconds)));
      status.textContent = t("recordingLeft", { n: number(left) });

      if (elapsed >= seconds) {
        recorder.stop();
        return;
      }

      job.frame = requestAnimationFrame(tick);
    };

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size) {
        chunks.push(event.data);
      }
    });

    recorder.addEventListener("stop", () => {
      const cancelled = job?.cancelled;

      stream.getTracks().forEach((track) => track.stop());
      cancelAnimationFrame(job?.frame);
      job = null;
      button.classList.remove("is-recording");
      button.style.removeProperty("--progress");
      bar.style.transform = "scaleX(0)";

      if (!cancelled && chunks.length) {
        const extension = type.startsWith("video/mp4") ? "mp4" : "webm";

        save(new Blob(chunks, { type: type.split(";")[0] }), fileName(width, height, extension, seconds));
        status.textContent = t("recordingDone");
      }

      refresh();
    });

    compose(context, width, height);
    recorder.start(1000);
    button.classList.add("is-recording");
    refresh();
    cancelButton.focus({ preventScroll: true });
    job.frame = requestAnimationFrame(tick);
  }

  function cancel() {
    if (job) {
      job.cancelled = true;
      job.recorder.stop();
    }
  }

  /* -------- Wiring -------- */

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    if (open) {
      hide();
    } else {
      show();
    }
  });

  menu.addEventListener("click", (event) => {
    event.stopPropagation();

    const segment = event.target.closest("#wallpaperLength .segment");

    if (segment) {
      for (const option of lengths.querySelectorAll(".segment")) {
        option.setAttribute("aria-checked", String(option === segment));
      }
    }
  });

  imageButton.addEventListener("click", saveImage);
  videoButton.addEventListener("click", record);
  cancelButton.addEventListener("click", cancel);

  document.addEventListener("click", () => hide());

  // Captured first, so Escape closes this menu before it leaves admire
  // mode.
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && open) {
        event.stopImmediatePropagation();
        hide({ refocus: true });
      }
    },
    true
  );

  // Leaving admire mode closes the menu and cancels a recording.
  new MutationObserver(() => {
    if (!document.body.classList.contains("is-admiring")) {
      hide();
      cancel();
    }
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", () => {
    if (open) {
      refresh();
      place();
    }
  });

  document.addEventListener("prefs:change", () => {
    if (open) {
      refresh();
    }
  });
}
