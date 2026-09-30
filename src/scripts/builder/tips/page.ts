import { EN_FONTS, FA_FONTS } from "../../../lib/data";
import { t, uiPrefs } from "../../../lib/prefs";
import { fact, type TipHandler } from "./shared";

const index = (): 0 | 1 => (uiPrefs.lang === "fa" ? 1 : 0);

const size: TipHandler = (element) => ({ facts: [[fact("scale"), `${Math.round(Number(element.dataset.fs) * 100)}%`]] });

const font: TipHandler = (element) => {
  const i = index();
  const font = element.dataset.enFont ? EN_FONTS[element.dataset.enFont] : FA_FONTS[element.dataset.faFont!];

  return { title: Array.isArray(font.name) ? font.name[i] : font.name, body: font.note[i], facts: [[fact("style"), font.style[i]]] };
};

export const PAGE_TIPS: Record<string, TipHandler> = {
  admire: () => (document.body.classList.contains("is-admiring") ? { title: t("showCard") } : {}),
  resetPrefs: () => ({
    facts: [
      [fact("page"), t("lang_en")],
      [fact("appearance"), t("system")],
      [fact("text"), "100%"],
      [fact("fonts"), uiPrefs.lang === "fa" ? FA_FONTS.yekan.name[index()] : EN_FONTS.inter.name],
    ],
  }),
  a11y: () => ({
    facts: [
      [fact("page"), t(`lang_${uiPrefs.lang}`)],
      [fact("appearance"), t(uiPrefs.theme)],
      [fact("text"), `${Math.round(uiPrefs.fs * 100)}%`],
      [fact("fonts"), uiPrefs.lang === "fa" ? FA_FONTS[uiPrefs.faFont].name[index()] : EN_FONTS[uiPrefs.enFont].name],
    ],
  }),
  sizeSmall: size,
  sizeDefault: size,
  sizeLarge: size,
  sizeLarger: size,
  font,
};
