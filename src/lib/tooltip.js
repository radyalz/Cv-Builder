/* -------- Tooltips --------
   Markup and styles live in Tooltip.astro. Any element with data-tip gets
   one. What it says comes from the content function a page registers with
   setTipContent(); without one, data-tip-title and data-tip-body are used.
   Content is { title, body, facts: [[label, value, { mono, dot }]],
   hint: { label, key } }. */

let tooltip;
let tipPop;
let tipBubble;
let tipContentBox;

let contentFor = (element) => ({
  title: element.dataset.tipTitle || element.getAttribute("aria-label") || "",
  body: element.dataset.tipBody || "",
});

export function setTipContent(fn) {
  contentFor = fn;
}

function renderTip({ title, body = "", facts = [], hint = null }) {
  const fragment = document.createDocumentFragment();
  const heading = document.createElement("span");

  heading.className = "tip-title";
  heading.textContent = title;
  fragment.append(heading);

  if (body) {
    const text = document.createElement("p");

    text.className = "tip-body";
    text.textContent = body;
    fragment.append(text);
  }

  if (facts.length) {
    const list = document.createElement("dl");

    list.className = "tip-facts";

    for (const [label, value, options = {}] of facts) {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");

      term.textContent = label;

      if (options.dot) {
        const dot = document.createElement("span");

        dot.className = "tip-dot";
        dot.style.background = options.dot;
        detail.append(dot);
      }

      const valueText = document.createElement("span");

      valueText.textContent = value;

      if (options.mono) {
        valueText.className = "is-mono";
        valueText.dir = "ltr";
      }

      detail.append(valueText);
      list.append(term, detail);
    }

    fragment.append(list);
  }

  if (hint) {
    const line = document.createElement("div");
    const key = document.createElement("span");

    line.className = "tip-hint";
    key.className = "tip-kbd";
    key.textContent = hint.key;
    line.append(`${hint.label} `, key);
    fragment.append(line);
  }

  tipContentBox.replaceChildren(fragment);
}


/* -------- Tooltip motion --------
   Like the ERD schema tooltip: with a mouse it trails the cursor on a
   spring (stiffness 750, damping 45) and stretches slightly in the
   direction of travel, tilting with the speed. Keyboard focus pins it
   above the control with an arrow instead. */

const TIP_GAP_X = 12;
const TIP_GAP_Y = 16;
const TIP_SPRING = { stiffness: 750, damping: 45 };

let tipTimer = null;
let tipHideTimer = null;
let tipTarget = null;
let tipMode = "cursor";
let tipFrame = null;
let tipLastTime = 0;

const tipMouse = { x: 0, y: 0 };
const tipPos = { x: 0, y: 0 };
const tipVel = { x: 0, y: 0 };

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function tipIsVisible() {
  return tooltip.classList.contains("is-visible");
}

function placeCursorTip() {
  const width = tipBubble.offsetWidth;
  const height = tipBubble.offsetHeight;
  const flipX = tipMouse.x + TIP_GAP_X + width > window.innerWidth - 8;
  const flipY = tipMouse.y + TIP_GAP_Y + height > window.innerHeight - 8;
  const offsetX = flipX ? `calc(-100% - ${TIP_GAP_X}px)` : `${TIP_GAP_X}px`;
  const offsetY = flipY ? `calc(-100% - ${TIP_GAP_X}px)` : `${TIP_GAP_Y}px`;

  tooltip.style.transform =
    `translate3d(${tipPos.x}px, ${tipPos.y}px, 0) translate(${offsetX}, ${offsetY})`;
  tipPop.style.transformOrigin = `${flipX ? "right" : "left"} ${flipY ? "bottom" : "top"}`;

  // Stretch along the direction of travel, as the ERD tooltip does.
  const vx = clamp(tipVel.x, -1000, 1000) / 1000;
  const vy = clamp(tipVel.y, -1000, 1000) / 1000;
  const scaleX = vx < 0 ? 1 + vx * 0.1 : 1 + vx * 0.15;
  const scaleY = vy < 0 ? 1 - vy * 0.15 : 1 - vy * 0.1;

  tipBubble.style.transform =
    `scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}) skew(${(vx * 3).toFixed(2)}deg, ${(vy * 3).toFixed(2)}deg)`;
}

