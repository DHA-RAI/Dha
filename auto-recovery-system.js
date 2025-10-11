const http = require('http');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CHECK_INTERVAL = 30000; // 30 seconds
const RESTART_DELAY = 5000; // 5 seconds
const MAX_MEMORY_USAGE = 450 * 1024 * 1024; // 450MB max memory usage
const MAX_RESTART_ATTEMPTS = 5;
const HEALTH_CHECK_PORT = process.env.AUTO_RECOVERY_PORT || 3001;
const HEALTH_LOG_FILE = 'auto-recovery-health.json';

class AutoRecoverySystem {
    constructor() {
        this.state = {
            lastRestartTime: 0,
            restartCount: 0,
            status: 'starting',
            startTime: Date.now(),
            lastCheck: null,
            errors: [],
            recoveryActions: []
        };
        this.server = null;
        this.isMonitoring = false;
    }

    async start() {
        try {
            await this.loadState();
            await this.startHealthServer();
            await this.startMonitoring();
            this.state.status = 'healthy';
            await this.saveState();
            console.log('✅ Auto Recovery System started successfully');
        } catch (error) {
            console.error('❌ Failed to start Auto Recovery System:', error);
            throw error;
        }
    }

    async startHealthServer() {
        return new Promise((resolve, reject) => {
            try {
                this.server = http.createServer(async (req, res) => {
                    try {
                        if (req.url === '/health') {
                            const health = await this.getHealthStatus();
                            res.writeHead(200, {
                                'Content-Type': 'application/json',
                                'Cache-Control': 'no-cache'
                            });
                            res.end(JSON.stringify(health));
                        } else if (req.url === '/metrics') {
                            const metrics = await this.getMetrics();
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(metrics));
                        } else {
                            res.writeHead(404);
                            res.end();
                        }
                    } catch (error) {
                        console.error('Health check error:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'error', error: error.message }));
                    }
                });

                this.server.on('error', (error) => {
                    console.error('Health server error:', error);
                    this.logError('health_server', error);
                    reject(error);
                });

                this.server.listen(HEALTH_CHECK_PORT, () => {
                    console.log(`✅ Health check server running on port ${HEALTH_CHECK_PORT}`);
                    resolve();
                });
            } catch (error) {
                console.error('Failed to start health server:', error);
                reject(error);
            }
        });
    }

    async getHealthStatus() {
        const usage = process.memoryUsage();
        return {
            status: this.state.status,
            uptime: process.uptime(),
            memory: {
                used: usage.heapUsed,
                total: usage.heapTotal,
                external: usage.external
            },
            lastCheck: this.state.lastCheck,
            restartCount: this.state.restartCount,
            lastRestart: this.state.lastRestartTime,
            recoveryActions: this.state.recoveryActions.slice(-5)
        };
    }

    async getMetrics() {
        return {
            restarts: this.state.restartCount,
            errors: this.state.errors.length,
            lastRecoveryAction: this.state.recoveryActions[this.state.recoveryActions.length - 1],
            memoryUsage: process.memoryUsage().heapUsed,
            uptime: process.uptime()
        };
    }

    async checkMemoryUsage() {
        const usage = process.memoryUsage();
        const isHealthy = usage.heapTotal < MAX_MEMORY_USAGE;
        if (!isHealthy) {
            this.logError('memory_usage', new Error('Memory usage exceeded limit'));
        }
        return isHealthy;
    }

    async restartApp() {
        const currentTime = Date.now();
        if (currentTime - this.state.lastRestartTime < RESTART_DELAY) {
            console.log('⚠️ Too many restart attempts, waiting...');
            return false;
        }

        if (this.state.restartCount >= MAX_RESTART_ATTEMPTS) {
            console.log('❌ Maximum restart attempts reached, manual intervention required');
            this.logError('max_restarts', new Error('Maximum restart attempts reached'));
            return false;
        }

        try {
            console.log('🔄 Restarting application...');
            this.state.lastRestartTime = currentTime;
            this.state.restartCount++;
            await this.executeCommand('pm2 restart all');
            this.logRecoveryAction('restart', 'Application restarted successfully');
            await this.saveState();
            console.log('✅ Application restarted successfully');
            return true;
        } catch (error) {
            this.logError('restart', error);
            console.error('❌ Failed to restart application:', error);
            return false;
        }
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        });
    }

    async startMonitoring() {
        if (this.isMonitoring) {
            console.log('⚠️ Monitoring already active');
            return;
        }

        this.isMonitoring = true;
        console.log('✅ Starting system monitoring');

        setInterval(async () => {
            try {
                this.state.lastCheck = new Date().toISOString();
                const memoryOk = await this.checkMemoryUsage();
                if (!memoryOk) {
                    await this.restartApp();
                }
                await this.saveState();
            } catch (error) {
                console.error('❌ Monitoring error:', error);
                this.logError('monitoring', error);
            }
        }, CHECK_INTERVAL);
    }

    logError(type, error) {
        this.state.errors.push({
            type,
            message: error.message,
            timestamp: new Date().toISOString()
        });
        if (this.state.errors.length > 100) {
            this.state.errors = this.state.errors.slice(-100);
        }
    }

    logRecoveryAction(action, result) {
        this.state.recoveryActions.push({
            action,
            result,
            timestamp: new Date().toISOString()
        });
        if (this.state.recoveryActions.length > 100) {
            this.state.recoveryActions = this.state.recoveryActions.slice(-100);
        }
    }

    async loadState() {
        try {
            const data = await fs.readFile(HEALTH_LOG_FILE, 'utf8');
            const savedState = JSON.parse(data);
            this.state = { ...this.state, ...savedState };
        } catch (error) {
            await this.saveState();
        }
    }

    async saveState() {
        try {
            await fs.writeFile(
                HEALTH_LOG_FILE,
                JSON.stringify(this.state, null, 2)
            );
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    async stop() {
        try {
            this.isMonitoring = false;
            if (this.server) {
                await new Promise(resolve => this.server.close(resolve));
            }
            await this.saveState();
            console.log('✅ Auto Recovery System stopped gracefully');
        } catch (error) {
            console.error('❌ Error stopping Auto Recovery System:', error);
            throw error;
        }
    }
}

// Create and start the auto recovery system
const autoRecovery = new AutoRecoverySystem();

// Handle process termination
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal');
    await autoRecovery.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT signal');
    await autoRecovery.stop();
    process.exit(0);
});

// Start the system
autoRecovery.start().catch(error => {
    console.error('Failed to start Auto Recovery System:', error);
    process.exit(1);
});
