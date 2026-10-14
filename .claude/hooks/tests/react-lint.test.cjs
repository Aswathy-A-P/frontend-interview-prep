'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');
const HOOK = path.join(__dirname, '..', 'react-lint.cjs');

let passed = 0,
  failed = 0,
  skipped = 0;
function ok(cond, msg) {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}
function skip(msg) {
  skipped++;
  console.log(`  SKIP: ${msg}`);
}

function eslintInstalled() {
  const dir = path.join(REPO, 'node_modules', '.bin');
  return ['eslint', 'eslint.cmd', 'eslint.CMD', 'eslint.ps1'].some((b) => fs.existsSync(path.join(dir, b)));
}

function edit(relPath, content) {
  const filePath = relPath ? path.join(REPO, relPath) : '';
  const payload = { tool_name: 'Edit', tool_input: { file_path: filePath, new_string: content || '' } };
  return spawnSync(process.execPath, [HOOK], { input: JSON.stringify(payload), encoding: 'utf8', cwd: REPO }).status;
}

function withFixture(relPath, content, fn) {
  const abs = path.join(REPO, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  try {
    fn();
  } finally {
    fs.rmSync(abs, { force: true });
  }
}

ok(edit('', '') === 0, 'no file path is allowed');
ok(edit('docs/notes.md', '# hi') === 0, 'unmatched extension (.md) is allowed');
ok(edit('README.md', '# frontend-interview-prep') === 0, 'root README is allowed');
ok(edit('vite.config.ts', 'export default {}') === 0, 'non-src ts file is allowed');

if (eslintInstalled()) {
  withFixture('src/_hook_lint_fixture_clean.tsx', 'export const sum = (a: number, b: number): number => a + b;\n', () => {
    ok(edit('src/_hook_lint_fixture_clean.tsx', 'export const sum = (a: number, b: number): number => a + b;\n') === 0, 'clean src file is allowed');
  });
  withFixture('src/_hook_lint_fixture_bad.tsx', 'export const X = () => { const unused = 1; return null; };\n', () => {
    ok(
      edit('src/_hook_lint_fixture_bad.tsx', 'export const X = () => { const unused = 1; return null; };\n') === 2,
      'src file with unused var is surfaced (eslint)'
    );
  });
} else {
  ok(edit('src/_fixture.tsx', 'export const X = () => null;') === 0, 'src file allowed when eslint not installed');
  skip('node_modules/.bin/eslint absent — eslint lint cases skipped');
}

console.log(`\nreact-lint: ${passed} passed, ${failed} failed, ${skipped} skipped`);
process.exit(failed === 0 ? 0 : 1);
