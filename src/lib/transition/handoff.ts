export const TX_PARAM = "tx";
export const CV_TARGET = "radyalz.github.io/Cv-Builder";

export interface Handoff {
  seed: number;
  time: number;
}

export const isCvUrl = (u: URL): boolean => (u.host + u.pathname).startsWith(CV_TARGET);

export const encodeHandoff = (h: Handoff): string => `${h.seed >>> 0}.${h.time.toFixed(2)}`;

export function decodeHandoff(raw: string | null): Handoff | null {
  const m = /^(\d{1,10})\.(\d{1,4}(?:\.\d+)?)$/.exec(raw ?? "");
  if (!m) return null;
  const seed = Number(m[1]);
  const time = Number(m[2]);
  return seed <= 0xffffffff && Number.isFinite(time) ? { seed, time } : null;
}
