const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const resultsDir = path.join(root, 'test-results');
fs.mkdirSync(resultsDir, { recursive: true });
const run = (label, args, reportPath, cwd = root) => {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  fs.writeFileSync(path.join(resultsDir, `${label}.log`), `${result.stdout || ''}${result.stderr || ''}`);
  let report = null;
  try { report = JSON.parse(fs.readFileSync(reportPath, 'utf8')); } catch {
    try { report = JSON.parse(result.stdout || ''); } catch { /* failure is summarized below */ }
  }
  return { label, status: result.status ?? 1, report };
};

const backendReport = path.join(resultsDir, 'backend.json');
const frontendReport = path.join(resultsDir, 'frontend.json');
const runs = [
  run('backend', ['--experimental-vm-modules', path.join(root, 'backend/node_modules/jest/bin/jest.js'), '--runInBand', '--json', '--outputFile', backendReport], backendReport, path.join(root, 'backend')),
  run('frontend', [path.join(root, 'frontend/node_modules/vitest/vitest.mjs'), 'run', '--reporter=json', '--outputFile', frontendReport], frontendReport, path.join(root, 'frontend')),
  run('e2e', [path.join(root, 'node_modules/playwright/cli.js'), 'test'], path.join(resultsDir, 'playwright.json')),
];

const totals = { total: 0, passed: 0, failed: 0, skipped: 0 };
for (const runResult of runs) {
  const report = runResult.report;
  const total = report?.numTotalTests ?? report?.stats?.expected ?? 0;
  const skipped = report?.numPendingTests ?? report?.stats?.skipped ?? 0;
  const failed = report?.numFailedTests ?? report?.stats?.failed ?? report?.stats?.unexpected ?? (runResult.status ? total : 0);
  const passed = report?.numPassedTests ?? report?.stats?.passed ?? Math.max(0, total - skipped - failed);
  totals.total += total; totals.passed += passed; totals.failed += failed; totals.skipped += skipped;
  console.log(`${runResult.label}: total=${total} passed=${passed} failed=${failed} skipped=${skipped} exit=${runResult.status}`);
}
console.log(`TOTAL: total=${totals.total} passed=${totals.passed} failed=${totals.failed} skipped=${totals.skipped}`);
console.log(`Logs and machine-readable reports: ${path.relative(root, resultsDir)}`);
process.exitCode = runs.some((runResult) => runResult.status !== 0) ? 1 : 0;
