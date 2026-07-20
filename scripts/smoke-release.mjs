const baseUrlValue = process.env.BASE_URL;
const expectedRelease = process.env.EXPECTED_RELEASE;
const attempts = Number.parseInt(process.env.SMOKE_ATTEMPTS ?? "12", 10);
const retryDelayMs = 2_000;

if (!baseUrlValue) {
  throw new Error("BASE_URL is required");
}

if (!expectedRelease || !/^[0-9a-f]{40}$/.test(expectedRelease)) {
  throw new Error("EXPECTED_RELEASE must be a full Git SHA");
}

const baseUrl = new URL(baseUrlValue);

if (!new Set(["http:", "https:"]).has(baseUrl.protocol)) {
  throw new Error("BASE_URL must use HTTP or HTTPS");
}

const wait = (durationMs) =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const verifyRelease = async () => {
  const requestOptions = {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  };
  const [rootResponse, releaseResponse] = await Promise.all([
    fetch(baseUrl, requestOptions),
    fetch(new URL("/release.json", baseUrl), requestOptions),
  ]);

  if (!rootResponse.ok) {
    throw new Error(`Root returned HTTP ${rootResponse.status}`);
  }

  if (!releaseResponse.ok) {
    throw new Error(`Release metadata returned HTTP ${releaseResponse.status}`);
  }

  const metadata = await releaseResponse.json();

  if (metadata.release !== expectedRelease) {
    throw new Error(
      `Expected release ${expectedRelease}, received ${String(metadata.release)}`
    );
  }
};

let lastError;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    await verifyRelease();
    console.log(`Release ${expectedRelease} is healthy at ${baseUrl.href}`);
    process.exit(0);
  } catch (error) {
    lastError = error;

    if (attempt < attempts) {
      console.warn(
        `Smoke attempt ${attempt}/${attempts} failed: ${error.message}`
      );
      await wait(retryDelayMs);
    }
  }
}

throw lastError;
