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

const kb = (bytes: number): string => {
  const value = Math.max(1, Math.round(bytes / 1024));

  return uiPrefs.lang === "fa" ? value.toLocaleString("fa-IR") : String(value);
};

export function stepText(): string {
  const now = current();

  if (!now) return t("splashReady");

  const label = t(KEYS[now.name]);

  return now.loaded && now.total ? `${label} · ${t("splashBytes", { loaded: kb(now.loaded), total: kb(now.total) })}` : label;
}
