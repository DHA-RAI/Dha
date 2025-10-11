#!/bin/bash

# Pre-deployment check script for Render
# Ensures all systems are ready for deployment

set -e

echo "🚀 Starting pre-deployment checks..."

# 1. Check Node.js version
echo "📝 Checking Node.js version..."
node_version=$(node -v)
if [[ ${node_version:1:2} -lt 18 ]]; then
    echo "❌ Node.js version must be >= 18.x"
    exit 1
fi
echo "✅ Node.js version check passed"

# 2. Check required files
echo "📝 Checking required files..."
required_files=(
    "package.json"
    "package-lock.json"
    "health-monitoring-system.js"
    "auto-recovery-system.js"
    "anti-sleep-system.js"
    "config/ports.js"
    "ultra-robust-start-v2.sh"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done
echo "✅ Required files check passed"

# 3. Check ports
echo "📝 Checking port availability..."
check_port() {
    nc -z localhost $1 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "❌ Port $1 is already in use"
        return 1
    fi
    return 0
}

ports=(3000 3001 3004 3005)
for port in "${ports[@]}"; do
    if ! check_port $port; then
        lsof -i :$port
        exit 1
    fi
done
echo "✅ Port availability check passed"

# 4. Check npm dependencies
echo "📝 Checking npm dependencies..."
npm ls --prod --depth=0 > /dev/null 2>&1 || {
    echo "❌ Missing production dependencies"
    exit 1
}
echo "✅ Dependencies check passed"

# 5. Check build
echo "📝 Running test build..."
npm run build:quick > /dev/null 2>&1 || {
    echo "❌ Build failed"
    exit 1
}
echo "✅ Build check passed"

# 6. Check TypeScript compilation
echo "📝 Checking TypeScript compilation..."
npx tsc --noEmit || {
    echo "❌ TypeScript compilation failed"
    exit 1
}
echo "✅ TypeScript compilation check passed"

# 7. Check environment variables
echo "📝 Checking environment variables..."
required_env=(
    "PORT"
    "AUTO_RECOVERY_PORT"
    "HEALTH_MONITOR_PORT"
    "ANTI_SLEEP_PORT"
)

for env in "${required_env[@]}"; do
    if [ -z "${!env}" ]; then
        echo "❌ Missing required environment variable: $env"
        exit 1
    fi
done
echo "✅ Environment variables check passed"

# 8. Check disk space
echo "📝 Checking disk space..."
free_space=$(df -m . | tail -1 | awk '{print $4}')
if [ "$free_space" -lt 500 ]; then
    echo "❌ Insufficient disk space (< 500MB free)"
    exit 1
fi
echo "✅ Disk space check passed"

# 9. Check memory
echo "📝 Checking memory availability..."
free_mem=$(free -m | awk '/^Mem:/{print $4}')
if [ "$free_mem" -lt 512 ]; then
    echo "❌ Insufficient memory (< 512MB free)"
    exit 1
fi
echo "✅ Memory check passed"

# Final verdict
echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready for deployment"
exit 0