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

test("tells Pandi's story through scannable character traits", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Conoceme mejor" }).click();

  await expect(page).toHaveURL(/#historia$/);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Pandi siente todo un poquito más.",
    })
  ).toBeVisible();

  const traits = page.getByRole("list", { name: "Rasgos de Pandi" });
  await expect(traits.getByRole("listitem")).toHaveCount(3);
  await expect(traits).toContainText("Hacer compañía sin decir nada");
  await expect(traits).toContainText("Manta, lluvia y cero notificaciones");
  await expect(traits).toContainText("Los martes y los audios de 8 minutos");
  await expect(page.getByText("Pandi es el primero.")).toBeVisible();
});
