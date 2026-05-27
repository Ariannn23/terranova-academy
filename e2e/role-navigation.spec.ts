import { expect, test } from "@playwright/test";
import { e2eAuth, e2eUsers, type E2EUser } from "./fixtures/users";
import { login } from "./utils/login";

type RoleCase = {
  role: keyof typeof e2eUsers;
  user: E2EUser | null;
  visible: RegExp[];
  hidden: RegExp[];
};

const roleCases: RoleCase[] = [
  {
    role: "recepcion",
    user: e2eUsers.recepcion,
    visible: [/matr/i, /estudiantes/i],
    hidden: [/finanzas/i, /calificaciones/i, /configuraci/i],
  },
  {
    role: "caja",
    user: e2eUsers.caja,
    visible: [/finanzas/i, /reportes/i],
    hidden: [/calificaciones/i, /asistencia/i, /incidencias/i, /configuraci/i],
  },
  {
    role: "docente",
    user: e2eUsers.docente,
    visible: [/cursos/i, /horarios/i, /calificaciones/i, /asistencia/i],
    hidden: [/finanzas/i, /matr/i, /configuraci/i],
  },
  {
    role: "coordinador",
    user: e2eUsers.coordinador,
    visible: [/incidencias/i, /inhabilitaciones/i, /reportes/i],
    hidden: [/finanzas/i, /configuraci/i],
  },
];

test.describe("navegacion visual por rol", () => {
  for (const item of roleCases) {
    test(`${item.role} ve solo modulos permitidos`, async ({ page }) => {
      const user = item.user;
      test.skip(
        !user,
        `No hay credenciales E2E configuradas para ${item.role}. Define E2E_${item.role.toUpperCase()}_EMAIL y E2E_${item.role.toUpperCase()}_PASSWORD.`,
      );
      if (!user) return;

      await login(page, user);

      for (const label of item.visible) {
        await expect(page.getByRole("link", { name: label })).toBeVisible();
      }

      for (const label of item.hidden) {
        await expect(page.getByRole("link", { name: label })).toHaveCount(0);
      }
    });
  }

  test("admin ve modulos administrativos y financieros", async ({ page }) => {
    test.skip(
      !e2eAuth.hasAdmin,
      "Login ADMIN omitido: define E2E_RUN_AUTHENTICATED=1 o credenciales E2E_ADMIN_* contra una base E2E.",
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
