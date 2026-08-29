const button = document.getElementById("generateButton");
const status = document.getElementById("status");

const API_URL =
  "https://cv-builder-api.radman-alizadeh2249.workers.dev";

button.addEventListener("click", async () => {
  try {
    button.disabled = true;

    status.textContent =
      "Generating your latest CV. This may take approximately 3–5 minutes...";

    const response = await fetch(`${API_URL}/build`, {
      method: "POST",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to start CV generation.");
    }

    await waitForBuild(result.buildId);
    } catch (error) {
    console.error("CV Builder error:", error);

    status.textContent =
        `CV generation failed: ${error.message}`;

    button.disabled = false;
    }
});

async function waitForBuild(buildId) {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response = await fetch(
      `${API_URL}/status?id=${encodeURIComponent(buildId)}`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Unable to check CV generation status."
      );
    }

    if (result.status === "completed") {
      status.textContent =
        "Latest CV generated successfully. Downloading...";

      window.location.href = result.downloadUrl;

      button.disabled = false;
      return;
    }

    if (result.status === "failed") {
      throw new Error("CV generation failed.");
    }

    if (result.status === "running") {
      status.textContent =
        "Building the latest CV... This may take approximately 3–5 minutes.";
    } else {
      status.textContent =
        "Waiting for the CV build to start...";
    }
  }
}