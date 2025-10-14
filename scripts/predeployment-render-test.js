#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { validateProduction } = require('./validate-production.ts');

async function runPredeploymentTest() {
  console.log('🚀 Starting Pre-deployment Render Webapp Test\n');
  const issues = [];
  
  try {
    // 1. Check Node Version
    console.log('📋 Checking Node version...');
    const nodeVersion = process.version;
    if (!nodeVersion.startsWith('v20.')) {
      issues.push('❌ Node version must be 20.x');
    }
    console.log(`✅ Node ${nodeVersion}`);

    // 2. Verify Critical Files
    console.log('\n📋 Verifying critical files...');
    const requiredFiles = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.production.json',
      '.nvmrc',
      'render.yaml',
      'scripts/ultra-deploy.sh',
      'scripts/production-build.sh',
      'scripts/validate-production.ts'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        issues.push(`❌ Missing required file: ${file}`);
      }
    }
    console.log('✅ Critical files verified');

    // 3. Test TypeScript Compilation
    console.log('\n📋 Testing TypeScript compilation...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
    } catch (e) {
      issues.push('❌ TypeScript compilation failed');
      console.error(e.output.toString());
    }

    // 4. Verify Package.json Scripts
    console.log('\n📋 Verifying package.json scripts...');
    const pkg = require('./package.json');
    const requiredScripts = [
      'build',
      'start',
      'typecheck',
      'validate:all'
    ];
    
    for (const script of requiredScripts) {
      if (!pkg.scripts?.[script]) {
        issues.push(`❌ Missing required script: ${script}`);
      }
    }
    console.log('✅ Package.json scripts verified');

    // 5. Check Dependencies
    console.log('\n📋 Checking dependencies...');
    if (!pkg.dependencies?.['better-sqlite3']) {
      issues.push('❌ Missing better-sqlite3 dependency');
    }
    if (!pkg.dependencies?.['zod']) {
      issues.push('❌ Missing zod dependency');
    }
    console.log('✅ Dependencies checked');

    // 6. Test Production Build
    console.log('\n📋 Testing production build...');
    try {
      execSync('NODE_ENV=production npm run build', { stdio: 'pipe' });
      console.log('✅ Production build successful');
    } catch (e) {
      issues.push('❌ Production build failed');
      console.error(e.output.toString());
    }

    // 7. Validate Production Environment
    console.log('\n📋 Running production validation...');
    const validationResult = await validateProduction();
    if (!validationResult) {
      issues.push('❌ Production validation failed');
    }
    console.log('✅ Production validation complete');

    // 8. Check Render Configuration
    console.log('\n📋 Checking Render configuration...');
    const renderConfig = fs.readFileSync('render.yaml', 'utf8');
    if (!renderConfig.includes('healthCheckPath')) {
      issues.push('❌ Missing health check configuration in render.yaml');
    }
    if (!renderConfig.includes('autoDeploy')) {
      issues.push('❌ Missing auto-deploy configuration in render.yaml');
    }
    console.log('✅ Render configuration verified');

    // Final Report
    console.log('\n📊 Pre-deployment Test Report:');
    if (issues.length === 0) {
      console.log('✅ All checks passed! Ready for deployment.');
    } else {
      console.log('⚠️ Issues found:');
      issues.forEach(issue => console.log(issue));
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Pre-deployment test failed:', error);
    process.exit(1);
  }
}

// Run the test
runPredeploymentTest();