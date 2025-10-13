# Deployment Quick Reference

## Current Status
- Repository now enforces Node 20.x
- Added CI verification via GitHub Actions
- Native addons (better-sqlite3) tested and working

## Render Deployment Steps
1. Dashboard > Service > Settings
2. Environment > Build & Start
3. Set Node version to 20.x
4. Save changes
5. Deploy

## Monitor Build
Watch for these success indicators:
```
# Should see these messages
> node scripts/check-node-version.js
# No error = correct Node version

> better-sqlite3@9.6.0 install
# Should complete without V8 API errors

> [build] rebuilt dependencies successfully
# Indicates native addons compiled
```

## Quick Fixes
If build fails:
1. Check Node version in build logs
2. Verify Render reads `.nvmrc`
3. Check build tools are present
4. Review `DEPLOYMENT_NOTES.md`

## Rollback Plan
If needed:
1. Revert commits
2. Reset Render Node version
3. Deploy previous working commit

## Verification
After deploy:
1. Check logs for successful build
2. Test database operations
3. Monitor error rates

## Ultra Command (All-in-One)

### Ultra Build & Start
```bash
#!/bin/bash

# Ultra command that combines all protection features and validations
ultra_deploy() {
    echo "🚀 Starting Ultra Deployment Process..."

    # Set all protection variables
    export NODE_ENV=production
    export MAXIMUM_PROTECTION_MODE=true
    export ENABLE_SELF_HEALING=true
    export ENABLE_AUTO_RECOVERY=true
    export ENABLE_ULTRA_MONITORING=true
    export CIRCUIT_BREAKER_ENABLED=true
    export GRACEFUL_DEGRADATION=true

    # Pre-deployment checks
    echo "📋 Running Pre-deployment Checks..."
    npm ci --legacy-peer-deps || { echo "❌ Dependencies failed"; exit 1; }
    node scripts/check-node-version.js || { echo "❌ Node version check failed"; exit 1; }
    npm run typecheck || { echo "❌ TypeScript check failed"; exit 1; }
    npm audit || { echo "⚠️ Security audit found issues"; }
    node scripts/validate-env.js || { echo "❌ Environment validation failed"; exit 1; }

    # Ultra build
    echo "🏗️ Running Ultra Build..."
    bash scripts/production-build.sh || { echo "❌ Build failed"; exit 1; }

    # Validation suite
    echo "✅ Running Validation Suite..."
    npm run validate:all || { echo "⚠️ Validation warnings detected"; }
    node scripts/verify-db.js || { echo "❌ Database check failed"; exit 1; }
    node scripts/verify-api.js || { echo "❌ API check failed"; exit 1; }
    node scripts/health-check.js || { echo "⚠️ Health check warnings"; }

    # Ultra start
    echo "🚀 Starting Server with Ultra Protection..."
    node dist/server.js
}

# Run ultra deployment
ultra_deploy
```

Save this as `ultra-deploy.sh` and run:
```bash
chmod +x ultra-deploy.sh
./ultra-deploy.sh
```

## Advanced Deployment Commands

### Pre-deployment Setup
```bash
# Install dependencies with exact versions
npm ci --legacy-peer-deps

# Verify Node version
node scripts/check-node-version.js

# Run type checking
npm run typecheck

# Run security audit
npm audit

# Validate environment variables
node scripts/validate-env.js
```

### Build Commands
```bash
# Production build with optimizations
bash scripts/production-build.sh

# Alternative: Maximum protection build
NODE_ENV=production npm run build:secure
```

### Start Commands
```bash
# Production start
NODE_ENV=production node dist/server.js

# With enhanced monitoring
NODE_ENV=production ENABLE_MONITORING=true node dist/server.js

# With auto-recovery
NODE_ENV=production ENABLE_AUTO_RECOVERY=true node dist/server.js
```

### Health Check Commands
```bash
# Verify database connection
node scripts/verify-db.js

# Test API endpoints
node scripts/verify-api.js

# Monitor system health
node scripts/health-check.js
```

### Advanced Options
```bash
# Enable all protection features
export MAXIMUM_PROTECTION_MODE=true
export ENABLE_SELF_HEALING=true
export ENABLE_AUTO_RECOVERY=true
export ENABLE_ULTRA_MONITORING=true

# Run with maximum security
NODE_ENV=production \
CIRCUIT_BREAKER_ENABLED=true \
GRACEFUL_DEGRADATION=true \
node dist/server.js
```

### Validation Commands
```bash
# Full system validation
npm run validate:all

# Security validation
npm run validate:security

# Performance validation
npm run validate:performance

# API validation
npm run validate:api
```

## Support
- See `DEPLOYMENT_NOTES.md` for details
- Check GitHub Actions for build status
- Review PR #XYZ for context