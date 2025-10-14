#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting Pre-deployment Test Suite\n');

const results = {
  pass: [],
  fail: []
};

function runTest(name, testFn) {
  try {
    testFn();
    results.pass.push(name);
    console.log(`✅ ${name}`);
  } catch (error) {
    results.fail.push({ name, error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}\n`);
  }
}

// 1. Required Files Check
runTest('Required Files Present', () => {
  const requiredFiles = [
    'package.json',
    'tsconfig.production.json',
    'scripts/deploy.sh',
    'render.yaml',
    '.nvmrc'
  ];
  const missing = requiredFiles.filter(file => !fs.existsSync(file));
  if (missing.length > 0) throw new Error(`Missing files: ${missing.join(', ')}`);
});

// 2. Node Version Check
runTest('Node Version Compatible', () => {
  const nvmrc = fs.readFileSync('.nvmrc', 'utf8').trim();
  if (nvmrc !== '20') throw new Error(`Expected Node 20, found ${nvmrc}`);
});

// 3. Package.json Check
runTest('Package.json Configuration', () => {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  if (!pkg.engines?.node) throw new Error('Missing engines.node in package.json');
  if (pkg.engines.node !== '20.x') throw new Error('Incorrect Node version in package.json');
});

// 4. Environment Variables Check
runTest('Required Environment Variables', () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  if (missing.length > 0) throw new Error(`Missing env vars: ${missing.join(', ')}`);
});

// 5. Build Script Permissions
runTest('Build Script Executable', () => {
  const deployScript = 'scripts/deploy.sh';
  const stats = fs.statSync(deployScript);
  if (!(stats.mode & fs.constants.S_IXUSR)) {
    throw new Error('deploy.sh is not executable');
  }
});

// 6. TypeScript Configuration
runTest('TypeScript Configuration', () => {
  const tsconfig = require(path.join(process.cwd(), 'tsconfig.production.json'));
  if (!tsconfig.compilerOptions.outDir) throw new Error('Missing outDir in tsconfig');
  if (!tsconfig.compilerOptions.strict) throw new Error('Strict mode not enabled');
});

// 7. Render.yaml Validation
runTest('Render.yaml Configuration', () => {
  const render = fs.readFileSync('render.yaml', 'utf8');
  if (!render.includes('buildCommand')) throw new Error('Missing buildCommand');
  if (!render.includes('startCommand')) throw new Error('Missing startCommand');
  if (!render.includes('healthCheckPath')) throw new Error('Missing healthCheckPath');
});

// 8. Dependencies Check
runTest('Dependencies Installation', () => {
  execSync('npm ci --dry-run', { stdio: 'ignore' });
});

// 9. Database Configuration
runTest('Database Configuration', () => {
  const dbPath = path.dirname(process.env.DATABASE_URL?.replace('sqlite://', '') || '');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }
});

// Final Report
console.log('\n📊 Pre-deployment Test Results:');
console.log(`✅ Passed: ${results.pass.length} tests`);
if (results.fail.length > 0) {
  console.log(`❌ Failed: ${results.fail.length} tests`);
  console.log('\nFailed Tests:');
  results.fail.forEach(({ name, error }) => {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error}\n`);
  });
  process.exit(1);
} else {
  console.log('\n✨ All tests passed! Ready for deployment!');
}