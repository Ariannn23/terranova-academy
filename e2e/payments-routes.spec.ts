import { expect, test } from "@playwright/test";
import { e2eAuth, e2eUsers } from "./fixtures/users";
import { login } from "./utils/login";

test.describe("rutas basicas de pagos", () => {
  test("admin puede abrir finanzas y pagos vencidos", async ({ page }) => {
    test.skip(
      !e2eAuth.hasAdmin,
      "Rutas autenticadas de pagos omitidas: requieren credenciales ADMIN contra una base E2E.",
    );

    await login(page, e2eUsers.admin);

    await page.goto("/dashboard/pagos");
    await expect(page).toHaveURL(/\/dashboard\/pagos/);
    await expect(
      page.getByRole("heading", { name: /cobros y pagos/i }),
    ).toBeVisible();

    await page.goto("/dashboard/pagos/vencidos");
    await expect(page).toHaveURL(/\/dashboard\/pagos\/vencidos/);
    await expect(page.getByText(/pagos vencidos/i).first()).toBeVisible();
  });

  test("historial de pagos por matricula requiere dato E2E estable", async () => {
    test.skip(
      true,
      "Pendiente para Sprint 16: requiere matricula seed estable y estrategia de setup/teardown.",
    );
  });
});
