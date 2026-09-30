import { API_URL } from "../../../lib/data";
import { t } from "../../../lib/prefs";
import { generatedCopies, generatedKey, saveCopy } from "../copies";
import { loadVariants } from "../listing";
import { refreshPreview } from "../preview/refresh";
import { selectedSlug } from "../selection";
import { app } from "../state";
import { setBuildStatus, showBuilding, showError, showSuccess } from "./status";

interface Build {
  buildId: string;
  theme: string;
  variant: string;
  language: string;
  downloadUrl: string | null;
}

async function startBuild(): Promise<Build> {
  const { mode, color, theme, variant, language } = app.selection;
  const payload = mode === "custom" ? { variant, language, color } : { variant, language, theme };
  const response = await fetch(`${API_URL}/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) throw new Error(result.error || t("errStart"));
  if (!result.buildId) throw new Error(t("errNoId"));

  return {
    buildId: result.buildId,
    theme: result.theme || selectedSlug(),
    variant: result.variant || variant,
    language: result.language || language,
    downloadUrl: result.status === "completed" ? result.downloadUrl : null,
  };
}

async function deliver(downloadUrl: string, message: string): Promise<void> {
  const name = decodeURIComponent(new URL(downloadUrl).pathname.split("/").pop() || "RadmanAlizadeh-Cv.pdf");
  let blob: Blob | null = null;

  setBuildStatus(t("completeTitle"), message);

  try {
    blob = await saveCopy(downloadUrl, name);
  } catch (error) {
    console.error("Download failed:", error);
  }

  if (blob && app.selection.mode === "custom") generatedCopies.set(generatedKey(), { blob, name });

  showSuccess();
  await loadVariants();
  refreshPreview();

  if (!blob) window.location.assign(downloadUrl);
}

async function getBuildStatus({ buildId, theme, variant, language }: Build) {
  const query = Object.entries({ id: buildId, theme, variant, language })
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  const response = await fetch(`${API_URL}/status?${query}`);
  const result = await response.json();

  if (!response.ok) throw new Error(result.error || t("errStatus"));

  return result;
}

async function waitForBuild(build: Build): Promise<void> {
  for (let first = true; ; first = false) {
    await new Promise((resolve) => window.setTimeout(resolve, first ? 9000 : 1500));

    const result = await getBuildStatus(build);

    if (result.status === "completed") {
      if (!result.downloadUrl) throw new Error(t("errNoUrl"));

      return deliver(result.downloadUrl, t("publishedStarting"));
    }

    if (result.status === "failed") throw new Error(t("errFailed"));

    if (result.status === "running") setBuildStatus(t("renderingTitle"), t("renderingText"));
    else setBuildStatus(t("queuedTitle"), t("queuedText"));
  }
}

export async function runBuild(): Promise<void> {
  try {
    showBuilding();

    const build = await startBuild();

    if (build.downloadUrl) {
      await deliver(build.downloadUrl, t("upToDate"));
      return;
    }

    setBuildStatus(t("startedTitle"), t("startedText", { id: build.buildId }));
    await waitForBuild(build);
  } catch (error) {
    console.error("CV Builder error:", error);
    showError(error instanceof Error ? error.message : t("errGeneric"));
  }
}
