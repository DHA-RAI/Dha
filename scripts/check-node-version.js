// Simple Node version checker without external deps.
const requiredMajor = 20;
const current = process.version; // e.g. 'v20.3.0'
const match = /^v?(\d+)\./.exec(current);
const major = match ? parseInt(match[1], 10) : null;
if (major !== requiredMajor) {
  console.error(`Error: Node ${requiredMajor}.x is required. Current version: ${current}`);
  console.error('Use `nvm use 20` or set your deployment environment to Node 20.');
  process.exit(1);
}
process.exit(0);
