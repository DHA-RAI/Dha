import { exec } from 'child_process';
import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

declare global {
    interface Global {
        gc?: () => void;
    }
}

interface SystemConfig {
    PORTS: {
        HEALTH: number;
        APP: number;
    };
    THRESHOLDS: {
        MEMORY: number;
        CPU: number;
        DISK: number;
        MAX_RESTART_ATTEMPTS: number;
        RECOVERY_INTERVAL: number;
    };
    INTERVALS: {
        HEALTH_CHECK: number;
        METRICS: number;
        STATE_SAVE: number;
    };
    FILES: {
        STATE: string;
        LOGS: string;
        METRICS: string;
    };
}

interface SystemState {
    status: string;
    startTime: number;
    lastCheck: string | null;
    restartAttempts: number;
    errors: ErrorData[];
    metrics: {
        memory: HealthCheck;
        cpu: HealthCheck;
        disk: HealthCheck;
        uptime: number;
    };
}

interface ErrorData {
    type: string;
    message: string;
    stack?: string;
    timestamp: string;
}

interface HealthCheck {
    healthy?: boolean;
    type?: string;
    usage?: number;
    details?: any;
}

interface ProcessInfo {
    name: string;
    status: string;
}

export class AutoRecoverySystem {
    private state: SystemState;
    private server!: Server;
    private intervals: { [key: string]: NodeJS.Timeout };
    private config: SystemConfig;

    constructor() {
        this.config = {
            PORTS: {
                HEALTH: parseInt(process.env.HEALTH_PORT || '3002', 10),
                APP: parseInt(process.env.APP_PORT || '3000', 10)
            },
            THRESHOLDS: {
                MEMORY: 0.85, // 85% of available memory
                CPU: 80, // 80% CPU usage
                DISK: 85, // 85% disk usage
                MAX_RESTART_ATTEMPTS: 3,
                RECOVERY_INTERVAL: 60000 // 1 minute
            },
            INTERVALS: {
                HEALTH_CHECK: 30000, // 30 seconds
                METRICS: 15000, // 15 seconds
                STATE_SAVE: 60000 // 1 minute
            },
            FILES: {
                STATE: 'recovery-state.json',
                LOGS: 'recovery-logs.json',
                METRICS: 'system-metrics.json'
            }
        };

        this.state = {
            status: 'initializing',
            startTime: Date.now(),
            lastCheck: null,
            restartAttempts: 0,
            errors: [],
            metrics: {
                memory: {},
                cpu: {},
                disk: {},
                uptime: 0
            }
        };

        this.intervals = {};
    }

    async start(): Promise<void> {
        try {
            await this.initialize();
            await this.startServer();
            await this.startMonitoring();
            this.state.status = 'running';
            console.log('✅ Auto-recovery system started successfully');
        } catch (error) {
            await this.handleError('startup', error as Error);
            process.exit(1);
        }
    }

    private async initialize(): Promise<void> {
        try {
            await this.loadState();
            this.setupEventHandlers();
            this.state.startTime = Date.now();
            this.state.status = 'initializing';
            await this.saveState();
        } catch (error) {
            throw new Error(`Initialization failed: ${(error as Error).message}`);
        }
    }

    private setupEventHandlers(): void {
        process.on('uncaughtException', async (error: Error) => {
            await this.handleError('uncaught', error);
        });

        process.on('unhandledRejection', async (error: Error) => {
            await this.handleError('unhandled', error);
        });

        ['SIGTERM', 'SIGINT'].forEach(signal => {
            process.on(signal, async () => {
                await this.shutdown(signal);
            });
        });
    }

