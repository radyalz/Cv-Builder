const en = {
    file: "File", colour: "Colour", edition: "Edition", language: "Language",
    published: "Published", size: "Size", status: "Status", shortcut: "Shortcut",
    copies: "Copies", latest: "Latest", opens: "Opens", newTab: "In a new tab",
    notYet: "Not built yet", buildTime: "Build time", buildTimeValue: "About half a minute",
    scale: "Scale", style: "Style", page: "Page", fonts: "Font",
    appearance: "Appearance", text: "Text size", hex: "Hex", builtCopies: "Built copies",
};

export type FactKey = keyof typeof en;

const fa: Record<FactKey, string> = {
    file: "فایل", colour: "رنگ", edition: "نسخه", language: "زبان",
    published: "انتشار", size: "حجم", status: "وضعیت", shortcut: "میان‌بر",
    copies: "نسخه‌ها", latest: "آخرین", opens: "باز شدن", newTab: "در زبانه تازه",
    notYet: "هنوز ساخته نشده", buildTime: "زمان ساخت", buildTimeValue: "حدود نیم دقیقه",
    scale: "مقیاس", style: "سبک", page: "صفحه", fonts: "قلم",
    appearance: "ظاهر", text: "اندازه متن", hex: "هگز", builtCopies: "نسخه‌های ساخته‌شده",
};

export const FACTS = { en, fa };
