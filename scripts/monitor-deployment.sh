#!/bin/bash

# Health Check Monitor Script
RENDER_URL="https://dha-digital-services.onrender.com"
MAX_RETRIES=30
RETRY_INTERVAL=10

echo "🔍 Starting deployment health check monitor..."
echo "URL: $RENDER_URL"
echo "Max retries: $MAX_RETRIES"
echo "Retry interval: $RETRY_INTERVAL seconds"
echo "=================================="

for ((i=1; i<=$MAX_RETRIES; i++)); do
    echo "Attempt $i of $MAX_RETRIES..."
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "$RENDER_URL/api/health")
    HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n1)
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "✅ Service is healthy!"
        echo "Response: $BODY"
        exit 0
    else
        echo "⚠️ Service not ready (Status: $HTTP_STATUS)"
        echo "Response: $BODY"
        
        if [ $i -lt $MAX_RETRIES ]; then
            echo "Retrying in $RETRY_INTERVAL seconds..."
            sleep $RETRY_INTERVAL
        fi
    fi
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1