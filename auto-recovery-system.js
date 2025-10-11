const http = require('http');const http = require('http');

const { exec } = require('child_process');const { exec } = require('child_process');

const fs = require('fs').promises;const fs = require('fs').promises;

const path = require('path');const path = require('path');

const os = require('os');

// Configuration

// Configurationconst CHECK_INTERVAL = 30000; // 30 seconds

const CHECK_INTERVAL = 30000; // 30 secondsconst RESTART_DELAY = 5000; // 5 seconds

const RESTART_DELAY = 5000; // 5 secondsconst MAX_MEMORY_USAGE = 450 * 1024 * 1024; // 450MB max memory usage

const MAX_MEMORY_USAGE = 450 * 1024 * 1024; // 450MB max memory usageconst MAX_RESTART_ATTEMPTS = 5;

const MAX_RESTART_ATTEMPTS = 5;const HEALTH_CHECK_PORT = process.env.AUTO_RECOVERY_PORT || 3001;

const HEALTH_CHECK_PORT = process.env.AUTO_RECOVERY_PORT || 3001;const HEALTH_LOG_FILE = 'auto-recovery-health.json';

const HEALTH_LOG_FILE = 'auto-recovery-health.json';

const BACKUP_LOG_FILE = 'auto-recovery-health.backup.json';class AutoRecoverySystem {

const MAX_CPU_USAGE = 80; // 80% max CPU usage    constructor() {

const DISK_SPACE_THRESHOLD = 90; // 90% disk usage threshold        this.state = {

            lastRestartTime: 0,

class AutoRecoverySystem {            restartCount: 0,

    constructor() {            status: 'starting',

        this.state = {            startTime: Date.now(),

            lastRestartTime: 0,            lastCheck: null,

            restartCount: 0,            errors: [],

            status: 'starting',            recoveryActions: []

            startTime: Date.now(),        };

            lastCheck: null,        this.server = null;

            errors: [],        this.isMonitoring = false;

            recoveryActions: [],    }

            healthHistory: [],

            processStats: {},    async start() {

            systemMetrics: {}        try {

        };            await this.loadState();

        this.server = null;            await this.startHealthServer();

        this.isMonitoring = false;            await this.startMonitoring();

        this.healthCheckInterval = null;            this.state.status = 'healthy';

        this.metricsInterval = null;            await this.saveState();

        this.retryCount = 0;            console.log('✅ Auto Recovery System started successfully');

    }        } catch (error) {

            console.error('❌ Failed to start Auto Recovery System:', error);

    async start() {            throw error;

        try {        }

            await this.loadState();    }

            await this.startHealthServer();

            await this.startMonitoring();    async startHealthServer() {

            await this.startMetricsCollection();        return new Promise((resolve, reject) => {

            await this.validateSystem();            try {

            this.state.status = 'healthy';                this.server = http.createServer(async (req, res) => {

            await this.saveState();                    try {

            console.log('✅ Auto Recovery System started successfully');                        if (req.url === '/health') {

        } catch (error) {                            const health = await this.getHealthStatus();

            console.error('❌ Failed to start Auto Recovery System:', error);                            res.writeHead(200, {

            await this.handleStartupError(error);                                'Content-Type': 'application/json',

            throw error;                                'Cache-Control': 'no-cache'

        }                            });

    }                            res.end(JSON.stringify(health));

                        } else if (req.url === '/metrics') {

    async validateSystem() {                            const metrics = await this.getMetrics();

        const checks = [                            res.writeHead(200, { 'Content-Type': 'application/json' });

            this.checkDiskSpace(),                            res.end(JSON.stringify(metrics));

            this.checkCPUUsage(),                        } else {

            this.checkMemoryUsage(),                            res.writeHead(404);

            this.checkProcessHealth(),                            res.end();

            this.validateConfig()                        }

        ];                    } catch (error) {

                        console.error('Health check error:', error);

        await Promise.all(checks);                        res.writeHead(500, { 'Content-Type': 'application/json' });

    }                        res.end(JSON.stringify({ status: 'error', error: error.message }));

                    }

    async checkDiskSpace() {                });

        try {

            const { stdout } = await this.executeCommand('df -h / --output=pcent');                this.server.on('error', (error) => {

            const usage = parseInt(stdout.trim().split('\\n')[1].trim().replace('%', ''));                    console.error('Health server error:', error);

                                this.logError('health_server', error);

            if (usage > DISK_SPACE_THRESHOLD) {                    reject(error);

                throw new Error(`Disk usage critical: ${usage}%`);                });

            }

                            this.server.listen(HEALTH_CHECK_PORT, () => {

            this.state.systemMetrics.diskUsage = usage;                    console.log(`✅ Health check server running on port ${HEALTH_CHECK_PORT}`);

        } catch (error) {                    resolve();

            this.logError('disk_space', error);                });

            throw error;            } catch (error) {

        }                console.error('Failed to start health server:', error);

    }                reject(error);

            }

    async checkCPUUsage() {        });

        const cpus = os.cpus();    }

        const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);

        const totalTick = cpus.reduce((acc, cpu) =>     async getHealthStatus() {

            acc + Object.values(cpu.times).reduce((a, b) => a + b), 0);        const usage = process.memoryUsage();

                return {

        const usage = 100 - (totalIdle / totalTick * 100);            status: this.state.status,

                    uptime: process.uptime(),

        if (usage > MAX_CPU_USAGE) {            memory: {

            this.logError('cpu_usage', new Error(`CPU usage too high: ${usage.toFixed(2)}%`));                used: usage.heapUsed,

            return false;                total: usage.heapTotal,

        }                external: usage.external

                    },

        this.state.systemMetrics.cpuUsage = usage;            lastCheck: this.state.lastCheck,

        return true;            restartCount: this.state.restartCount,

    }            lastRestart: this.state.lastRestartTime,

            recoveryActions: this.state.recoveryActions.slice(-5)

    async startMetricsCollection() {        };

        this.metricsInterval = setInterval(async () => {    }

            try {

                const metrics = await this.collectMetrics();    async getMetrics() {

                this.state.systemMetrics = { ...this.state.systemMetrics, ...metrics };        return {

                await this.saveState();            restarts: this.state.restartCount,

            } catch (error) {            errors: this.state.errors.length,

                this.logError('metrics_collection', error);            lastRecoveryAction: this.state.recoveryActions[this.state.recoveryActions.length - 1],

            }            memoryUsage: process.memoryUsage().heapUsed,

        }, CHECK_INTERVAL / 2);            uptime: process.uptime()

    }        };

    }

    async collectMetrics() {

        return {    async checkMemoryUsage() {

            timestamp: new Date().toISOString(),        const usage = process.memoryUsage();

            memory: process.memoryUsage(),        const isHealthy = usage.heapTotal < MAX_MEMORY_USAGE;

            cpu: await this.checkCPUUsage(),        if (!isHealthy) {

            uptime: process.uptime(),            this.logError('memory_usage', new Error('Memory usage exceeded limit'));

            processCount: (await this.executeCommand('pm2 list')).split('\\n').length - 3        }

        };        return isHealthy;

    }    }



    async checkProcessHealth() {    async restartApp() {

        try {        const currentTime = Date.now();

            const processes = await this.executeCommand('pm2 jlist');        if (currentTime - this.state.lastRestartTime < RESTART_DELAY) {

            const processList = JSON.parse(processes);            console.log('⚠️ Too many restart attempts, waiting...');

                        return false;

            for (const proc of processList) {        }

                if (proc.pm2_env.status !== 'online') {

                    this.logError('process_health', new Error(`Process ${proc.name} is ${proc.pm2_env.status}`));        if (this.state.restartCount >= MAX_RESTART_ATTEMPTS) {

                    await this.restartApp(proc.name);            console.log('❌ Maximum restart attempts reached, manual intervention required');

                }            this.logError('max_restarts', new Error('Maximum restart attempts reached'));

            }            return false;

        } catch (error) {        }

            this.logError('process_health_check', error);

        }        try {

    }            console.log('🔄 Restarting application...');

            this.state.lastRestartTime = currentTime;

    async startHealthServer() {            this.state.restartCount++;

        return new Promise((resolve, reject) => {            await this.executeCommand('pm2 restart all');

            try {            this.logRecoveryAction('restart', 'Application restarted successfully');

                this.server = http.createServer(async (req, res) => {            await this.saveState();

                    try {            console.log('✅ Application restarted successfully');

                        const routes = {            return true;

                            '/health': async () => this.getHealthStatus(),        } catch (error) {

                            '/metrics': async () => this.getMetrics(),            this.logError('restart', error);

                            '/debug': async () => this.getDebugInfo(),            console.error('❌ Failed to restart application:', error);

                            '/recovery': async () => this.getRecoveryStatus(),            return false;

                            '/reset': async () => this.resetSystem()        }

                        };    }



                        const handler = routes[req.url];    async executeCommand(command) {

                        if (handler) {        return new Promise((resolve, reject) => {

                            const data = await handler();            exec(command, (error, stdout, stderr) => {

                            res.writeHead(200, {                if (error) {

                                'Content-Type': 'application/json',                    reject(error);

                                'Cache-Control': 'no-cache'                    return;

                            });                }

                            res.end(JSON.stringify(data));                resolve(stdout);

                        } else {            });

                            res.writeHead(404);        });

                            res.end();    }

                        }

                    } catch (error) {    async startMonitoring() {

                        this.logError('health_request', error);        if (this.isMonitoring) {

                        res.writeHead(500, { 'Content-Type': 'application/json' });            console.log('⚠️ Monitoring already active');

                        res.end(JSON.stringify({ status: 'error', error: error.message }));            return;

                    }        }

                });

        this.isMonitoring = true;

                this.server.on('error', (error) => {        console.log('✅ Starting system monitoring');

                    this.logError('health_server', error);

                    reject(error);        setInterval(async () => {

                });            try {

                this.state.lastCheck = new Date().toISOString();

                this.server.listen(HEALTH_CHECK_PORT, () => {                const memoryOk = await this.checkMemoryUsage();

                    console.log(`✅ Health check server running on port ${HEALTH_CHECK_PORT}`);                if (!memoryOk) {

                    resolve();                    await this.restartApp();

                });                }

            } catch (error) {                await this.saveState();

                console.error('Failed to start health server:', error);            } catch (error) {

                reject(error);                console.error('❌ Monitoring error:', error);

            }                this.logError('monitoring', error);

        });            }

    }        }, CHECK_INTERVAL);

    }

    async getHealthStatus() {

        const status = {    logError(type, error) {

            status: this.state.status,        this.state.errors.push({

            uptime: process.uptime(),            type,

            memory: process.memoryUsage(),            message: error.message,

            lastCheck: this.state.lastCheck,            timestamp: new Date().toISOString()

            restartCount: this.state.restartCount,        });

            lastRestart: this.state.lastRestartTime,        if (this.state.errors.length > 100) {

            systemMetrics: this.state.systemMetrics,            this.state.errors = this.state.errors.slice(-100);

            recoveryActions: this.state.recoveryActions.slice(-5),        }

            processStats: this.state.processStats    }

        };

    logRecoveryAction(action, result) {

        this.state.healthHistory.push({        this.state.recoveryActions.push({

            timestamp: new Date().toISOString(),            action,

            status: status.status            result,

        });            timestamp: new Date().toISOString()

        });

        if (this.state.healthHistory.length > 100) {        if (this.state.recoveryActions.length > 100) {

            this.state.healthHistory = this.state.healthHistory.slice(-100);            this.state.recoveryActions = this.state.recoveryActions.slice(-100);

        }        }

    }

        return status;

    }    async loadState() {

        try {

    async getDebugInfo() {            const data = await fs.readFile(HEALTH_LOG_FILE, 'utf8');

        return {            const savedState = JSON.parse(data);

            state: this.state,            this.state = { ...this.state, ...savedState };

            system: {        } catch (error) {

                platform: process.platform,            await this.saveState();

                arch: process.arch,        }

                version: process.version,    }

                memory: process.memoryUsage(),

                cpu: os.cpus(),    async saveState() {

                uptime: os.uptime()        try {

            },            await fs.writeFile(

            lastErrors: this.state.errors.slice(-10)                HEALTH_LOG_FILE,

        };                JSON.stringify(this.state, null, 2)

    }            );

        } catch (error) {

    async resetSystem() {            console.error('Failed to save state:', error);

        if (this.state.status === 'resetting') {        }

            return { status: 'already_resetting' };    }

        }

    async stop() {

        this.state.status = 'resetting';        try {

        await this.saveState();            this.isMonitoring = false;

            if (this.server) {

        try {                await new Promise(resolve => this.server.close(resolve));

            await this.stop();            }

            this.state = {            await this.saveState();

                lastRestartTime: 0,            console.log('✅ Auto Recovery System stopped gracefully');

                restartCount: 0,        } catch (error) {

                status: 'starting',            console.error('❌ Error stopping Auto Recovery System:', error);

                startTime: Date.now(),            throw error;

                lastCheck: null,        }

                errors: [],    }

                recoveryActions: [],}

                healthHistory: [],

                processStats: {},// Create and start the auto recovery system

                systemMetrics: {}const autoRecovery = new AutoRecoverySystem();

            };

            await this.saveState();// Handle process termination

            await this.start();process.on('SIGTERM', async () => {

            return { status: 'reset_complete' };    console.log('Received SIGTERM signal');

        } catch (error) {    await autoRecovery.stop();

            this.logError('reset', error);    process.exit(0);

            return { status: 'reset_failed', error: error.message };});

        }

    }process.on('SIGINT', async () => {

    console.log('Received SIGINT signal');

    async startMonitoring() {    await autoRecovery.stop();

        if (this.isMonitoring) {    process.exit(0);

            console.log('⚠️ Monitoring already active');});

            return;

        }// Start the system

autoRecovery.start().catch(error => {

        this.isMonitoring = true;    console.error('Failed to start Auto Recovery System:', error);

        console.log('✅ Starting system monitoring');    process.exit(1);

});

        this.healthCheckInterval = setInterval(async () => {
            try {
                this.state.lastCheck = new Date().toISOString();
                await this.runHealthChecks();
                await this.saveState();
            } catch (error) {
                console.error('❌ Monitoring error:', error);
                this.logError('monitoring', error);
                await this.handleMonitoringError(error);
            }
        }, CHECK_INTERVAL);
    }

    async runHealthChecks() {
        const checks = await Promise.allSettled([
            this.checkMemoryUsage(),
            this.checkCPUUsage(),
            this.checkDiskSpace(),
            this.checkProcessHealth()
        ]);

        const failed = checks.filter(check => check.status === 'rejected');
        if (failed.length > 0) {
            await this.handleFailedChecks(failed);
        }
    }

    async handleFailedChecks(failed) {
        for (const failure of failed) {
            this.logError('health_check', failure.reason);
            await this.attemptRecovery(failure.reason);
        }
    }

    async attemptRecovery(error) {
        this.state.status = 'recovering';
        await this.saveState();

        try {
            if (error.message.includes('memory')) {
                await this.handleMemoryIssue();
            } else if (error.message.includes('CPU')) {
                await this.handleCPUIssue();
            } else if (error.message.includes('disk')) {
                await this.handleDiskIssue();
            } else {
                await this.restartApp();
            }

            this.state.status = 'healthy';
            await this.saveState();
        } catch (recoveryError) {
            this.logError('recovery', recoveryError);
            this.state.status = 'error';
            await this.saveState();
            throw recoveryError;
        }
    }

    async handleMemoryIssue() {
        global.gc && global.gc();
        if (this.state.restartCount < MAX_RESTART_ATTEMPTS) {
            await this.restartApp();
        } else {
            throw new Error('Memory issues persist after max restart attempts');
        }
    }

    async handleCPUIssue() {
        const processes = await this.executeCommand('pm2 jlist');
        const processList = JSON.parse(processes);
        
        for (const proc of processList) {
            if (proc.monit.cpu > 80) {
                await this.restartApp(proc.name);
            }
        }
    }

    async handleDiskIssue() {
        try {
            // Clean up logs
            await this.executeCommand('pm2 flush');
            // Clean npm cache
            await this.executeCommand('npm cache clean --force');
            // Remove old npm logs
            await this.executeCommand('rm -rf ~/.npm/_logs/*');
        } catch (error) {
            this.logError('disk_cleanup', error);
            throw error;
        }
    }

    async restartApp(appName = 'all') {
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
            console.log(`🔄 Restarting ${appName}...`);
            this.state.lastRestartTime = currentTime;
            this.state.restartCount++;
            await this.executeCommand(`pm2 restart ${appName}`);
            this.logRecoveryAction('restart', `Application ${appName} restarted successfully`);
            await this.saveState();
            console.log('✅ Application restarted successfully');
            return true;
        } catch (error) {
            this.logError('restart', error);
            console.error('❌ Failed to restart application:', error);
            return false;
        }
    }

    async handleStartupError(error) {
        this.logError('startup', error);
        
        if (++this.retryCount <= 3) {
            console.log(`⏳ Retrying startup (attempt ${this.retryCount}/3)...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return this.start();
        }
        
        this.state.status = 'error';
        await this.saveState();
    }

    async handleMonitoringError(error) {
        this.state.status = 'error';
        await this.saveState();
        
        if (error.message.includes('ECONNREFUSED')) {
            await this.restartApp();
        }
    }

    async saveState() {
        try {
            // Save to main file
            await fs.writeFile(
                HEALTH_LOG_FILE,
                JSON.stringify(this.state, null, 2)
            );
            
            // Save backup
            await fs.writeFile(
                BACKUP_LOG_FILE,
                JSON.stringify(this.state, null, 2)
            );
        } catch (error) {
            console.error('Failed to save state:', error);
            this.logError('state_save', error);
        }
    }

    async loadState() {
        try {
            const data = await fs.readFile(HEALTH_LOG_FILE, 'utf8');
            this.state = { ...this.state, ...JSON.parse(data) };
        } catch (mainError) {
            try {
                // Try loading from backup
                const backupData = await fs.readFile(BACKUP_LOG_FILE, 'utf8');
                this.state = { ...this.state, ...JSON.parse(backupData) };
            } catch (backupError) {
                await this.saveState();
            }
        }
    }

    async stop() {
        try {
            this.isMonitoring = false;
            clearInterval(this.healthCheckInterval);
            clearInterval(this.metricsInterval);
            
            if (this.server) {
                await new Promise(resolve => this.server.close(resolve));
            }
            
            await this.saveState();
            console.log('✅ Auto Recovery System stopped gracefully');
        } catch (error) {
            console.error('❌ Error stopping Auto Recovery System:', error);
            this.logError('shutdown', error);
            throw error;
        }
    }

    async validateConfig() {
        const requiredEnv = [
            'NODE_ENV',
            'AUTO_RECOVERY_PORT',
            'PM2_HOME'
        ];

        const missing = requiredEnv.filter(env => !process.env[env]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    logError(type, error) {
        const errorEntry = {
            type,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };

        this.state.errors.push(errorEntry);
        if (this.state.errors.length > 100) {
            this.state.errors = this.state.errors.slice(-100);
        }

        // Log to console for immediate visibility
        console.error(`[${type}] ${error.message}`);
    }

    logRecoveryAction(action, result) {
        const recoveryEntry = {
            action,
            result,
            timestamp: new Date().toISOString(),
            systemState: {
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        };

        this.state.recoveryActions.push(recoveryEntry);
        if (this.state.recoveryActions.length > 100) {
            this.state.recoveryActions = this.state.recoveryActions.slice(-100);
        }

        // Log to console for immediate visibility
        console.log(`🔧 Recovery Action: ${action} - ${result}`);
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

process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    autoRecovery.logError('uncaught_exception', error);
    await autoRecovery.stop();
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled Rejection:', reason);
    autoRecovery.logError('unhandled_rejection', reason);
});

// Start the system
autoRecovery.start().catch(error => {
    console.error('Failed to start Auto Recovery System:', error);
    process.exit(1);
});