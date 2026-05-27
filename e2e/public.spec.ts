import { expect, test } from "@playwright/test";
import { publicNavLabels, publicSections } from "./utils/selectors";

test.describe("landing publica", () => {
  test("carga la landing institucional y muestra acceso a intranet", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText(/terraNova academy/i).first()).toBeVisible();
    await expect(
      page.getByText(/educaci/i).filter({ hasText: /tecnolog/i }).first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: /intranet|acceso portal|iniciar sesi/i })
        .first(),
    ).toBeVisible();
  });

  test("el boton superior navega a login", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("link", { name: /intranet|acceso portal|iniciar sesi/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: /bienvenido/i }),
    ).toBeVisible();
  });

  test("la navegacion por anclas expone las secciones publicas", async ({
    page,
  }) => {
    await page.goto("/");

    for (const [key, label] of Object.entries(publicNavLabels)) {
      await page.getByRole("link", { name: label }).first().click();
      await expect(
        page.locator(publicSections[key as keyof typeof publicSections]),
      ).toBeVisible();
    }
  });

  test("los formularios publicos son visuales y no navegan al enviar", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator(publicSections.admisiones).scrollIntoViewIfNeeded();
    await page.getByPlaceholder(/ej\. carlos/i).fill("Carlos");
    await page.getByPlaceholder(/correo@ejemplo\.com/i).fill("test@example.com");
    await page.getByRole("button", { name: /enviar solicitud/i }).click();
    await expect(page.locator(publicSections.admisiones)).toBeVisible();

    await page.locator(publicSections.contacto).scrollIntoViewIfNeeded();
    await page.getByPlaceholder(/ej\. juan/i).fill("Juan");
    await page
      .getByPlaceholder(/juan\.perez@ejemplo\.com/i)
      .fill("juan@example.com");
    await page.getByRole("button", { name: /enviar mensaje/i }).click();
    await expect(page.locator(publicSections.contacto)).toBeVisible();
  });
});
