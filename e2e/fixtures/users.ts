export type E2EUser = {
  email: string;
  password: string;
};

const defaultPassword = process.env.E2E_DEFAULT_PASSWORD ?? "E2ePassword123!";
const authenticated = process.env.E2E_RUN_AUTHENTICATED === "1";
const hasE2eDb = !!process.env.E2E_DATABASE_URL;

export const e2eAuth = {
  enabled: authenticated && hasE2eDb,
};

export const e2eUsers = {
  admin: fromEnv("ADMIN", "admin.e2e@terranova.test"),
  director: fromEnv("DIRECTOR", "director.e2e@terranova.test"),
  recepcion: fromEnv("RECEPCION", "recepcion.e2e@terranova.test"),
  caja: fromEnv("CAJA", "caja.e2e@terranova.test"),
  docente: fromEnv("DOCENTE", "docente.e2e@terranova.test"),
  coordinador: fromEnv("COORDINADOR", "coordinador.e2e@terranova.test"),
  lockout: fromEnv("LOCKOUT", "lockout.e2e@terranova.test"),
};

function fromEnv(role: string, fallbackEmail: string): E2EUser {
  const email = process.env[`E2E_${role}_EMAIL`] ?? fallbackEmail;
  const password = process.env[`E2E_${role}_PASSWORD`] ?? defaultPassword;

  return { email, password };
}
