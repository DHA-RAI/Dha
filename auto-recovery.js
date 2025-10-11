const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');

class AutoRecoverySystem {
    constructor() {
        this.config = {
            memoryThreshold: 0.9, // 90% of available memory
            cpuThreshold: 90, // 90% CPU usage
            recoveryAttempts: 0,
            maxRecoveryAttempts: 3,
            recoveryInterval: 60000 // 1 minute
        };
        this.healthChecks = {
            memory: () => this.checkMemory(),
            cpu: () => this.checkCpu(),
            connectivity: () => this.checkConnectivity()
        };

        // Create HTTP server
        this.server = http.createServer(this.handleRequest.bind(this));
    }
    }

    handleRequest(req, res) {
        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/health') {
            res.end(JSON.stringify({
                status: 'healthy',
                uptime: process.uptime(),
                recoveryAttempts: this.config.recoveryAttempts
            }));
            return;
        }

        if (req.url === '/status') {
            res.end(JSON.stringify({
                status: 'healthy',
                memory: this.checkMemory(),
                cpu: this.checkCpu(),
                uptime: process.uptime()
            }));
            return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
    }

    start() {
        console.log('Starting auto-recovery system...');
        
        // Start HTTP server
        this.server.listen(3001, () => {
            console.log('Auto-recovery HTTP server listening on port 3001');
        });
        
        this.startMonitoring();
        this.setupProcessHandlers();
    }

    startMonitoring() {
        // Run health checks every minute
        this.monitorInterval = setInterval(() => {
            this.runHealthChecks();
        }, 60000);

        // Reset recovery attempts counter every hour
        setInterval(() => {
            this.config.recoveryAttempts = 0;
        }, 3600000);
    }

    setupProcessHandlers() {
        process.on('uncaughtException', (error) => {
            this.handleError('Uncaught Exception', error);
        });

        process.on('unhandledRejection', (error) => {
            this.handleError('Unhandled Rejection', error);
        });

        process.on('SIGTERM', () => {
            this.cleanup();
        });
    }

    async runHealthChecks() {
        try {
            const results = await Promise.all([
                this.healthChecks.memory(),
                this.healthChecks.cpu(),
                this.healthChecks.connectivity()
            ]);

            if (results.some(result => !result.healthy)) {
                this.initiateRecovery();
            }
        } catch (error) {
            this.handleError('Health Check Error', error);
        }
    }

    checkMemory() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUsage = (totalMem - freeMem) / totalMem;

        return {
            healthy: memoryUsage < this.config.memoryThreshold,
            metric: 'memory',
            value: memoryUsage
        };
    }

    checkCpu() {
        return new Promise((resolve) => {
            const startUsage = process.cpuUsage();
            setTimeout(() => {
                const endUsage = process.cpuUsage(startUsage);
                const totalUsage = (endUsage.user + endUsage.system) / 1000000;
                resolve({
                    healthy: totalUsage < this.config.cpuThreshold,
                    metric: 'cpu',
                    value: totalUsage
                });
            }, 100);
        });
    }

    checkConnectivity() {
        return new Promise((resolve) => {
            exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health', (error, stdout) => {
                resolve({
                    healthy: !error && stdout === '200',
                    metric: 'connectivity',
                    value: stdout
                });
            });
        });
    }

    async initiateRecovery() {
        if (this.config.recoveryAttempts >= this.config.maxRecoveryAttempts) {
            this.handleError('Max recovery attempts reached', new Error('Recovery limit exceeded'));
            return;
        }

        this.config.recoveryAttempts++;
        console.log(`Initiating recovery attempt ${this.config.recoveryAttempts}...`);

        try {
            // Attempt graceful recovery steps
            await this.performMemoryRecovery();
            await this.restartServer();
            
            console.log('Recovery completed successfully');
        } catch (error) {
            this.handleError('Recovery failed', error);
        }
    }

    async performMemoryRecovery() {
        return new Promise((resolve) => {
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            // Clear require cache to free up memory
            Object.keys(require.cache).forEach((key) => {
                delete require.cache[key];
            });

            resolve();
        });
    }

    async restartServer() {
        return new Promise((resolve, reject) => {
            exec('npm run start', (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    handleError(context, error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            context,
            error: error.toString(),
            stack: error.stack
        };

        console.error('Error in auto-recovery:', errorLog);
        fs.appendFileSync('auto-recovery.log', JSON.stringify(errorLog) + '\n');

        if (this.config.recoveryAttempts >= this.config.maxRecoveryAttempts) {
            console.error('Critical: Max recovery attempts reached. Manual intervention required.');
            process.exit(1);
        }
    }

    cleanup() {
        clearInterval(this.monitorInterval);
        console.log('Auto-recovery system stopped');
        process.exit(0);
    }
}

// Start the auto-recovery system
const recovery = new AutoRecoverySystem();
recovery.start();