import type { IconName } from "./icons";

export type StageMenu = "forms" | "actions" | "a11y" | "wallpaper" | "expanded";

export interface Step {
  target: string;
  title: string | (() => string);
  text: string | (() => string);
  icon?: IconName;
  when?: string;
  menu?: StageMenu;
  admire?: boolean;
  round?: boolean;
  optional?: boolean;
  topic?: boolean;
}

export const matches = (query: string): boolean => window.matchMedia(query).matches;

export const keyOf = (value: string | (() => string)): string => (typeof value === "function" ? value() : value);
