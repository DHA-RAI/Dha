#!/bin/bash

# Production deployment script with self-healing
set -e

echo "🚀 Starting production deployment with self-healing..."

# Load environment variables
if [ -f ".env" ]; then
    source .env
fi

# Function to check if a service is running
check_service() {
    if pm2 show $1 > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to validate service health
validate_health() {
    local service=$1
    local port=$2
    local max_retries=5
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if curl -s "http://localhost:${port}/health" | grep -q "healthy"; then
            return 0
        fi
        echo "⏳ Waiting for $service to be healthy..."
        sleep 5
        retry_count=$((retry_count + 1))
    done
    return 1
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build the application
echo "🏗️ Building application..."
npm run build

# Start self-healing system
echo "🔧 Starting self-healing system..."
pm2 start self-healing-system.js --name "self-healing"

# Wait for self-healing to initialize
sleep 5

# Start the main application with PM2
echo "🚀 Starting application..."
pm2 start npm --name "dha-online" -- start

# Start the auto-recovery system
echo "🔄 Starting auto-recovery system..."
pm2 start auto-recovery-system.js --name "auto-recovery"

# Run deployment validation
echo "🔍 Running deployment validation..."
node -e "
const validator = require('./deployment-validator');
validator.validateAll().then(success => {
    if (!success) {
        console.error('❌ Deployment validation failed');
        process.exit(1);
    }
    console.log('✅ Deployment validation passed');
});"

# Verify all services are running
services=("self-healing" "dha-online" "auto-recovery")
ports=(3004 3000 3001)

for i in "${!services[@]}"; do
    service=${services[$i]}
    port=${ports[$i]}
    
    echo "🔍 Verifying ${service}..."
    
    if ! check_service "${service}"; then
        echo "❌ Service ${service} is not running"
        exit 1
    fi
    
    if ! validate_health "${service}" "${port}"; then
        echo "❌ Service ${service} is not healthy"
        exit 1
    fi
    
    echo "✅ Service ${service} is running and healthy"
done

echo "✅ Deployment completed successfully!"
echo "🔒 System is running with self-healing enabled"
echo "📊 Monitor the system at http://localhost:3004/status"

# Save deployment status
echo "{
  \"status\": \"deployed\",
  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"services\": {
    \"main\": \"running\",
    \"self_healing\": \"active\",
    \"auto_recovery\": \"active\"
  }
}" > deployment-status.json

exit 0