# Build validation and configuration
build_config() {
  # Node version validation
  NODE_VERSION=$(node --version)
  if [[ ! $NODE_VERSION =~ ^v20\. ]]; then
    error "Node 20.x required. Found: $NODE_VERSION"
    return 1
  fi
  log "✓ Node version validated: $NODE_VERSION"

  # TypeScript validation
  if [[ -f "tsconfig.json" ]]; then
    log "Running TypeScript validation..."
    npx tsc --noEmit || {
      warn "TypeScript errors found. Attempting fixes..."
      npx tsc --noEmit --strict || return 1
    }
    log "✓ TypeScript validation passed"
  fi

  # Package verification
  if [[ ! -f "package.json" ]]; then
    error "package.json not found"
    return 1
  fi

  # Lock file verification
  if [[ ! -f "package-lock.json" ]]; then
    warn "package-lock.json not found. Will be generated."
  fi

  return 0
}

# Dependency validation and installation
validate_deps() {
  log "Validating dependencies..."
  
  # Check for native addons
  if grep -q "better-sqlite3" package.json; then
    log "Found better-sqlite3, verifying build tools..."
    command -v node-gyp >/dev/null 2>&1 || npm install -g node-gyp
    command -v make >/dev/null 2>&1 || {
      error "make is required for native addons"
      return 1
    }
  fi

  # Clean install with fallbacks
  if [[ -f "package-lock.json" ]]; then
    log "Running clean install..."
    npm ci --no-audit --no-fund || {
      warn "npm ci failed, falling back to npm install"
      npm install --no-audit --no-fund || return 1
    }
  else
    log "Installing dependencies..."
    npm install --no-audit --no-fund || return 1
  fi

  # Verify critical dependencies
  log "Verifying native addons..."
  node -e "require('better-sqlite3')" || {
    warn "Rebuilding better-sqlite3..."
    npm rebuild better-sqlite3 --build-from-source || return 1
  }

  log "✓ Dependencies validated and installed"
  return 0
}