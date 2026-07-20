import { expect, test } from "@playwright/test";

const expectedRelease = process.env.EXPECTED_RELEASE ?? "local";

test("reports the deployed release identity", async ({ page }) => {
  const releaseResponse = await page.request.get("/release.json");

  expect(releaseResponse.ok()).toBe(true);
  await expect(releaseResponse.json()).resolves.toEqual({
    release: expectedRelease,
  });

  await page.goto("/");

  await expect(page.getByTestId("release")).toHaveText(
    expectedRelease.slice(0, 12)
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-release",
    expectedRelease
  );
});

test("introduces Pandi through an editorial hero", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).toHaveTitle("Pandi · Pobres Pandas");
  await expect(
    page.getByRole("heading", { level: 1, name: "Hola, soy Pandi." })
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Ilustración de Pandi" })
  ).toBeVisible();
});
