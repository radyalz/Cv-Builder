type Pair = [en: string, fa: string];

export interface EnFont {
  name: string;
  note: Pair;
  style: Pair;
}

export interface FaFont {
  name: Pair;
  note: Pair;
  style: Pair;
}

export const EN_FONTS: Record<string, EnFont> = {
  inter: { name: "Inter", note: ["Neutral and very legible; the original look of this page.", "خنثی و بسیار خوانا؛ ظاهر اصلی این صفحه."], style: ["Grotesque sans", "بی‌میانه گروتسک"] },
  manrope: { name: "Manrope", note: ["Geometric, with softer and rounder curves.", "هندسی، با انحناهای نرم‌تر و گردتر."], style: ["Geometric sans", "بی‌میانه هندسی"] },
  jakarta: { name: "Plus Jakarta Sans", note: ["Modern and slightly condensed, with a friendly tone.", "مدرن و کمی فشرده، با حسی دوستانه."], style: ["Geometric sans", "بی‌میانه هندسی"] },
  plex: { name: "IBM Plex Sans", note: ["Engineered and a little technical.", "مهندسی‌شده و کمی فنی."], style: ["Neo-grotesque", "نئوگروتسک"] },
  grotesk: { name: "Space Grotesk", note: ["A quirky display grotesque with character.", "گروتسکی نمایشی و پرشخصیت."], style: ["Display grotesque", "گروتسک نمایشی"] },
};

export const FA_FONTS: Record<string, FaFont> = {
  yekan: { name: ["Yekan Bakh", "یکان بخ"], note: ["A clean, modern Persian sans; the default.", "بی‌میانه‌ای مدرن و تمیز؛ پیش‌فرض."], style: ["Sans", "بی‌میانه"] },
  vazir: { name: ["Vazirmatn", "وزیرمتن"], note: ["Open and very readable Persian sans.", "بی‌میانه‌ای باز و بسیار خوانا."], style: ["Sans", "بی‌میانه"] },
  doran: { name: ["Doran", "دوران"], note: ["A rounded, friendly Persian sans with open forms.", "بی‌میانه‌ای گرد و صمیمی با فرم‌های باز."], style: ["Sans", "بی‌میانه"] },
  niloofar: { name: ["XB Niloofar", "نیلوفر"], note: ["A classic naskh with book-like contrast.", "نسخی کلاسیک با کنتراست کتابی."], style: ["Naskh", "نسخ"] },
};
