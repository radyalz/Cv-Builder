const API_URL = "https://cv-api.radyalz.ir";

const button = document.getElementById("generateButton");
const buildPanel = document.getElementById("buildPanel");
const successPanel = document.getElementById("successPanel");
const errorPanel = document.getElementById("errorPanel");

const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");
const errorText = document.getElementById("errorText");
const elapsedTime = document.getElementById("elapsedTime");

let elapsedTimer = null;
let buildStartedAt = null;

function setBuildStatus(title, message) {
  statusTitle.textContent = title;
  statusText.textContent = message;
}

function formatElapsed(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function startElapsedTimer() {
  buildStartedAt = Date.now();
  elapsedTime.textContent = "Elapsed: 0:00";

  elapsedTimer = window.setInterval(() => {
    elapsedTime.textContent =
      `Elapsed: ${formatElapsed(Date.now() - buildStartedAt)}`;
  }, 1000);
}

function stopElapsedTimer() {
  if (elapsedTimer !== null) {
    window.clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

function showBuilding() {
  errorPanel.hidden = true;
  successPanel.hidden = true;
  buildPanel.hidden = false;

  button.disabled = true;
  button.querySelector(".button-label").textContent = "Building CV…";

  setBuildStatus(
    "Requesting a fresh build…",
    "Connecting to the CV build service."
  );

  startElapsedTimer();
}

function showSuccess() {
  stopElapsedTimer();

  buildPanel.hidden = true;
  errorPanel.hidden = true;
  successPanel.hidden = false;

  button.disabled = false;
  button.querySelector(".button-label").textContent = "Generate Again";
}

function showError(message) {
  stopElapsedTimer();

  buildPanel.hidden = true;
  successPanel.hidden = true;
  errorPanel.hidden = false;

  errorText.textContent = message;

  button.disabled = false;
  button.querySelector(".button-label").textContent = "Try Again";
}

async function startBuild() {
  const response = await fetch(`${API_URL}/build`, {
    method: "POST",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Unable to start CV generation."
    );
  }

  if (!result.buildId) {
    throw new Error("The build service did not return a build ID.");
  }

  return result.buildId;
}

async function getBuildStatus(buildId) {
  const response = await fetch(
    `${API_URL}/status?id=${encodeURIComponent(buildId)}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Unable to check CV generation status."
    );
  }

  return result;
}

async function waitForBuild(buildId) {
  while (true) {
    await new Promise((resolve) => window.setTimeout(resolve, 5000));

    const result = await getBuildStatus(buildId);

    if (result.status === "completed") {
      if (!result.downloadUrl) {
        throw new Error("The build completed without a download URL.");
      }

      setBuildStatus(
        "Build complete",
        "The newest CV has been published. Starting your download…"
      );

      await new Promise((resolve) => window.setTimeout(resolve, 650));

      showSuccess();

      window.location.assign(result.downloadUrl);
      return;
    }

    if (result.status === "failed") {
      throw new Error("The CV build failed.");
    }

    if (result.status === "running") {
      setBuildStatus(
        "Rendering the latest CV…",
        "Compiling the document and recalculating current experience durations."
      );
      continue;
    }

    setBuildStatus(
      "Build queued…",
      "The request was accepted and is waiting for a runner."
    );
  }
}

button.addEventListener("click", async () => {
  try {
    showBuilding();

    const buildId = await startBuild();

    setBuildStatus(
      "Build started",
      `Build #${buildId} is running. You can keep this tab open.`
    );

    await waitForBuild(buildId);
  } catch (error) {
    console.error("CV Builder error:", error);

    showError(
      error instanceof Error
        ? error.message
        : "CV generation failed. Please try again."
    );
  }
});
