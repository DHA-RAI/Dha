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