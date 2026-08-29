const button = document.getElementById("generateButton");
const status = document.getElementById("status");

const API_URL = "https://YOUR-WORKER.workers.dev";

button.addEventListener("click", async () => {
    try {
        button.disabled = true;

        status.textContent = "Generating latest CV...";

        const buildResponse = await fetch(`${API_URL}/build`, {
            method: "POST"
        });

        if (!buildResponse.ok) {
            throw new Error("Unable to start CV generation.");
        }

        const { buildId } = await buildResponse.json();

        await waitForBuild(buildId);

    } catch (error) {

        console.error(error);

        status.textContent =
            "CV generation failed. Please try again.";

        button.disabled = false;
    }
});


async function waitForBuild(buildId) {

    while (true) {

        await new Promise(resolve =>
            setTimeout(resolve, 3000)
        );

        const response = await fetch(
            `${API_URL}/status?id=${encodeURIComponent(buildId)}`
        );

        if (!response.ok) {
            throw new Error("Unable to check build status.");
        }

        const result = await response.json();

        if (result.status === "completed") {

            status.textContent = "CV ready. Downloading...";

            window.location.href = result.downloadUrl;

            button.disabled = false;

            return;
        }

        if (result.status === "failed") {

            throw new Error("CV build failed.");
        }

        status.textContent = "Generating latest CV...";
    }
}