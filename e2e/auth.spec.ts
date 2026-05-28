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

  test("bloquea temporalmente tras 5 intentos fallidos en usuario dedicado", async ({
    page,
  }) => {
    test.skip(
      !e2eAuth.enabled,
      "Lockout E2E omitido: ejecuta seed:e2e y test:e2e:auth contra una base E2E.",
    );

    await page.goto("/login");

    const loginForm = page.locator("form");

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await page.locator('input[type="email"]').fill(e2eUsers.lockout.email);
      await page.locator('input[type="password"]').fill("WrongPass123!");
      await page.getByRole("button", { name: /iniciar sesi/i }).click();
      await expect(page).toHaveURL(/\/login/);
    }

    await expect(
      loginForm.getByText(/bloqueada temporalmente por seguridad/i),
    ).toBeVisible({ timeout: 15_000 });

    const lockedButton = page.getByRole("button", {
      name: /reintentar en/i,
    });

    await expect(lockedButton).toBeVisible();
    await expect(lockedButton).toBeDisabled();
    await expect(
      loginForm.getByText(/bloqueada temporalmente por seguridad/i),
    ).toBeVisible();

    await page.locator('input[type="email"]').fill(e2eUsers.admin.email);
    await page.locator('input[type="password"]').fill(e2eUsers.admin.password);
    await expect(
      page.getByRole("button", { name: /iniciar sesi/i }),
    ).toBeEnabled();
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
