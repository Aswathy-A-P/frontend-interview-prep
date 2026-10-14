#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { readPayload, allow, surfaceToModel, extractFileEdit } = require('./_util.cjs');

const LINTED_SOURCE = /^src\/.*\.(t|j)sx?$/;

function localEslintEntry() {
  const entry = path.join(process.cwd(), 'node_modules', 'eslint', 'bin', 'eslint.js');
  return fs.existsSync(entry) ? entry : null;
}

function lintTarget(filePath) {
  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  return LINTED_SOURCE.test(rel) ? rel : null;
}

function lintFailure(eslintEntry, rel) {
  const result = spawnSync(process.execPath, [eslintEntry, '--max-warnings=0', '--', rel], {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
  });
  if (result.status === 0) return null;
  return ((result.stdout || '') + (result.stderr || '')).trim() || `eslint exited with ${result.status}`;
}

(async () => {
  const payload = await readPayload();
  const { filePath } = extractFileEdit(payload);
  if (!filePath) return allow();

  const rel = lintTarget(filePath);
  if (!rel) return allow();

  const eslintEntry = localEslintEntry();
  if (!eslintEntry) return allow();

  const out = lintFailure(eslintEntry, rel);
  if (out) {
    return surfaceToModel(
      `ESLint flagged ${filePath} — fix before moving on (this would fail CI, which runs with --max-warnings=0):\n${out.slice(0, 2000)}`
    );
  }
  return allow();
})();
