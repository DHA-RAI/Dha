// Ultimate Emergency Server
const express = require('express');
const { createServer } = require('http');
const path = require('path');
const fs = require('fs');
const UltimatePortHandler = require('./ultimate-port-handler');

class UltimateEmergencyServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.port = null;
        this.retryCount = 0;
        this.maxRetries = 100;
    }

    setupMiddleware() {
        // Universal success middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', '*');
            res.header('Access-Control-Allow-Headers', '*');
            
            if (req.method === 'OPTIONS') {
                return res.status(200).end();
            }
            
            // Catch all errors in routes
            try {
                next();
            } catch (error) {
                console.error('Route error:', error);
                this.sendEmergencyResponse(res);
            }
        });

        // Health check with detailed info
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                port: this.port,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                pid: process.pid,
                timestamp: new Date().toISOString()
            });
        });

        // Static files with fallback
        this.app.use(express.static('dist/public', {
            fallthrough: true,
            setHeaders: (res) => {
                res.header('Cache-Control', 'no-cache');
            }
        }));

        // Catch-all route
        this.app.get('*', (req, res) => {
            try {
                const indexPath = path.join(process.cwd(), 'dist/public/index.html');
                if (fs.existsSync(indexPath)) {
                    res.sendFile(indexPath);
                } else {
                    this.sendEmergencyResponse(res);
                }
            } catch (error) {
                console.error('Serve error:', error);
                this.sendEmergencyResponse(res);
            }
        });
    }

    sendEmergencyResponse(res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>DHA Services</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>body{font-family:system-ui,-apple-system,sans-serif}</style>
            </head>
            <body class="bg-gray-50">
                <div class="min-h-screen flex items-center justify-center">
                    <div class="text-center">
                        <h1 class="text-3xl font-semibold">DHA Services</h1>
                        <p class="mt-2">Emergency System Active - Port ${this.port}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    async start() {
        try {
            this.setupMiddleware();
            this.server = createServer(this.app);

            // Find available port
            this.port = await UltimatePortHandler.findOpenPort();
            
            return new Promise((resolve) => {
                this.server.listen(this.port, '0.0.0.0', () => {
                    console.log(`Server running on port ${this.port}`);
                    resolve(true);
                });

                this.server.on('error', async (error) => {
                    console.error('Server error:', error);
                    if (this.retryCount < this.maxRetries) {
                        this.retryCount++;
                        console.log(`Retry attempt ${this.retryCount}...`);
                        await this.restart();
                    }
                });
            });
        } catch (error) {
            console.error('Start error:', error);
            return UltimatePortHandler.setupEmergencyServer(0);
        }
    }

    async restart() {
        try {
            if (this.server) {
                this.server.close();
            }
            this.port = await UltimatePortHandler.findOpenPort();
            return this.start();
        } catch (error) {
            console.error('Restart error:', error);
            return UltimatePortHandler.setupEmergencyServer(0);
        }
    }
}

// Auto-start with error handling
const startServer = async () => {
    try {
        const server = new UltimateEmergencyServer();
        await server.start();
    } catch (error) {
        console.error('Fatal error:', error);
        // Ultimate fallback - basic HTTP server
        require('http')
            .createServer((req, res) => res.end('DHA Services - Emergency Mode'))
            .listen(0);
    }
};

startServer();