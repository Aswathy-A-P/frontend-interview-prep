#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { readPayload, allow, surfaceToModel, extractFileEdit } = require('./_util.cjs');

function have(bin) {
  try {
    execSync(process.platform === 'win32' ? `where ${bin}` : `command -v ${bin}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function eslintInstalled() {
  const dir = path.join(process.cwd(), 'node_modules', '.bin');
  return ['eslint', 'eslint.cmd', 'eslint.CMD', 'eslint.ps1'].some((b) => fs.existsSync(path.join(dir, b)));
}

function run(cmd) {
  try {
    execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return null;
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).trim() || `lint failed: ${cmd}`;
  }
}

function lintCommand(p) {
  const rel = path.relative(process.cwd(), p).replace(/\\/g, '/');
  if (!/^src\/.*\.(t|j)sx?$/.test(rel)) return null;
  if (!eslintInstalled()) return null;
  if (have('pnpm')) return `pnpm exec eslint --max-warnings=0 "${p}"`;
  if (have('npx')) return `npx --no-install eslint --max-warnings=0 "${p}"`;
  return null;
}

(async () => {
  const payload = await readPayload();
  const { filePath } = extractFileEdit(payload);
  if (!filePath) return allow();

  const cmd = lintCommand(filePath);
  if (!cmd) return allow();

  const out = run(cmd);
  if (out) {
    return surfaceToModel(
      `ESLint flagged ${filePath} — fix before moving on (this would fail CI, which runs with --max-warnings=0):\n${out.slice(0, 2000)}`
    );
  }
  return allow();
})();
