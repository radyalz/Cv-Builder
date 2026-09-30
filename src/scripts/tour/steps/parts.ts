import { matches, type Step } from "../types";

export const LINKS: Step = {
  target: ".preview-foot .links-hint",
  icon: "links",
  title: "tourLinksTitle",
  text: "tourLinksText",
  optional: true,
  topic: true,
};

export const EXPAND: Step = { target: "#previewExpand", icon: "expand", title: "tourExpandTitle", text: "tourExpandText", optional: true };

export const EXPANDED: Step[] = [
  {
    target: ".expanded-info",
    icon: "expand",
    title: "tourReadTitle",
    text: () => (matches("(max-width: 399px)") ? "tourReadNarrow" : "tourReadText"),
    menu: "expanded",
    topic: true,
  },
  { target: ".expanded-actions > .links-hint", title: "tourLinksTitle", text: "tourBarLinksText", menu: "expanded" },
  { target: ".pdf-tools > [data-pdf='fit-width']", title: "fitWidth", text: "tourFitWidthText", menu: "expanded", when: "(min-width: 350px)" },
  { target: ".pdf-tools > [data-pdf='fit-page']", title: "fitPage", text: "tourFitPageText", menu: "expanded", when: "(min-width: 350px)" },
  { target: ".fit-select", title: "pdfTools", text: "tourFitSelectText", menu: "expanded", when: "(max-width: 349px)" },
  {
    target: ".pdf-tools > [data-pdf^='zoom'], #pdfZoom",
    title: "zoom",
    text: () => (matches("(min-width: 1024px)") ? "tourZoomText" : "tourZoomTabletText"),
    menu: "expanded",
    when: "(min-width: 600px)",
  },
  { target: ".zoom-select", title: "zoom", text: "tourZoomPhoneText", menu: "expanded", when: "(max-width: 599px)" },
  { target: "#expandedDownload", title: "downloadShort", text: "tourBarDownloadText", menu: "expanded" },
  { target: "#previewCollapse", title: "close", text: "tourCloseText", menu: "expanded" },
];

export const ACCESSIBILITY: Step[] = [
  { target: "#a11yTrigger", icon: "a11y", title: "tourA11yTitle", text: "tourAccessibilityText", round: true, topic: true },
  { target: "#a11yMenu > .a11y-group:nth-child(2)", title: "tourPageLangTitle", text: "tourPageLangText", menu: "a11y" },
  { target: "#a11yMenu > .a11y-group:nth-child(3)", title: "tourAppearanceTitle", text: "tourAppearanceText", menu: "a11y" },
  { target: "#a11yMenu > .a11y-group:nth-child(4)", title: "tourTextSizeTitle", text: "tourTextSizeText", menu: "a11y" },
  { target: "#a11yMenu [data-font-lang]:not([hidden])", title: "tourFontTitle", text: "tourFontText", menu: "a11y" },
  { target: "#admireFromMenu", icon: "admire", title: "tourAdmireButtonTitle", text: "tourAdmireButtonText", menu: "a11y", topic: true },
  { target: "#admireToggle", title: "tourAdmireTitle", text: "tourAdmireText", admire: true, round: true },
];

export const ACTION_ITEMS: Step[] = [
  { target: '#actionMenu [data-action="generate"]', title: "tourGenerateTitle", text: "tourGenerateText", menu: "actions" },
  { target: '#actionMenu [data-action="download"]', title: "tourDownloadTitle", text: "tourDownloadText", menu: "actions" },
  { target: '#actionMenu [data-action="allCopies"]', title: "tourAllTitle", text: "tourAllText", menu: "actions" },
];
