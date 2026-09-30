import { DEFAULT_LANGUAGE, DEFAULT_THEME, DEFAULT_VARIANT } from "../../lib/data";
import type { PdfView } from "../../lib/pdf-view";

export interface Selection {
  mode: "theme" | "custom";
  theme: string;
  color: string;
  variant: string;
  language: string;
}

export interface Published {
  theme: string;
  variant: string;
  language: string;
  name: string;
  size?: number;
  updatedAt: string;
  downloadUrl: string;
}

export const DEFAULT_SELECTION: Selection = {
  mode: "theme",
  theme: DEFAULT_THEME,
  color: "#7030A0",
  variant: DEFAULT_VARIANT,
  language: DEFAULT_LANGUAGE,
};

export const app = {
  selection: { ...DEFAULT_SELECTION },
  variants: new Map<string, Published>(),
  variantsLoaded: false,
  pdfView: null as unknown as PdfView,
  linkCount: 0,
  flashedUrl: "",
};
