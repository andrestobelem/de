import { defineConfig, devices } from "@playwright/test";

const remoteBaseUrl = process.env.BASE_URL;
const trustedOidcToken = process.env.VERCEL_TRUSTED_OIDC_TOKEN;
const localBaseUrl = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: remoteBaseUrl ?? localBaseUrl,
    trace: trustedOidcToken ? "off" : "on-first-retry",
    ...(trustedOidcToken
      ? {
          extraHTTPHeaders: {
            "x-vercel-trusted-oidc-idp-token": trustedOidcToken,
          },
        }
      : {}),
  },
  ...(remoteBaseUrl
    ? {}
    : {
        webServer: {
          command:
            process.env.WEB_SERVER_COMMAND ??
            "pnpm preview --host 127.0.0.1 --port 4173",
          url: localBaseUrl,
          reuseExistingServer: !process.env.CI,
        },
      }),
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
