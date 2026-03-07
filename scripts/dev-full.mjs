import { spawn, spawnSync } from "node:child_process";

const processes = [];
let shuttingDown = false;

function freePort(port) {
  const lsofResult = spawnSync("lsof", ["-ti", `tcp:${port}`], {
    encoding: "utf8",
  });

  if (lsofResult.status !== 0 || !lsofResult.stdout.trim()) {
    return;
  }

  const pids = lsofResult.stdout
    .split("\n")
    .map((pid) => pid.trim())
    .filter(Boolean);

  if (pids.length === 0) {
    return;
  }

  const killResult = spawnSync("kill", ["-9", ...pids], {
    stdio: "ignore",
  });

  if (killResult.status === 0) {
    console.log(`[dev:full] Freed port ${port} (killed PID: ${pids.join(", ")})`);
  }
}

function startProcess(name, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.error(`[${name}] terminated with ${reason}`);
    stopAll();
    process.exit(code ?? 0);
  });

  processes.push(child);
}

function stopAll() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  shuttingDown = true;
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shuttingDown = true;
  stopAll();
  process.exit(0);
});

freePort(3000);
freePort(3001);
freePort(8089);

startProcess("backend", process.execPath, ["booking-backend/server.js"], { PORT: "3001" });
startProcess("php", "php", ["-S", "127.0.0.1:8089", "-t", "public"]);
startProcess("frontend", process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev"]);
