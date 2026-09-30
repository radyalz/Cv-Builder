import type { TipContent } from "../../../lib/tooltip";
import { ACTION_TIPS } from "./actions";
import { CHOICE_TIPS } from "./choices";
import { PAGE_TIPS } from "./page";
import { base, type TipHandler } from "./shared";

const HANDLERS: Record<string, TipHandler> = { ...ACTION_TIPS, ...CHOICE_TIPS, ...PAGE_TIPS };

export function tipContent(element: HTMLElement): TipContent {
  const key = element.dataset.tip!;
  const [title, body] = base(key);
  const parts = HANDLERS[key]?.(element) ?? {};

  return {
    title: parts.title ?? title,
    body: parts.body ?? body,
    facts: (parts.facts ?? []).filter((row) => row[1]),
    hint: parts.hint ?? null,
  };
}
