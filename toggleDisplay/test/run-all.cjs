const { spawnSync } = require("child_process");
const path = require("path");

const runners = [
  "run-multi-source.cjs",
  "run-checkbox-required.cjs",
  "run-text-input.cjs",
  "run-select.cjs",
  "run-file.cjs",
  "run-address.cjs",
  "run-label-target.cjs",
];

let failed = false;

for (const runner of runners) {
  const runnerPath = path.join(__dirname, runner);
  console.log(`\n=== ${runner} ===`);
  const result = spawnSync(process.execPath, [runnerPath], {
    stdio: "inherit",
    cwd: __dirname,
  });
  if (result.status !== 0) {
    failed = true;
    console.error(`FAILED: ${runner}`);
  }
}

process.exit(failed ? 1 : 0);
