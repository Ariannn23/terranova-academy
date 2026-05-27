import { expect, type Page } from "@playwright/test";
import type { E2EUser } from "../fixtures/users";

export async function login(page: Page, user: E2EUser) {
  await page.goto("/login");

  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.getByRole("button", { name: /iniciar sesi/i }).click();

  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

export async function loginExpectingFailure(page: Page, user: E2EUser) {
  await page.goto("/login");

  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.getByRole("button", { name: /iniciar sesi/i }).click();

  await expect(page).toHaveURL(/\/login/);
}
