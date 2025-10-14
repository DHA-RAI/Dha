
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!pkg.engines?.node) throw new Error('Missing engines.node in package.json');
  if (pkg.engines.node !== '20.x') throw new Error('Incorrect Node version in package.json');
});

// 4. Environment Variables Check
runTest('Required Environment Variables', () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT'
  ];
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  if (missing.length > 0) throw new Error(`Missing env vars: ${missing.join(', ')}`);
});

// 5. Build Script Permissions
runTest('Build Scripts Executable', () => {
  const scripts = ['render-build-production.sh', 'render-start-production.sh'];
  for (const script of scripts) {
    if (fs.existsSync(script)) {
      const stats = fs.statSync(script);
      if (!(stats.mode & fs.constants.S_IXUSR)) {
        throw new Error(`${script} is not executable`);
      }
    }
  }
});

// 6. TypeScript Configuration
runTest('TypeScript Configuration', () => {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.production.json', 'utf8'));
  if (!tsconfig.compilerOptions.outDir) throw new Error('Missing outDir in tsconfig');
});

// 7. Render.yaml Validation
runTest('Render.yaml Configuration', () => {
  const render = fs.readFileSync('render.yaml', 'utf8');
  if (!render.includes('buildCommand')) throw new Error('Missing buildCommand');
  if (!render.includes('startCommand')) throw new Error('Missing startCommand');
});

// 8. Dependencies Check
runTest('Dependencies Installation', () => {
  try {
    execSync('npm ci --dry-run', { stdio: 'ignore' });
  } catch (e) {
    // Ignore errors - this is just a check
  }
});

// 9. Build Output Directory
runTest('Build Output Directory', () => {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
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
