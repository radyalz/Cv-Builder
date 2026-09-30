import { t, uiPrefs } from "../../lib/prefs";
import { outputSize } from "./files";

export interface WallpaperUi {
  button: HTMLElement;
  menu: HTMLElement;
  imageButton: HTMLButtonElement;
  videoButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  lengths: HTMLElement;
  sizeLabel: HTMLElement;
  choices: HTMLElement;
  recording: HTMLElement;
  bar: HTMLElement;
  status: HTMLElement;
}

export const number = (n: number): string => (uiPrefs.lang === "fa" ? n.toLocaleString("fa-IR") : String(n));

export function findUi(button: HTMLElement, menu: HTMLElement): WallpaperUi {
  const $ = <T extends HTMLElement>(selector: string) => menu.querySelector<T>(selector)!;

  return {
    button,
    menu,
    imageButton: $("#wallpaperImage"),
    videoButton: $("#wallpaperVideo"),
    cancelButton: $("#wallpaperCancel"),
    lengths: $("#wallpaperLength"),
    sizeLabel: $(".wallpaper-size"),
    choices: $(".wallpaper-video"),
    recording: $(".wallpaper-recording"),
    bar: $(".wallpaper-bar span"),
    status: $(".wallpaper-status"),
  };
}

export function refresh(ui: WallpaperUi, canRecord: boolean, recording: boolean): void {
  const { width, height } = outputSize();
  const unsupported = !canRecord && !recording;

  ui.sizeLabel.textContent = `${number(width)} × ${number(height)} PNG`;
  ui.videoButton.disabled = !canRecord || recording;
  ui.choices.hidden = recording;
  ui.recording.hidden = !recording && !unsupported;
  ui.recording.querySelector<HTMLElement>(".wallpaper-bar")!.hidden = unsupported;
  ui.cancelButton.hidden = unsupported;

  if (unsupported) {
    ui.status.textContent = t("noVideo");
  }
}

export function selectedSeconds(ui: WallpaperUi): number {
  return Number(ui.lengths.querySelector<HTMLElement>('[aria-checked="true"]')?.dataset.seconds || 15);
}

export function pickLength(ui: WallpaperUi, target: Element): void {
  const segment = target.closest("#wallpaperLength .segment");

  if (segment) {
    ui.lengths.querySelectorAll(".segment").forEach((option) => option.setAttribute("aria-checked", String(option === segment)));
  }
}

export function showProgress(ui: WallpaperUi, fraction: number, secondsLeft: number): void {
  ui.bar.style.transform = `scaleX(${fraction})`;
  ui.button.style.setProperty("--progress", String(fraction));
  ui.status.textContent = t("recordingLeft", { n: number(secondsLeft) });
}
