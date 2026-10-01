import type { Step } from "../types";

const installed = (): boolean => !document.getElementById("uninstallApp")?.hidden;

export const ACCESSIBILITY: Step[] = [
  { target: "#a11yTrigger", icon: "a11y", title: "tourA11yTitle", text: "tourAccessibilityText", round: true, topic: true },
  { target: "#a11yMenu > .a11y-group:nth-child(2)", title: "tourPageLangTitle", text: "tourPageLangText", menu: "a11y" },
  { target: "#a11yMenu > .a11y-group:nth-child(3)", title: "tourAppearanceTitle", text: "tourAppearanceText", menu: "a11y" },
  { target: "#a11yMenu > .a11y-group:nth-child(4)", title: "tourTextSizeTitle", text: "tourTextSizeText", menu: "a11y" },
  { target: "#a11yMenu [data-font-lang]:not([hidden])", title: "tourFontTitle", text: "tourFontText", menu: "a11y" },
  {
    target: "#installApp:not([hidden]), #uninstallApp:not([hidden])",
    icon: "install",
    title: () => (installed() ? "uninstallApp" : "tourInstallTitle"),
    text: () => (installed() ? "tourUninstallText" : "tourInstallText"),
    menu: "a11y",
    optional: true,
    topic: true,
  },
  { target: "#admireFromMenu", icon: "admire", title: "tourAdmireButtonTitle", text: "tourAdmireButtonText", menu: "a11y", topic: true },
  { target: "#admireToggle", title: "tourAdmireTitle", text: "tourAdmireText", admire: true, round: true },
  { target: "#wallpaperToggle", icon: "wallpaper", title: "saveBackground", text: "tourWallpaperText", admire: true, round: true, topic: true },
  { target: "#wallpaperImage", title: "tourWallpaperImageTitle", text: "tourWallpaperImageText", admire: true, menu: "wallpaper" },
  { target: ".wallpaper-video", title: "tourWallpaperVideoTitle", text: "tourWallpaperVideoText", admire: true, menu: "wallpaper", optional: true },
];
