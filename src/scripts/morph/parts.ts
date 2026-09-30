export interface Part {
  selector: string;
  from?: string;
  pill?: boolean;
  fade?: boolean;
  bar?: boolean;
}

export const PARTS: Part[] = [
  { selector: ".card-top" },
  { selector: "#page-title" },
  { selector: ".lead" },
  { selector: "#cvControls > .control", from: ".forms-entry" },
  { selector: ".forms-entry", from: "#cvControls" },
  { selector: ".actions > :not(.actions-break)", from: ".action-split" },
  { selector: ".action-split", from: ".actions" },
  { selector: ".card-preview" },
  { selector: ".expanded-info", pill: true, fade: true, bar: true },
  { selector: ".expanded-actions", pill: true, bar: true },
  { selector: ".expanded-actions > .links-hint, .expanded-actions > .bar-button, .pdf-tools-rule", bar: true },
  { selector: ".pdf-tools > [data-pdf^='fit']", from: ".fit-select", bar: true },
  { selector: ".fit-select", from: ".pdf-tools > [data-pdf^='fit']", bar: true },
  { selector: ".pdf-tools > [data-pdf^='zoom'], #pdfZoom", from: ".zoom-select", bar: true },
  { selector: ".zoom-select", from: ".pdf-tools > [data-pdf^='zoom'], #pdfZoom", bar: true },
];

export const ORIGINS = ["#cvControls", ".actions"];

export interface PartElement {
  element: HTMLElement;
  part: Part;
}

export function partElements(): PartElement[] {
  return PARTS.flatMap((part) =>
    [...document.querySelectorAll<HTMLElement>(part.selector)].map((element) => ({ element, part }))
  );
}
