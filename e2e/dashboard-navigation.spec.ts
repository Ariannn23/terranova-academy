import { expect, test } from "@playwright/test";
import { e2eUsers } from "./fixtures/users";
import { login } from "./utils/login";

test.describe("bloqueo RBAC en rutas privadas", () => {
  test("docente no accede manualmente a pagos", async ({ page }) => {
    const user = e2eUsers.docente;
    test.skip(
      !user,
      "No hay credenciales E2E para DOCENTE; caso pendiente hasta tener seed por rol.",
    );
    if (!user) return;

    await login(page, user);
    await page.goto("/dashboard/pagos");
    await expect(page).not.toHaveURL(/\/dashboard\/pagos$/);
  });

  test("caja no accede manualmente a notas", async ({ page }) => {
    const user = e2eUsers.caja;
    test.skip(
      !user,
      "No hay credenciales E2E para CAJA; caso pendiente hasta tener seed por rol.",
    );
    if (!user) return;

    await login(page, user);
    await page.goto("/dashboard/notas");
    await expect(page).not.toHaveURL(/\/dashboard\/notas$/);
  });

  test("recepcion no accede manualmente a configuracion", async ({ page }) => {
    const user = e2eUsers.recepcion;
    test.skip(
      !user,
      "No hay credenciales E2E para RECEPCION; caso pendiente hasta tener seed por rol.",
    );
    if (!user) return;

    await login(page, user);
    await page.goto("/dashboard/configuracion");
    await expect(page).not.toHaveURL(/\/dashboard\/configuracion$/);
  });
});
