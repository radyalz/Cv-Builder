import { DEFAULT_LANGUAGE, DEFAULT_THEME, DEFAULT_VARIANT, THEME_BY_SLUG } from "../../../lib/data";
import { normaliseHex } from "../../../lib/colour";
import { t, themeName, uiPrefs } from "../../../lib/prefs";
import { el } from "../dom";
import { selectedHex } from "../selection";
import { app } from "../state";
import { colourRow, editionRow, fact, languageRow, publishedFor, statusOf, type TipHandler } from "./shared";

const edition: TipHandler = (element) => ({
  facts: [colourRow(), languageRow(), statusOf(publishedFor(element.dataset.tip!, app.selection.language))],
});

const cvLanguage: TipHandler = (element) => ({
  facts: [colourRow(), editionRow(), statusOf(publishedFor(app.selection.variant, element.dataset.tip === "cvFa" ? "fa" : "en"))],
});

const swatch: TipHandler = (element) => {
  const slug = element.dataset.slug!;
  const theme = THEME_BY_SLUG.get(slug)!;
  const built = [...app.variants.values()].filter((item) => item.theme === slug).length;
  const count = uiPrefs.lang === "fa" ? `${built.toLocaleString("fa-IR")} از ۴` : `${built} of 4`;
  const facts: [string, string, { mono: boolean; dot: string }?][] = [[fact("hex"), theme.hex, { mono: true, dot: theme.hex }]];

  if (app.variantsLoaded) facts.push([fact("builtCopies"), count]);

  return { title: themeName(slug), facts };
};

const use: TipHandler = () => {
  const hex = normaliseHex(el.customHex.value);

  return { facts: [[fact("hex"), hex || el.customHex.value, { mono: true, dot: hex || undefined }]] };
};

export const CHOICE_TIPS: Record<string, TipHandler> = {
  accent: () => ({ facts: [colourRow(), [fact("hex"), selectedHex(), { mono: true }]] }),
  digital: edition,
  print: edition,
  cvEn: cvLanguage,
  cvFa: cvLanguage,
  swatch,
  use,
  pick: () => ({ facts: [[fact("hex"), el.customColor.value.toUpperCase(), { mono: true, dot: el.customColor.value }]] }),
  resetCv: () => ({
    facts: [
      [fact("colour"), themeName(DEFAULT_THEME), { dot: THEME_BY_SLUG.get(DEFAULT_THEME)!.hex }],
      [fact("edition"), t(DEFAULT_VARIANT)],
      [fact("language"), t(`lang_${DEFAULT_LANGUAGE}`)],
    ],
  }),
};
