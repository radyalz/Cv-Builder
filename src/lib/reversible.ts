export interface Reversible {
  open(): void;
  close(isOpen: () => boolean): void;
  cancel(): void;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function reversible(element: HTMLElement, from: Keyframe, duration: number, closeRate = 1.3): Reversible {
  let motion: Animation | null = null;

  const animation = (): Animation => {
    if (!motion) {
      motion = element.animate([from, { opacity: 1, transform: "none" }], { duration, easing: EASE, fill: "both" });
      motion.pause();
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    motion.effect?.updateTiming({ duration: still ? 0 : duration });

    return motion;
  };

  return {
    open() {
      const run = animation();

      if (run.playState !== "running") {
        run.currentTime = 0;
      }

      run.updatePlaybackRate(1);
      run.play();
    },
    close(isOpen) {
      const run = animation();

      run.updatePlaybackRate(-closeRate);
      run.play();
      void run.finished.then(() => {
        if (!isOpen()) {
          element.hidden = true;
        }
      });
    },
    cancel() {
      animation().cancel();
      element.hidden = true;
    },
  };
}
