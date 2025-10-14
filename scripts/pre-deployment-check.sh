#!/bin/bash
set -e

# Verify NODE_ENV
if [ "$NODE_ENV" != "production" ]; then
  echo "Error: NODE_ENV must be set to production"
  exit 1
fi

# Check required environment variables
required_vars=(
  "DATABASE_URL"
  "SESSION_SECRET"
  "JWT_SECRET"
  "ENCRYPTION_KEY"
  "OPENAI_API_KEY"
  "ANTHROPIC_API_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

# Verify dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found. Build failed?"
  exit 1
fi

# Verify key files exist
required_files=(
  "dist/server/index.js"
  "dist/monitor.js"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Error: Required file $file not found"
    exit 1
  fi
done

echo "Pre-deployment checks passed"
exit 0