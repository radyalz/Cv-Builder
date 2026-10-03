import type { StringKey } from "../../lib/data";
import { current, type TaskName } from "../../lib/progress";
import { t, uiPrefs } from "../../lib/prefs";

const KEYS: Record<TaskName, StringKey> = {
  fonts: "splashFonts",
  background: "splashArt",
  viewer: "splashViewer",
  copy: "splashCv",
  render: "splashRender",
};

export function stepText(fraction: number): string {
  const now = current();

  if (!now) return t("splashReady");

  const percent = Math.round(fraction * 100);
  if (uiPrefs.lang === "fa") return `${t(KEYS[now.name])}\u200f · ${percent.toLocaleString("fa-IR")}٪`;

  return `${t(KEYS[now.name])} · ${percent}%`;
}
