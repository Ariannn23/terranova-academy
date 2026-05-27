import { expect, test } from "@playwright/test";
import { e2eAuth, e2eUsers } from "./fixtures/users";
import { login, loginExpectingFailure } from "./utils/login";

test.describe("autenticacion y proteccion", () => {
  test("usuario sin sesion es redirigido desde dashboard a login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("usuario sin sesion es redirigido desde pagos a login", async ({
    page,
  }) => {
    await page.goto("/dashboard/pagos");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login invalido permanece en login", async ({ page }) => {
    await loginExpectingFailure(page, {
      email: "correo-invalido",
      password: "123",
    });
  });

  test("login admin seed entra al dashboard si la base de prueba esta sembrada", async ({
    page,
  }) => {
    test.skip(
      !e2eAuth.enabled,
      "Login autenticado omitido: ejecuta seed:e2e y test:e2e:auth contra una base E2E.",
    );

    await login(page, e2eUsers.admin);
    await expect(page.getByText(/terraNova academy/i).first()).toBeVisible();
  });
});
