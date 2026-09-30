import { t } from "../../lib/prefs";
import { ICONS } from "./icons";
import { currentSteps } from "./steps";

export function renderTopics(container: Element): void {
  const steps = currentSteps();

  container.replaceChildren(
    ...steps
      .filter((step) => step.topic)
      .map((step) => {
        const button = document.createElement("button");
        const label = document.createElement("span");

        button.type = "button";
        button.className = "tour-topic";
        button.dataset.step = String(steps.indexOf(step));
        button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[step.icon!]}</svg>`;
        label.textContent = t(step.title);
        button.append(label);

        return button;
      })
  );
}
