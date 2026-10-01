import { t } from "../../lib/prefs";
import type { HowTo } from "./env";

const ICONS = {
  Ios: [
    '<path d="M12 3.5v11M8 7.5l4-4 4 4"/><path d="M8 10.5H6.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H16"/>',
    '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8.5v7M8.5 12h7"/>',
    '<path d="M5 12.5l4.5 4.5L19 7"/>',
  ],
  menu: ['<circle cx="12" cy="5.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="18.5" r="1.4"/>'],
  install: ['<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 7v7M9 11.5l3 3 3-3"/>'],
  done: ['<path d="M5 12.5l4.5 4.5L19 7"/>'],
};

const iconsFor = (how: HowTo): string[] =>
  how === "Ios" ? ICONS.Ios : [...ICONS.menu, ...ICONS.install, ...ICONS.done];

function stepItem(how: HowTo, index: number, icon: string): HTMLLIElement {
  const item = document.createElement("li");
  const text = document.createElement("span");

  item.className = "install-dialog-step";
  item.innerHTML = `<span class="install-step-mark" aria-hidden="true"><svg viewBox="0 0 24 24">${icon}</svg></span>`;
  text.className = "install-step-text";
  text.dataset.i18n = `install${how}${index + 1}`;
  text.textContent = t(text.dataset.i18n);
  item.append(text);

  return item;
}

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function installDialog(): (how: HowTo) => void {
  const dialog = document.getElementById("installDialog") as HTMLDialogElement;
  const list = dialog.querySelector(".install-dialog-steps")!;

  const close = () => {
    if (!dialog.open) return;
    if (still()) return dialog.close();

    void dialog
      .animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(12px) scale(0.97)" }], { duration: 180, easing: "ease-in" })
      .finished.then(() => dialog.close());
  };

  dialog.querySelector(".install-dialog-close")!.addEventListener("click", close);
  dialog.querySelector(".install-dialog-done")!.addEventListener("click", close);
  dialog.addEventListener("click", (event) => event.target === dialog && close());
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  return (how) => {
    list.replaceChildren(...iconsFor(how).map((icon, index) => stepItem(how, index, icon)));
    dialog.showModal();

    if (!still()) {
      dialog.animate([{ opacity: 0, transform: "translateY(16px) scale(0.96)" }, { opacity: 1, transform: "none" }], {
        duration: 280,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
  };
}
