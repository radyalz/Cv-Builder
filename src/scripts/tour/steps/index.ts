import { PEEK } from "../../../lib/layout";
import { onScreen } from "../dom";
import { matches, type Step } from "../types";
import { ACCESSIBILITY } from "./a11y";
import { ACTION_ITEMS, EXPAND, EXPANDED, LINKS } from "./parts";

const DESKTOP_STEPS: Step[] = [
  { target: "#colourTrigger", icon: "accent", title: "tourAccentTitle", text: "tourAccentText", topic: true },
  { target: "#variantToggle", icon: "edition", title: "tourEditionTitle", text: "tourEditionText", topic: true },
  { target: "#languageToggle", icon: "language", title: "tourLanguageTitle", text: "tourLanguageText", topic: true },
  { target: "#resetCv", icon: "reset", title: "tourResetTitle", text: "tourResetText", topic: true },
  { target: "#generateButton", icon: "generate", title: "tourGenerateTitle", text: "tourGenerateText", topic: true },
  { target: "#downloadLatest", icon: "download", title: "tourDownloadTitle", text: "tourDownloadText", topic: true },
  { target: ".actions .secondary-link", icon: "all", title: "tourAllTitle", text: "tourAllText", topic: true },
  { target: ".preview-frame", icon: "preview", title: "tourPreviewTitle", text: "tourPreviewDesktop", topic: true },
  LINKS,
  EXPAND,
  ...EXPANDED,
  ...ACCESSIBILITY,
];

const COMPACT_STEPS: Step[] = [
  { target: "#formsTrigger", icon: "options", title: "tourOptionsTitle", text: "tourOptionsInside", topic: true },
  { target: "#colourTrigger", title: "tourAccentTitle", text: "tourAccentText", menu: "forms" },
  { target: "#variantToggle", title: "tourEditionTitle", text: "tourEditionText", menu: "forms" },
  { target: "#languageToggle", title: "tourLanguageTitle", text: "tourLanguageText", menu: "forms" },
  { target: "#resetCvTop", title: "tourResetTitle", text: "tourResetText", menu: "forms", round: true },
  { target: ".split-main", icon: "generate", title: "tourMainTitle", text: "tourMainText", topic: true },
  { target: "#actionMenu", icon: "choose", title: "tourActionsTitle", text: "tourActionsText", menu: "actions", topic: true },
  ...ACTION_ITEMS,
  {
    target: ".preview-frame",
    icon: "preview",
    title: "tourPreviewTitle",
    text: () => (matches(PEEK) ? "tourPreviewPhone" : "tourPreviewTablet"),
    topic: true,
  },
  LINKS,
  EXPAND,
  ...EXPANDED,
  ...ACCESSIBILITY,
];

const present = (step: Step): boolean =>
  step.menu ? Boolean(document.querySelector(step.target)) : onScreen(document.querySelector(step.target));

export function currentSteps(): Step[] {
  const steps = matches("(max-width: 1023px)") ? COMPACT_STEPS : DESKTOP_STEPS;

  return steps.filter(
    (step) => (!step.when || matches(step.when)) && (!step.optional || present(step))
  );
}
