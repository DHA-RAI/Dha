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
        
        // Create HTTP server for health checks
        this.server = http.createServer(this.handleRequest.bind(this));
        this.start();
    }

    handleRequest(req, res) {
        res.setHeader('Content-Type', 'application/json');

        switch (req.url) {
            case '/health':
                res.end(JSON.stringify({
                    status: 'healthy',
                    uptime: process.uptime(),
                    recoveryAttempts: this.config.recoveryAttempts
                }));
                break;

            case '/status':
                const memory = this.checkMemory();
                res.end(JSON.stringify({
                    status: 'healthy',
                    memory,
                    uptime: process.uptime()
                }));
                break;

            default:
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not found' }));
        }
    }

    start() {
        // Start HTTP server
        this.server.listen(3001, () => {
            console.log('Auto-recovery HTTP server listening on port 3001');
        });

        // Start monitoring
        this.monitorInterval = setInterval(() => {
            this.runHealthChecks();
        }, this.config.recoveryInterval);

        // Reset recovery attempts counter every hour
        setInterval(() => {
            this.config.recoveryAttempts = 0;
        }, 3600000);

        // Setup process handlers
        process.on('uncaughtException', (error) => {
            this.handleError('Uncaught Exception', error);
        });

        process.on('unhandledRejection', (error) => {
            this.handleError('Unhandled Rejection', error);
        });

        process.on('SIGTERM', () => {
            this.cleanup();
        });

        console.log('Auto-recovery system started');
    }

    runHealthChecks() {
        const memory = this.checkMemory();
        const cpu = this.checkCpu();

        if (!memory.healthy || !cpu.healthy) {
            this.initiateRecovery();
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
        const cpuUsage = os.loadavg()[0];
        return {
            healthy: cpuUsage < this.config.cpuThreshold,
            metric: 'cpu',
            value: cpuUsage
        };
    }

    initiateRecovery() {
        if (this.config.recoveryAttempts >= this.config.maxRecoveryAttempts) {
            this.handleError('Max recovery attempts reached', new Error('Recovery limit exceeded'));
            return;
        }

        this.config.recoveryAttempts++;
        console.log(`Initiating recovery attempt ${this.config.recoveryAttempts}...`);

        this.performRecovery();
    }

    performRecovery() {
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        // Clear require cache
        Object.keys(require.cache).forEach((key) => {
            delete require.cache[key];
        });

        console.log('Recovery actions completed');
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
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        if (this.server) {
            this.server.close();
        }
        console.log('Auto-recovery system stopped');
        process.exit(0);
    }
}

// Start the auto-recovery system
new AutoRecoverySystem();