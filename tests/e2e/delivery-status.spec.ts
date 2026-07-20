import { expect, test } from "@playwright/test";

const expectedRelease = process.env.EXPECTED_RELEASE ?? "local";

test("reports the deployed release as operational", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Continuous delivery is operational",
    })
  ).toBeVisible();
  await expect(page.getByTestId("release")).toHaveText(
    expectedRelease.slice(0, 12)
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-release",
    expectedRelease
  );
});
