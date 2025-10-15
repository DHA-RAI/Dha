// Ultimate Port Handler
const net = require('net');
const { exec } = require('child_process');

class UltimatePortHandler {
    static async findOpenPort(startPort = 3000, endPort = 9000) {
        for (let port = startPort; port <= endPort; port++) {
            try {
                await this.killProcessOnPort(port);
                const isAvailable = await this.checkPort(port);
                if (isAvailable) return port;
            } catch (error) {
                continue;
            }
        }
        // If no port found, use dynamic assignment
        return await this.getDynamicPort();
    }

    static async checkPort(port) {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.unref();
            server.on('error', () => resolve(false));
            server.listen(port, '0.0.0.0', () => {
                server.close(() => resolve(true));
            });
        });
    }

    static async killProcessOnPort(port) {
        return new Promise((resolve) => {
            const cmd = process.platform === 'win32' 
                ? `netstat -ano | findstr :${port}`
                : `lsof -i :${port} -t`;
            
            exec(cmd, (error, stdout) => {
                if (error || !stdout) return resolve();
                
                const pids = stdout.split('\n')
                    .filter(Boolean)
                    .map(line => {
                        const matches = line.match(/(\d+)$/);
                        return matches ? matches[1] : null;
                    })
                    .filter(Boolean);

                pids.forEach(pid => {
                    try {
                        process.platform === 'win32'
                            ? exec(`taskkill /F /PID ${pid}`)
                            : exec(`kill -9 ${pid}`);
                    } catch (e) { /* ignore kill errors */ }
                });
                
                resolve();
            });
        });
    }

    static async getDynamicPort() {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.unref();
            server.listen(0, '0.0.0.0', () => {
                const port = server.address().port;
                server.close(() => resolve(port));
            });
        });
    }

    static async setupEmergencyServer(port) {
        const express = require('express');
        const app = express();
        
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', '*');
            res.header('Access-Control-Allow-Headers', '*');
            if (req.method === 'OPTIONS') return res.status(200).end();
            next();
        });

        app.get('*', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>DHA Services</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="bg-gray-50">
                    <div class="min-h-screen flex items-center justify-center">
                        <div class="text-center">
                            <h1 class="text-3xl font-semibold">DHA Services</h1>
                            <p class="mt-2">Emergency System Active - Port ${port}</p>
                        </div>
                    </div>
                </body>
                </html>
            `);
        });

        return new Promise((resolve) => {
            const server = app.listen(port, '0.0.0.0', () => resolve(server));
        });
    }
}

module.exports = UltimatePortHandler;