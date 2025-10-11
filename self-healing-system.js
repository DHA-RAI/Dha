const http = require('http');
const { exec } = require('child_process');
const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');

class SelfHealingSystem {
    constructor() {
        this.config = {
            healInterval: 15000,
            maxMemory: 450 * 1024 * 1024,
            maxCPU: 80,
            ports: {
                main: process.env.PORT || 3000,
                monitor: process.env.MONITOR_PORT || 3004,
                recovery: process.env.RECOVERY_PORT || 3001
            },
            apiKeys: new Map(),
            healthChecks: new Map()
        };
        
        this.state = {
            isHealing: false,
            lastHeal: null,
            healingActions: [],
            systemStatus: 'initializing',
            apiOverrides: new Map()
        };
    }

    async initialize() {
        try {
            await this.setupApiKeyManagement();
            await this.startHealthMonitoring();
            await this.enableRealTimeHealing();
            await this.setupFailoverSystem();
            console.log('✅ Self-healing system initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize self-healing system:', error);
            throw error;
        }
    }

    async setupApiKeyManagement() {
        const masterKey = process.env.MASTER_API_KEY || crypto.randomBytes(32).toString('hex');
        this.config.apiKeys.set('master', masterKey);
        
        // API key rotation system
        setInterval(() => {
            const rotationKey = crypto.randomBytes(32).toString('hex');
            this.config.apiKeys.set('rotation', rotationKey);
        }, 24 * 60 * 60 * 1000); // Rotate every 24 hours
    }

    async enableRealTimeHealing() {
        setInterval(async () => {
            if (this.state.isHealing) return;
            
            try {
                this.state.isHealing = true;
                await this.performHealthCheck();
                await this.optimizePerformance();
                await this.validateIntegrity();
                this.state.lastHeal = new Date().toISOString();
            } catch (error) {
                console.error('Healing cycle error:', error);
                await this.logHealingAction('error', error.message);
            } finally {
                this.state.isHealing = false;
            }
        }, this.config.healInterval);
    }

    async performHealthCheck() {
        const checks = [
            this.checkMemoryUsage(),
            this.checkCPUUsage(),
            this.checkDatabaseConnection(),
            this.validateAPIEndpoints(),
            this.checkFileSystemIntegrity()
        ];

        const results = await Promise.allSettled(checks);
        const failures = results.filter(r => r.status === 'rejected');
        
        if (failures.length > 0) {
            await this.triggerAutoRecovery(failures);
        }
    }

    async checkMemoryUsage() {
        const usage = process.memoryUsage();
        if (usage.heapUsed > this.config.maxMemory) {
            await this.logHealingAction('memory', 'High memory usage detected');
            global.gc && global.gc();
        }
    }

    async checkCPUUsage() {
        return new Promise((resolve) => {
            const startUsage = process.cpuUsage();
            setTimeout(() => {
                const endUsage = process.cpuUsage(startUsage);
                const totalUsage = (endUsage.user + endUsage.system) / 1000000;
                if (totalUsage > this.config.maxCPU) {
                    this.logHealingAction('cpu', 'High CPU usage detected');
                }
                resolve();
            }, 100);
        });
    }

    async validateIntegrity() {
        const criticalPaths = [
            '/api',
            '/auth',
            '/documents',
            '/health'
        ];

        for (const path of criticalPaths) {
            try {
                await this.validateEndpoint(path);
            } catch (error) {
                await this.repairEndpoint(path);
            }
        }
    }

    async validateEndpoint(path) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: this.config.ports.main,
                path: path,
                method: 'GET',
                timeout: 5000
            };

            const req = http.request(options, (res) => {
                if (res.statusCode >= 400) {
                    reject(new Error(`Endpoint ${path} returned ${res.statusCode}`));
                } else {
                    resolve();
                }
            });

            req.on('error', reject);
            req.end();
        });
    }

    async repairEndpoint(path) {
        await this.logHealingAction('repair', `Repairing endpoint: ${path}`);
        await this.restartService(path);
    }

    async restartService(service) {
        try {
            await this.executeCommand(`pm2 restart ${service}`);
            await this.logHealingAction('restart', `Service ${service} restarted successfully`);
        } catch (error) {
            console.error(`Failed to restart ${service}:`, error);
            await this.logHealingAction('error', `Failed to restart ${service}`);
        }
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }

    async logHealingAction(type, message) {
        const action = {
            type,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.state.healingActions.push(action);
        if (this.state.healingActions.length > 1000) {
            this.state.healingActions = this.state.healingActions.slice(-1000);
        }
        
        await fs.appendFile(
            'healing-actions.log',
            JSON.stringify(action) + '\n'
        );
    }

    getStatus() {
        return {
            status: this.state.systemStatus,
            lastHeal: this.state.lastHeal,
            isHealing: this.state.isHealing,
            recentActions: this.state.healingActions.slice(-10),
            apiOverrides: Array.from(this.state.apiOverrides.keys())
        };
    }
}

// Export the self-healing system
module.exports = new SelfHealingSystem();