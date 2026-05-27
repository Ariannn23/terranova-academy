import { spawn } from "node:child_process";
import http from "node:http";

const port = 3000;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;
const rawArgs = process.argv.slice(2);
const runAuthenticated = rawArgs.includes("--auth");
const args = rawArgs.filter((arg) => arg !== "--auth");
const e2eEnv = {
  ...process.env,
  ...(process.env.E2E_DATABASE_URL
    ? { DATABASE_URL: process.env.E2E_DATABASE_URL }
    : {}),
  ...(runAuthenticated ? { E2E_RUN_AUTHENTICATED: "1" } : {}),
};

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "-p", String(port)],
  {
    env: e2eEnv,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

server.stdout.on("data", (chunk) => {
  process.stdout.write(`[E2E_SERVER] ${chunk}`);
});

server.stderr.on("data", (chunk) => {
  process.stderr.write(`[E2E_SERVER] ${chunk}`);
});

async function waitForServer(url, timeoutMs = 120_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await canReach(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`No se pudo iniciar el servidor E2E en ${url}`);
}

function canReach(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(true);
    });

    request.on("error", () => resolve(false));
    request.setTimeout(2_000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function stopServer() {
  if (!server.pid) return;

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  server.kill("SIGTERM");
}

try {
  await waitForServer(baseURL);

  const playwright = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...args],
    {
      env: {
        ...e2eEnv,
        E2E_BASE_URL: baseURL,
        E2E_SKIP_WEBSERVER: "1",
      },
      stdio: "inherit",
      windowsHide: true,
    },
  );

  playwright.on("exit", (code) => {
    stopServer();
    process.exit(code ?? 0);
  });
} catch (error) {
  stopServer();
  console.error(error);
  process.exit(1);
}
