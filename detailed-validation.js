const http = require('http');
const { exec } = require('child_process');

class DetailedServiceValidator {
    constructor() {
        this.services = [
            { 
                name: 'Main App', 
                port: 3000,
                endpoints: ['/health', '/status']
            },
            { 
                name: 'Auto Recovery', 
                port: 3001,
                endpoints: ['/health', '/status']
            },
            { 
                name: 'Health Monitor', 
                port: 3004,
                endpoints: ['/health', '/status']
            },
            { 
                name: 'Anti Sleep', 
                port: 3005,
                endpoints: ['/health', '/status']
            }
        ];
    }

    async validateAll() {
        console.log('🔍 Starting Detailed Service Validation\n');
        let allPassed = true;

        // Check if processes are running
        await this.checkProcesses();
        console.log('\n🌐 Checking Service Endpoints:');

        for (const service of this.services) {
            const results = await this.checkAllEndpoints(service);
            if (results.some(r => !r.success)) allPassed = false;
            
            console.log(`\n${service.name}:`);
            for (const result of results) {
                const emoji = result.success ? '✅' : '❌';
                console.log(`  ${emoji} ${result.endpoint}: ${result.message}`);
            }
        }

        console.log('\n' + (allPassed ? '✅ All services are healthy' : '❌ Some services need attention'));
        return allPassed;
    }

    async checkProcesses() {
        console.log('📊 Process Status:');
        const cmd = 'ps aux | grep "[n]ode.*\\(minimal-server\\|auto-recovery\\|health-monitoring\\|anti-sleep\\)"';
        
        return new Promise((resolve) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Error checking processes:', error);
                    resolve(false);
                    return;
                }

                const processes = stdout.split('\n').filter(line => line.trim());
                processes.forEach(proc => {
                    const match = proc.match(/node\s+([^\s]+)/);
                    if (match) {
                        console.log(`✅ Running: ${match[1]}`);
                    }
                });
                resolve(true);
            });
        });
    }

    checkEndpoint(service, endpoint) {
        return new Promise((resolve) => {
            const request = http.get(`http://localhost:${service.port}${endpoint}`, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        resolve({
                            success: result.status === 'healthy',
                            endpoint,
                            message: result.status === 'healthy' ? 'Healthy' : 'Unhealthy response'
                        });
                    } catch (error) {
                        resolve({ 
                            success: false, 
                            endpoint,
                            message: 'Invalid JSON response'
                        });
                    }
                });
            });

            request.on('error', (error) => resolve({ 
                success: false, 
                endpoint,
                message: `Connection failed: ${error.message}`
            }));

            request.setTimeout(2000, () => {
                request.destroy();
                resolve({ 
                    success: false, 
                    endpoint,
                    message: 'Request timed out'
                });
            });
        });
    }

    async checkAllEndpoints(service) {
        return Promise.all(service.endpoints.map(endpoint => 
            this.checkEndpoint(service, endpoint)
        ));
    }
}

// Run validation
const validator = new DetailedServiceValidator();
validator.validateAll().then(success => {
    process.exit(success ? 0 : 1);
});