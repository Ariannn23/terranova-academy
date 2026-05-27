import { expect, test } from "@playwright/test";
import { e2eAuth, e2eUsers } from "./fixtures/users";
import { login } from "./utils/login";

test.describe("rutas basicas de pagos", () => {
  test("admin puede abrir finanzas y pagos vencidos", async ({ page }) => {
    test.skip(
      !e2eAuth.enabled,
      "Rutas autenticadas de pagos omitidas: ejecuta seed:e2e y test:e2e:auth contra una base E2E.",
    );

    await login(page, e2eUsers.caja);

    await page.goto("/dashboard/pagos");
    await expect(page).toHaveURL(/\/dashboard\/pagos/);
    await expect(
      page.getByRole("heading", { name: /cobros y pagos/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /ver vencidos/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/pagos\/vencidos/);
    await expect(page.getByText(/pagos vencidos/i).first()).toBeVisible();
  });

  test("admin navega al historial de pagos desde una matricula seed", async ({
    page,
  }) => {
    test.skip(
      !e2eAuth.enabled,
      "Historial de pagos omitido: ejecuta seed:e2e y test:e2e:auth contra una base E2E.",
    );

    await login(page, e2eUsers.admin);

    await page.goto("/dashboard/matriculas");
    await expect(page.getByText(/e2e/i).first()).toBeVisible();
    await page.getByTitle(/ver detalle/i).first().click();

    await expect(page).toHaveURL(/\/dashboard\/matriculas\/.+/);
    await page.getByRole("link", { name: /historial de pagos/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/pagos\/.+/);
    await expect(page.getByText(/cronograma|historial|pagos/i).first()).toBeVisible();
  });
});
