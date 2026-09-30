export interface Theme {
  slug: string;
  label: string;
  hex: string;
  swatch?: string;
}

export const THEMES: Theme[] = [
  { slug: "purple", label: "Purple", hex: "#7030A0" },
  { slug: "violet", label: "Violet", hex: "#6D28D9" },
  { slug: "indigo", label: "Indigo", hex: "#4338CA" },
  { slug: "blue", label: "Blue", hex: "#1D4ED8" },
  { slug: "sky", label: "Sky", hex: "#0284C7" },
  { slug: "teal", label: "Teal", hex: "#0F766E" },
  { slug: "emerald", label: "Emerald", hex: "#047857" },
  { slug: "green", label: "Green", hex: "#15803D" },
  { slug: "olive", label: "Olive", hex: "#4D7C0F" },
  { slug: "amber", label: "Amber", hex: "#B45309" },
  { slug: "orange", label: "Orange", hex: "#C2410C" },
  { slug: "red", label: "Red", hex: "#B91C1C" },
  { slug: "rose", label: "Rose", hex: "#BE123C" },
  { slug: "burgundy", label: "Burgundy", hex: "#8C1C3D" },
  { slug: "brown", label: "Brown", hex: "#7C4A21" },
  { slug: "slate", label: "Slate", hex: "#334155" },
  { slug: "graphite", label: "Graphite", hex: "#463C64" },
  {
    slug: "mono",
    label: "Black & White",
    hex: "#1A1A1A",
    swatch: "linear-gradient(135deg, #1a1a1a 0 50%, #e9e9e9 50% 100%)",
  },
];

export const THEME_BY_SLUG = new Map(THEMES.map((theme) => [theme.slug, theme]));

export const FA_COLOURS: Record<string, string> = {
  purple: "بنفش",
  violet: "بنفشه‌ای",
  indigo: "نیلی",
  blue: "آبی",
  sky: "آبی آسمانی",
  teal: "سبزآبی",
  emerald: "زمردی",
  green: "سبز",
  olive: "زیتونی",
  amber: "کهربایی",
  orange: "نارنجی",
  red: "قرمز",
  rose: "گلبهی",
  burgundy: "زرشکی",
  brown: "قهوه‌ای",
  slate: "سنگی",
  graphite: "گرافیتی",
  mono: "سیاه و سفید",
};
