import { expect, test } from "@playwright/test";
import { e2eAuth, e2eUsers } from "./fixtures/users";
import { login } from "./utils/login";

test.describe("bloqueo RBAC en rutas privadas", () => {
  test("docente no accede manualmente a pagos", async ({ page }) => {
    test.skip(
      !e2eAuth.enabled,
      "RBAC autenticado omitido: ejecuta seed:e2e y test:e2e:auth contra una base E2E.",
    );

    await login(page, e2eUsers.docente);
    await page.goto("/dashboard/pagos");
    await expect(page).not.toHaveURL(/\/dashboard\/pagos$/);
  });

  test("caja no accede manualmente a notas", async ({ page }) => {
    test.skip(
      !e2eAuth.enabled,
      "RBAC autenticado omitido: ejecuta seed:e2e y test:e2e:auth contra una base E2E.",
    );

    await login(page, e2eUsers.caja);
    await page.goto("/dashboard/notas");
    await expect(page).not.toHaveURL(/\/dashboard\/notas$/);
  });

  test("recepcion no accede manualmente a configuracion", async ({ page }) => {
    test.skip(
      !e2eAuth.enabled,
      "RBAC autenticado omitido: ejecuta seed:e2e y test:e2e:auth contra una base E2E.",
    );

    await login(page, e2eUsers.recepcion);
    await page.goto("/dashboard/configuracion");
    await expect(page).not.toHaveURL(/\/dashboard\/configuracion$/);
  });
});
