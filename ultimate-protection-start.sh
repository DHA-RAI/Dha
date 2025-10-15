#!/bin/bash
set -e

echo "🛡️ Starting Ultimate Protection System"
echo "====================================="

# Maximum environment setup
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=8192 --no-warnings --trace-deprecation --unhandled-rejections=strict"
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export SKIP_PREFLIGHT_CHECK=true
export CI=false

# Function to handle process termination
cleanup() {
    echo "⚠️ Received termination signal, initiating safe shutdown..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Ensure critical directories exist
mkdir -p dist/{server,public}
mkdir -p logs

# Start all protection systems in parallel
echo "🚀 Activating protection systems..."

# Start Critical Path Protection
node critical-path-protection.js >> logs/critical-path.log 2>&1 &

# Start Health Monitoring
node health-monitoring-system.js >> logs/health.log 2>&1 &

# Start Anti-Sleep System
node anti-sleep-system.js >> logs/anti-sleep.log 2>&1 &

# Start Emergency Recovery
node emergency-recovery.js >> logs/emergency.log 2>&1 &

# Start Build Monitor
node build-monitor.js >> logs/build.log 2>&1 &

# Start Auto Recovery
node auto-recovery.js >> logs/auto-recovery.log 2>&1 &

echo "✅ All protection systems activated"

# Create fallback HTML if needed
if [ ! -f "dist/public/index.html" ]; then
    echo "⚠️ Creating emergency index.html..."
    cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DHA Services - Protected Mode</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body class="bg-gray-50">
    <div id="root">
        <div class="min-h-screen flex items-center justify-center">
            <div class="text-center">
                <h1 class="text-3xl font-semibold text-gray-900">DHA Digital Services</h1>
                <p class="mt-2 text-gray-600">Protected System Mode</p>
            </div>
        </div>
    </div>
</body>
</html>
EOF
fi

# Create fallback server if needed
if [ ! -f "dist/server/index.js" ]; then
    echo "⚠️ Creating emergency server..."
    cat > dist/server/index.js << 'EOF'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, '../public')));
app.get('/api/health', (req, res) => res.json({ status: 'protected_mode' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

const startServer = () => {
    try {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Protected server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server start failed, retrying in 5s...');
        setTimeout(startServer, 5000);
    }
};

startServer();
EOF
fi

# Start the server with auto-restart
while true; do
    echo "🚀 Starting protected server..."
    if node dist/server/index.js; then
        echo "Server exited cleanly"
    else
        echo "⚠️ Server crashed, restarting in 5 seconds..."
    fi
    sleep 5
done