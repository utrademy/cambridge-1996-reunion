#!/usr/bin/env node
/**
 * Automatically delegates to the workspace's portable Node 22 LTS binary (.tools/node/node.exe)
 * when the host's global Node.js version is older than 20.9.0 (e.g., Node 18.16.0).
 */
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const args = process.argv.slice(2);
if (args.length === 0) {
  process.exit(0);
}

const rootDir = path.resolve(__dirname, "..");
const localNodeDir = path.join(rootDir, ".tools", "node");
const localNodeExe = path.join(
  localNodeDir,
  process.platform === "win32" ? "node.exe" : "node"
);

const [major, minor] = process.versions.node.split(".").map(Number);
const isSupportedNode = major > 20 || (major === 20 && minor >= 9);

const nodeBinary =
  !isSupportedNode && fs.existsSync(localNodeExe)
    ? localNodeExe
    : process.execPath;

const targetMap = {
  next: path.join(rootDir, "node_modules", "next", "dist", "bin", "next"),
  eslint: path.join(rootDir, "node_modules", "eslint", "bin", "eslint.js"),
  tsc: path.join(rootDir, "node_modules", "typescript", "bin", "tsc"),
};

const [cmd, ...restArgs] = args;
const scriptPath = targetMap[cmd] || path.resolve(rootDir, cmd);

const env = { ...process.env };
if (fs.existsSync(localNodeDir)) {
  const pathKey =
    Object.keys(env).find((k) => k.toLowerCase() === "path") || "PATH";
  env[pathKey] = `${localNodeDir}${path.delimiter}${env[pathKey] || ""}`;
}

const child = spawn(nodeBinary, [scriptPath, ...restArgs], {
  stdio: "inherit",
  cwd: rootDir,
  env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
