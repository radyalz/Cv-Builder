export interface FactOptions {
  mono?: boolean;
  dot?: string;
}

export type Fact = [label: string, value: string, options?: FactOptions];

export interface TipContent {
  title: string;
  body?: string;
  facts?: Fact[];
  hint?: { label: string; key: string } | null;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text = ""): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text) node.textContent = text;

  return node;
}

function factRow([label, value, options = {}]: Fact): [HTMLElement, HTMLElement] {
  const detail = element("dd");
  const valueText = element("span", options.mono ? "is-mono" : "", value);

  if (options.dot) {
    const dot = element("span", "tip-dot");

    dot.style.background = options.dot;
    detail.append(dot);
  }

  if (options.mono) {
    valueText.dir = "ltr";
  }

  detail.append(valueText);

  return [element("dt", "", label), detail];
}

export function renderTip(box: HTMLElement, { title, body = "", facts = [], hint = null }: TipContent): void {
  const fragment = document.createDocumentFragment();

  fragment.append(element("span", "tip-title", title));

  if (body) {
    fragment.append(element("p", "tip-body", body));
  }

  if (facts.length) {
    const list = element("dl", "tip-facts");

    facts.forEach((fact) => list.append(...factRow(fact)));
    fragment.append(list);
  }

  if (hint) {
    const line = element("div", "tip-hint");

    line.append(`${hint.label} `, element("span", "tip-kbd", hint.key));
    fragment.append(line);
  }

  box.replaceChildren(fragment);
}
