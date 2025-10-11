const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class DeploymentValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            tests: []
        };
    }

    async validateAll() {
        console.log('🔍 Starting comprehensive validation...');
        
        await this.runTests([
            this.validateSystemHealth.bind(this),
            this.validateAPIEndpoints.bind(this),
            this.validateDatabaseConnection.bind(this),
            this.validateFilePermissions.bind(this),
            this.validateMemoryUsage.bind(this),
            this.validateCPUUsage.bind(this),
            this.validateNetworkConnectivity.bind(this),
            this.validateSecurityConfig.bind(this),
            this.validateBackupSystem.bind(this)
        ]);

        await this.generateReport();
        return this.results.failed === 0;
    }

    async runTests(tests) {
        for (const test of tests) {
            try {
                const result = await test();
                this.recordResult(result);
            } catch (error) {
                this.recordResult({
                    name: test.name,
                    passed: false,
                    error: error.message
                });
            }
        }
    }

    async validateSystemHealth() {
        const healthCheck = await this.makeRequest('/health');
        return {
            name: 'System Health',
            passed: healthCheck.status === 'healthy',
            details: healthCheck
        };
    }

    async validateAPIEndpoints() {
        const endpoints = [
            '/api/documents',
            '/api/auth',
            '/api/verification',
            '/api/status'
        ];

        const results = await Promise.all(
            endpoints.map(async (endpoint) => {
                try {
                    await this.makeRequest(endpoint);
                    return true;
                } catch {
                    return false;
                }
            })
        );

        return {
            name: 'API Endpoints',
            passed: results.every(r => r),
            details: { endpoints, results }
        };
    }

    async validateDatabaseConnection() {
        try {
            // Test database connection
            const dbTest = await this.makeRequest('/api/health/database');
            return {
                name: 'Database Connection',
                passed: dbTest.connected,
                details: dbTest
            };
        } catch (error) {
            return {
                name: 'Database Connection',
                passed: false,
                error: error.message
            };
        }
    }

    async validateMemoryUsage() {
        const usage = process.memoryUsage();
        const maxMemory = 450 * 1024 * 1024; // 450MB
        
        return {
            name: 'Memory Usage',
            passed: usage.heapUsed < maxMemory,
            details: {
                current: usage.heapUsed,
                max: maxMemory,
                usage: `${Math.round((usage.heapUsed / maxMemory) * 100)}%`
            }
        };
    }

    async validateSecurityConfig() {
        const securityChecks = [
            this.checkSSL(),
            this.checkFirewall(),
            this.checkAPIKeys(),
            this.checkRateLimits()
        ];

        const results = await Promise.all(securityChecks);
        
        return {
            name: 'Security Configuration',
            passed: results.every(r => r.passed),
            details: results
        };
    }

    async makeRequest(path, options = {}) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                hostname: 'localhost',
                port: process.env.PORT || 3000,
                path,
                method: options.method || 'GET',
                headers: options.headers || {},
                ...options
            };

            const req = http.request(requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        resolve(data);
                    }
                });
            });

            req.on('error', reject);
            req.end(options.body);
        });
    }

    recordResult(result) {
        this.results.total++;
        this.results.passed += result.passed ? 1 : 0;
        this.results.failed += result.passed ? 0 : 1;
        this.results.tests.push(result);
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                success_rate: `${Math.round((this.results.passed / this.results.total) * 100)}%`
            },
            tests: this.results.tests
        };

        await fs.writeFile(
            'deployment-validation-results.json',
            JSON.stringify(report, null, 2)
        );

        console.log('📊 Validation Report:');
        console.log(`✅ Passed: ${report.summary.passed}`);
        console.log(`❌ Failed: ${report.summary.failed}`);
        console.log(`📈 Success Rate: ${report.summary.success_rate}`);
    }
}

// Export the validator
module.exports = new DeploymentValidator();