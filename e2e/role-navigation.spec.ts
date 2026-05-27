import { expect, test } from "@playwright/test";
import { e2eAuth, e2eUsers, type E2EUser } from "./fixtures/users";
import { login } from "./utils/login";

type RoleCase = {
  role: keyof typeof e2eUsers;
  user: E2EUser;
  visible: RegExp[];
  hidden: RegExp[];
  quickVisible: RegExp[];
};

const roleCases: RoleCase[] = [
  {
    role: "recepcion",
    user: e2eUsers.recepcion,
    visible: [/matr/i, /estudiantes/i],
    hidden: [/finanzas/i, /calificaciones/i, /configuraci/i],
    quickVisible: [/nueva matr/i],
  },
  {
    role: "caja",
    user: e2eUsers.caja,
    visible: [/finanzas/i, /reportes/i],
    hidden: [/calificaciones/i, /asistencia/i, /incidencias/i, /configuraci/i],
    quickVisible: [/registrar pago/i, /ver informes/i],
  },
  {
    role: "docente",
    user: e2eUsers.docente,
    visible: [/cursos/i, /horarios/i, /calificaciones/i, /asistencia/i],
    hidden: [/finanzas/i, /matr/i, /configuraci/i],
    quickVisible: [/tomar asistencia/i],
  },
  {
    role: "coordinador",
    user: e2eUsers.coordinador,
    visible: [/incidencias/i, /inhabilitaciones/i, /reportes/i],
    hidden: [/finanzas/i, /configuraci/i],
    quickVisible: [/reportar incidente/i, /ver informes/i],
  },
];

test.describe("navegacion visual por rol", () => {
  for (const item of roleCases) {
    test(`${item.role} ve solo modulos permitidos`, async ({ page }) => {
      test.skip(
        !e2eAuth.enabled,
        `Navegacion ${item.role} omitida: ejecuta seed:e2e y test:e2e:auth contra una base E2E.`,
      );

      await login(page, item.user);

      for (const label of item.visible) {
        await expect(page.getByRole("link", { name: label })).toBeVisible();
      }

      for (const label of item.hidden) {
        await expect(page.getByRole("link", { name: label })).toHaveCount(0);
      }

      for (const label of item.quickVisible) {
        await expect(page.getByRole("link", { name: label })).toBeVisible();
      }
    });
  }

  test("admin ve modulos administrativos y financieros", async ({ page }) => {
    test.skip(
      !e2eAuth.enabled,
      "Login ADMIN omitido: ejecuta seed:e2e y test:e2e:auth contra una base E2E.",
    );

    await login(page, e2eUsers.admin);

    for (const label of [
      /configuraci/i,
      /finanzas/i,
      /matr/i,
      /estudiantes/i,
      /reportes/i,
    ]) {
      await expect(page.getByRole("link", { name: label })).toBeVisible();
    }
  });
});
