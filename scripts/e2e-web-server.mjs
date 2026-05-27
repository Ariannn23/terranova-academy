import { spawn } from "node:child_process";

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev"],
  {
    stdio: "inherit",
    windowsHide: true,
  },
);

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (!server.killed) {
    server.kill(signal);
  }

  setTimeout(() => {
    process.exit(0);
  }, 1_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

server.on("exit", (code, signal) => {
  if (shuttingDown) {
    process.exit(0);
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
