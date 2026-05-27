export type E2EUser = {
  email: string;
  password: string;
};

export const e2eAuth = {
  hasAdmin:
    process.env.E2E_RUN_AUTHENTICATED === "1" ||
    Boolean(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD),
};

export const e2eUsers = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? "director@terranova.edu.pe",
    password: process.env.E2E_ADMIN_PASSWORD ?? "Admin1234!",
  },
  recepcion: fromEnv("RECEPCION"),
  caja: fromEnv("CAJA"),
  docente: fromEnv("DOCENTE"),
  coordinador: fromEnv("COORDINADOR"),
};

function fromEnv(role: string): E2EUser | null {
  const email = process.env[`E2E_${role}_EMAIL`];
  const password = process.env[`E2E_${role}_PASSWORD`];

  return email && password ? { email, password } : null;
}
