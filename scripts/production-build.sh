#!/bin/bash
# Production-grade build script for Render deployment

set -euo pipefail
IFS=$'\n\t'

# Source common functions
source ./scripts/build-validation.sh

# Colors and logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[BUILD]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Cleanup function
cleanup() {
    log "Cleaning workspace..."
    rm -rf node_modules/.cache dist build .next coverage
    rm -rf client/node_modules client/dist client/build client/.cache
    npm cache clean --force
    log "✓ Cleanup complete"
}

# Handle build errors
handle_error() {
    local err_code=$?
    local line_no=$1
    error "Build failed on line $line_no (code: $err_code)"
}

# Trap errors
trap 'handle_error ${LINENO}' ERR

# Main build process
main() {
    log "Starting production build..."

    # Environment setup
    export NODE_ENV=production
    export NODE_OPTIONS="--max-old-space-size=4096"

    # Initial cleanup
    cleanup

    # Validate environment
    log "Validating build environment..."
    build_config || error "Environment validation failed"

    # Install dependencies
    log "Installing dependencies..."
    validate_deps || error "Dependency installation failed"

    # TypeScript validation
    log "Validating TypeScript..."
    npx tsc --noEmit --project tsconfig.production.json || error "TypeScript validation failed"

    # Build API
    log "Building API..."
    npm run build:api || error "API build failed"

    # Build client if present
    if [[ -d "client" ]]; then
        log "Building client..."
        (cd client && npm install --no-audit --no-fund && npm run build) || error "Client build failed"
    fi

    # Run production validation
    log "Validating production build..."
    npx ts-node scripts/validate-production.ts || error "Production validation failed"

    log "✅ Build completed successfully!"
    return 0
}

# Run with timing
time main 2>&1 | tee build.log