function tipStep(time) {
  const dt = Math.min(1 / 30, (time - (tipLastTime || time)) / 1000 || 1 / 60);

  tipLastTime = time;

  for (const axis of ["x", "y"]) {
    const force = TIP_SPRING.stiffness * (tipMouse[axis] - tipPos[axis]) - TIP_SPRING.damping * tipVel[axis];

    tipVel[axis] += force * dt;
    tipPos[axis] += tipVel[axis] * dt;
  }

  const settled =
    Math.abs(tipMouse.x - tipPos.x) < 0.2 &&
    Math.abs(tipMouse.y - tipPos.y) < 0.2 &&
    Math.abs(tipVel.x) < 2 &&
    Math.abs(tipVel.y) < 2;

  if (settled) {
    tipPos.x = tipMouse.x;
    tipPos.y = tipMouse.y;
    tipVel.x = 0;
    tipVel.y = 0;
  }

  placeCursorTip();
  tipFrame = settled || tipMode !== "cursor" ? null : requestAnimationFrame(tipStep);
}

function runTipSpring() {
  if (!tipFrame) {
    tipLastTime = 0;
    tipFrame = requestAnimationFrame(tipStep);
  }
}

function placeArrowTip(element) {
  const rect = element.getBoundingClientRect();
  const width = tipBubble.offsetWidth;
  const height = tipBubble.offsetHeight;
  const above = rect.top - height - 12 >= 8;
  const centre = rect.left + rect.width / 2;
  const left = clamp(centre - width / 2, 8, window.innerWidth - width - 8);
  const top = above ? rect.top - height - 12 : rect.bottom + 12;

  tooltip.dataset.side = above ? "top" : "bottom";
  tooltip.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  tipPop.style.transformOrigin = `${centre - left}px ${above ? "100%" : "0"}`;
  tipBubble.style.transform = "";
  tooltip.querySelector(".tip-arrow").style.left = `${clamp(centre - left - 5, 8, width - 18)}px`;
}

function showTip(element, mode) {
  window.clearTimeout(tipHideTimer);

  const wasVisible = tipIsVisible();

  renderTip(contentFor(element));
  tipMode = mode;
  tooltip.dataset.mode = mode;
  element.setAttribute("aria-describedby", "tooltip");

  if (wasVisible) {
    // Moving between controls keeps the bubble and swaps its contents.
    tipContentBox.classList.remove("is-swapping");
    void tipContentBox.offsetWidth;
    tipContentBox.classList.add("is-swapping");
  }

  if (mode === "cursor") {
    if (!wasVisible) {
      tipPos.x = tipMouse.x;
      tipPos.y = tipMouse.y;
      tipVel.x = 0;
      tipVel.y = 0;
    }

    placeCursorTip();
    runTipSpring();
  } else {
    placeArrowTip(element);
  }

  tooltip.classList.add("is-visible");
}

export function hideTip() {
  if (!tooltip) {
    return;
  }

  window.clearTimeout(tipTimer);
  window.clearTimeout(tipHideTimer);

  if (tipTarget) {
    tipTarget.removeAttribute("aria-describedby");
  }

  tipTarget = null;
  tooltip.classList.remove("is-visible");
}

let started = false;

export function initTooltip() {
  if (started) {
    return;
  }

  tooltip = document.getElementById("tooltip");

  if (!tooltip) {
    return;
  }

  started = true;
  tipPop = tooltip.querySelector(".tip-pop");
  tipBubble = tooltip.querySelector(".tip-bubble");
  tipContentBox = tooltip.querySelector(".tip-content");

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      tipMouse.x = event.clientX;
      tipMouse.y = event.clientY;

      if (tipMode === "cursor" && tipIsVisible()) {
        runTipSpring();
      }
    },
    { passive: true }
  );

  // Hover opens it after a short pause; once one is open, moving onto the
  // next control switches it straight away. Touch never shows it.
  document.addEventListener("pointerover", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const target = event.target.closest("[data-tip]");

    if (target === tipTarget) {
      return;
    }

    window.clearTimeout(tipTimer);

    if (!target) {
      // A short grace period, so crossing the gap between two segments does
      // not close and reopen it.
      window.clearTimeout(tipHideTimer);
      tipHideTimer = window.setTimeout(hideTip, 90);
      return;
    }

    if (tipTarget) {
      tipTarget.removeAttribute("aria-describedby");
    }

    tipTarget = target;

    if (tipIsVisible()) {
      showTip(target, "cursor");
    } else {
      tipTimer = window.setTimeout(() => showTip(target, "cursor"), 320);
    }
  });

  // Keyboard focus shows it at once, pinned to the control.
  document.addEventListener("focusin", (event) => {
    const target = event.target.closest?.("[data-tip]");

    if (!target || !target.matches(":focus-visible")) {
      return;
    }

    hideTip();
    tipTarget = target;
    showTip(target, "arrow");
  });

  document.addEventListener("focusout", () => {
    if (tipMode === "arrow") {
      hideTip();
    }
  });
  document.addEventListener("pointerdown", hideTip, true);
  window.addEventListener("scroll", hideTip, true);
  window.addEventListener("blur", hideTip);
}