    private async startServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
                try {
                    await this.handleRequest(req, res);
                } catch (error) {
                    res.writeHead(500).end(JSON.stringify({ error: (error as Error).message }));
                }
            });

            this.server.listen(this.config.PORTS.HEALTH, () => {
                console.log(`Health server running on port ${this.config.PORTS.HEALTH}`);
                resolve();
            });

            this.server.on('error', reject);
        });
    }

    private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const routes: { [key: string]: () => Promise<any> } = {
            '/health': async () => this.getHealth(),
            '/metrics': async () => this.getMetrics(),
            '/status': async () => this.getStatus(),
            '/reset': async () => this.resetSystem()
        };

        const handler = routes[req.url || ''];
        if (!handler) {
            res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
            return;
        }

        const data = await handler();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    private async startMonitoring(): Promise<void> {
        this.intervals.health = setInterval(
            () => this.runHealthCheck().catch(e => this.handleError('health_check', e as Error)),
            this.config.INTERVALS.HEALTH_CHECK
        );

        this.intervals.metrics = setInterval(
            () => this.updateMetrics().catch(e => this.handleError('metrics', e as Error)),
            this.config.INTERVALS.METRICS
        );

        this.intervals.state = setInterval(
            () => this.saveState().catch(e => this.handleError('state_save', e as Error)),
            this.config.INTERVALS.STATE_SAVE
        );
    }

    private async runHealthCheck(): Promise<void> {
        const checks = await Promise.all([
            this.checkMemory(),
            this.checkCPU(),
            this.checkDisk(),
            this.checkProcesses()
        ]);

        const failed = checks.filter(check => !check.healthy);
        if (failed.length > 0) {
            await this.handleHealthIssues(failed);
        }

        this.state.lastCheck = new Date().toISOString();
        await this.saveState();
    }

    private async checkMemory(): Promise<HealthCheck> {
        const used = process.memoryUsage();
        const total = os.totalmem();
        const usage = used.heapUsed / total;

        return {
            healthy: usage < this.config.THRESHOLDS.MEMORY,
            type: 'memory',
            usage,
            details: used
        };
    }

    private async checkCPU(): Promise<HealthCheck> {
        const cpus = os.cpus();
        const usage = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total);
        }, 0) / cpus.length;

        return {
            healthy: usage < this.config.THRESHOLDS.CPU / 100,
            type: 'cpu',
            usage: usage * 100
        };
    }

    private async checkDisk(): Promise<HealthCheck> {
        const { stdout } = await this.execCommand('df -h / --output=pcent');
        const usage = parseInt(stdout.trim().split('\n')[1], 10);

        return {
            healthy: usage < this.config.THRESHOLDS.DISK,
            type: 'disk',
            usage
        };
    }

    private async checkProcesses(): Promise<HealthCheck> {
        const { stdout } = await this.execCommand('pm2 jlist');
        const processes = JSON.parse(stdout);
        const unhealthy = processes.filter((p: any) => p.pm2_env.status !== 'online');

        return {
            healthy: unhealthy.length === 0,
            type: 'processes',
            details: unhealthy.map((p: any) => ({
                name: p.name,
                status: p.pm2_env.status
            }))
        };
    }

    private async handleHealthIssues(issues: HealthCheck[]): Promise<void> {
        for (const issue of issues) {
            switch (issue.type) {
                case 'memory':
                    await this.handleMemoryIssue();
                    break;
                case 'cpu':
                    await this.handleCPUIssue();
                    break;
                case 'disk':
                    await this.handleDiskIssue();
                    break;
                case 'processes':
                    await this.handleProcessIssue(issue.details);
                    break;
            }
        }
    }

    private async handleMemoryIssue(): Promise<void> {
        if (global.gc) {
            global.gc();
        }
        await this.restartService('all');
    }

    private async handleCPUIssue(): Promise<void> {
        const { stdout } = await this.execCommand('pm2 jlist');
        const processes = JSON.parse(stdout);
        
        for (const proc of processes) {
            if (proc.monit.cpu > this.config.THRESHOLDS.CPU) {
                await this.restartService(proc.name);
            }
        }
    }

    private async handleDiskIssue(): Promise<void> {
        await this.execCommand('pm2 flush');
        await this.execCommand('npm cache clean --force');
        await this.execCommand('rm -rf ~/.npm/_logs/*');
    }

    private async handleProcessIssue(processes: ProcessInfo[]): Promise<void> {
        for (const proc of processes) {
            await this.restartService(proc.name);
        }
    }

    private async restartService(name: string): Promise<void> {
        if (this.state.restartAttempts >= this.config.THRESHOLDS.MAX_RESTART_ATTEMPTS) {
            throw new Error('Max restart attempts reached');
        }

        try {
            await this.execCommand(`pm2 restart ${name}`);
            this.state.restartAttempts++;
            await this.saveState();
        } catch (error) {
            throw new Error(`Failed to restart ${name}: ${(error as Error).message}`);
        }
    }

    private async execCommand(command: string): Promise<{ stdout: string; stderr: string }> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve({ stdout, stderr });
            });
        });
    }

    private async updateMetrics(): Promise<void> {
        this.state.metrics = {
            memory: await this.checkMemory(),
            cpu: await this.checkCPU(),
            disk: await this.checkDisk(),
            uptime: process.uptime()
        };
        await this.saveState();
    }

    private async handleError(type: string, error: Error): Promise<void> {
        const errorData: ErrorData = {
            type,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };

        this.state.errors.push(errorData);
        if (this.state.errors.length > 100) {
            this.state.errors = this.state.errors.slice(-100);
        }

        await this.saveState();
        console.error(`[${type}] ${error.message}`);
    }

    private async loadState(): Promise<void> {
        try {
            const data = await fs.readFile(this.config.FILES.STATE, 'utf8');
            this.state = { ...this.state, ...JSON.parse(data) };
        } catch (error) {
            await this.saveState();
        }
    }

    private async saveState(): Promise<void> {
        await fs.writeFile(
            this.config.FILES.STATE,
            JSON.stringify(this.state, null, 2)
        );
    }

    private async resetSystem(): Promise<{ status: string }> {
        const oldState = { ...this.state };
        try {
            this.state = {
                status: 'initializing',
                startTime: Date.now(),
                lastCheck: null,
                restartAttempts: 0,
                errors: [],
                metrics: {
                    memory: {},
                    cpu: {},
                    disk: {},
                    uptime: 0
                }
            };
            await this.saveState();
            return { status: 'reset_successful' };
        } catch (error) {
            this.state = oldState;
            throw new Error('Reset failed: ' + (error as Error).message);
        }
    }

    private getHealth(): { status: string; uptime: number; lastCheck: string | null; restartAttempts: number } {
        return {
            status: this.state.status,
            uptime: process.uptime(),
            lastCheck: this.state.lastCheck,
            restartAttempts: this.state.restartAttempts
        };
    }

    private getMetrics(): any {
        return {
            ...this.state.metrics,
            timestamp: new Date().toISOString()
        };
    }

    private getStatus(): SystemState & { timestamp: string } {
        return {
            ...this.state,
            timestamp: new Date().toISOString()
        };
    }

    private async shutdown(signal: string): Promise<void> {
        console.log(`Received ${signal}, shutting down...`);
        
        Object.values(this.intervals).forEach(interval => {
            if (interval) {
                clearTimeout(interval as NodeJS.Timeout);
            }
        });

        if (this.server) {
            await new Promise<void>(resolve => this.server.close(() => resolve()));
        }

        await this.saveState();
        process.exit(0);
    }
}

// Start the system
if (require.main === module) {
    const recovery = new AutoRecoverySystem();
    recovery.start().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}