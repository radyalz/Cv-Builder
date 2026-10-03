import { uiPrefs } from "../../lib/prefs";
import { whenReady } from "../splash/ready";

const FAMILIES = {
  en: { inter: "CV Inter", manrope: "CV Manrope", jakarta: "CV Jakarta", plex: "CV Plex", grotesk: "CV Grotesk" },
  fa: { yekan: "CV Yekan Bakh", vazir: "CV Vazir", doran: "CV Doran", niloofar: "CV Niloofar" },
};

const SAMPLE = { en: "Aa", fa: "اب" };
const WEIGHTS = [400, 700];

type Connection = { saveData?: boolean; effectiveType?: string };

function frugal(): boolean {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;

  return Boolean(connection?.saveData || /2g/.test(connection?.effectiveType ?? ""));
}

function idle(run: () => void): void {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 4000 });
  else globalThis.setTimeout(run, 1500);
}

function warm(): void {
  const lang = uiPrefs.lang;
  const chosen = lang === "fa" ? uiPrefs.faFont : uiPrefs.enFont;
  const families = Object.entries(FAMILIES[lang]).filter(([slug]) => slug !== chosen);

  for (const [, family] of families) {
    for (const weight of WEIGHTS) {
      void document.fonts.load(`${weight} 16px "${family}"`, SAMPLE[lang]).catch(() => undefined);
    }
  }
}

export function warmFonts(): void {
  if (frugal()) return;

  whenReady(() => {
    const run = () => idle(warm);

    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
  });
}
