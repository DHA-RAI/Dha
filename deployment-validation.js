const http = require('http');
const https = require('https');
const fs = require('fs').promises;

class DeploymentValidator {
    constructor() {
        this.results = {
            startTime: Date.now(),
            checks: [],
            status: 'pending'
        };
    }

    async validateDeployment() {
        console.log('Starting deployment validation...');
        
        try {
            // 1. Check port availability
            await this.checkPorts([3000, 3001, 3004, 3005]);

            // 2. Check health endpoints
            await this.checkHealthEndpoints();

            // 3. Verify file permissions
            await this.verifyFilePermissions();

            // 4. Check memory usage
            await this.checkMemoryUsage();

            // 5. Test recovery systems
            await this.testRecoverySystems();

            this.results.status = 'success';
            this.results.endTime = Date.now();
            
            await this.saveResults();
            
            console.log('✅ Deployment validation successful!');
            return true;
        } catch (error) {
            this.results.status = 'failed';
            this.results.error = error.message;
            this.results.endTime = Date.now();
            
            await this.saveResults();
            
            console.error('❌ Deployment validation failed:', error.message);
            return false;
        }
    }

    async checkPorts(ports) {
        console.log('Checking port availability...');
        
        for (const port of ports) {
            try {
                const server = http.createServer();
                await new Promise((resolve, reject) => {
                    server.listen(port, () => {
                        server.close();
                        resolve();
                    });
                    server.on('error', reject);
                });
                this.addCheck('port-check', port, 'success');
            } catch (error) {
                this.addCheck('port-check', port, 'failed', error.message);
                throw new Error(`Port ${port} is not available`);
            }
        }
    }

    async checkHealthEndpoints() {
        console.log('Checking health endpoints...');
        
        const endpoints = [
            { port: 3001, path: '/health' },
            { port: 3004, path: '/health' },
            { port: 3005, path: '/health' }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await this.httpGet(`http://localhost:${endpoint.port}${endpoint.path}`);
                if (response.status === 'healthy' || response.status === 'active') {
                    this.addCheck('health-check', endpoint.port, 'success');
                } else {
                    throw new Error(`Unhealthy status: ${response.status}`);
                }
            } catch (error) {
                this.addCheck('health-check', endpoint.port, 'failed', error.message);
                throw new Error(`Health check failed for port ${endpoint.port}`);
            }
        }
    }

    async verifyFilePermissions() {
        console.log('Verifying file permissions...');
        
        const criticalFiles = [
            'health-status.json',
            'ultra-robust-start-v2.sh',
            'config/ports.js'
        ];

        for (const file of criticalFiles) {
            try {
                await fs.access(file);
                this.addCheck('file-permissions', file, 'success');
            } catch (error) {
                this.addCheck('file-permissions', file, 'failed', error.message);
                throw new Error(`File permission check failed for ${file}`);
            }
        }
    }

    async checkMemoryUsage() {
        console.log('Checking memory usage...');
        
        const usage = process.memoryUsage();
        const maxAllowed = 450 * 1024 * 1024; // 450MB
        
        if (usage.heapTotal < maxAllowed) {
            this.addCheck('memory-check', 'heap', 'success');
        } else {
            this.addCheck('memory-check', 'heap', 'failed', 'Memory usage exceeds limit');
            throw new Error('Memory usage exceeds allowed limit');
        }
    }

    async testRecoverySystems() {
        console.log('Testing recovery systems...');
        
        try {
            // Test auto-recovery system
            await this.httpGet('http://localhost:3001/health');
            this.addCheck('recovery-check', 'auto-recovery', 'success');

            // Test health monitoring
            await this.httpGet('http://localhost:3004/health');
            this.addCheck('recovery-check', 'health-monitoring', 'success');

            // Test anti-sleep system
            await this.httpGet('http://localhost:3005/health');
            this.addCheck('recovery-check', 'anti-sleep', 'success');
        } catch (error) {
            this.addCheck('recovery-check', 'systems', 'failed', error.message);
            throw new Error('Recovery systems check failed');
        }
    }

    addCheck(type, target, status, error = null) {
        this.results.checks.push({
            type,
            target,
            status,
            error,
            timestamp: new Date().toISOString()
        });
    }

    async saveResults() {
        await fs.writeFile(
            'deployment-validation-results.json',
            JSON.stringify(this.results, null, 2)
        );
    }

    httpGet(url) {
        return new Promise((resolve, reject) => {
            const request = http.get(url, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            request.on('error', reject);
            request.end();
        });
    }
}

// Run validation
const validator = new DeploymentValidator();
validator.validateDeployment().then(success => {
    if (!success) {
        process.exit(1);
    }
}).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
});