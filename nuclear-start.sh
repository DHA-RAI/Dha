#!/bin/bash
set -e

echo "🚀 NUCLEAR STARTUP ACTIVATED"
echo "==========================="

# Set production environment
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=8192 --no-warnings"
export PORT="${PORT:-5000}"

# Ensure we have a server file
if [ ! -f "dist/server/index.js" ]; then
    echo "⚠️ Creating emergency server..."
    mkdir -p dist/server dist/public
    cat > dist/server/index.js << 'EOF'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

app.use(express.static(path.join(__dirname, '../public')));
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
EOF

    # Create emergency index.html if needed
    if [ ! -f "dist/public/index.html" ]; then
        mkdir -p dist/public
        cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DHA Services</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body{font-family:system-ui,-apple-system,sans-serif}</style>
</head>
<body class="bg-gray-50">
    <div id="root">
        <div class="min-h-screen flex items-center justify-center">
            <div class="text-center">
                <h1 class="text-3xl font-semibold text-gray-900">DHA Digital Services</h1>
                <p class="mt-2 text-gray-600">Emergency System Active</p>
            </div>
        </div>
    </div>
</body>
</html>
EOF
    fi
fi

# Start server with auto-restart
while true; do
    echo "Starting server..."
    node dist/server/index.js || true
    echo "Server exited, restarting in 5 seconds..."
    sleep 5
done