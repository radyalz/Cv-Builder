import type { Fact } from "../../../lib/tooltip";
import { formatPublished } from "../listing";
import { selectedKey } from "../selection";
import { app } from "../state";
import { assetNameFor, base, colourRow, editionRow, escHint, fact, formatSize, languageRow, localNumber, type TipHandler } from "./shared";

const generate: TipHandler = () => {
  const { mode, theme, variant, language } = app.selection;
  const file: Fact[] = mode !== "custom" ? [[fact("file"), assetNameFor(theme, variant, language), { mono: true }]] : [];

  return { facts: [...file, colourRow(), editionRow(), languageRow(), [fact("buildTime"), fact("buildTimeValue")]] };
};

const download: TipHandler = () => {
  const published = app.variants.get(selectedKey());

  if (app.selection.mode === "custom") {
    const [title, body] = base("downloadCustom");

    return { title, body, facts: [colourRow()] };
  }

  if (!published) {
    const [title, body] = base("downloadMissing");

    return { title, body, facts: [colourRow(), editionRow(), languageRow()] };
  }

  return {
    facts: [
      [fact("file"), published.name, { mono: true }],
      colourRow(),
      editionRow(),
      languageRow(),
      [fact("published"), formatPublished(published.updatedAt)],
      [fact("size"), formatSize(published.size)],
    ],
  };
};

const allCopies: TipHandler = () => {
  const facts: Fact[] = [];

  if (app.variantsLoaded) {
    const latest = Math.max(0, ...[...app.variants.values()].map((item) => Date.parse(item.updatedAt) || 0));

    facts.push([fact("copies"), localNumber(app.variants.size)], [fact("latest"), latest ? formatPublished(latest) : "—"]);
  }

  return { facts: [...facts, [fact("opens"), fact("newTab")]] };
};

const expand: TipHandler = () => {
  const published = app.variants.get(selectedKey());
  const date: Fact[] = published ? [[fact("published"), formatPublished(published.updatedAt)]] : [];

  return { facts: [colourRow(), editionRow(), languageRow(), ...date], hint: escHint() };
};

export const ACTION_TIPS: Record<string, TipHandler> = {
  generate,
  download,
  allCopies,
  expand,
  close: () => ({ hint: escHint() }),
};
