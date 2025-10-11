const http = require('http');

class ServiceValidator {
    constructor() {
        this.services = [
            { name: 'Main App', port: 3000 },
            { name: 'Auto Recovery', port: 3001 },
            { name: 'Health Monitor', port: 3004 },
            { name: 'Anti Sleep', port: 3005 }
        ];
    }

    async validateAll() {
        console.log('🚀 Starting Service Validation\n');
        let allPassed = true;

        for (const service of this.services) {
            const result = await this.checkService(service);
            if (!result.success) allPassed = false;
            
            // Print result with emoji
            const emoji = result.success ? '✅' : '❌';
            const status = result.success ? 'Working' : 'Failed';
            console.log(`${emoji} ${service.name.padEnd(20)}: ${status}`);
        }

        console.log('\n' + (allPassed ? '✅ All services are running' : '❌ Some services failed'));
        return allPassed;
    }

    checkService({ name, port }) {
        return new Promise((resolve) => {
            const request = http.get(`http://localhost:${port}/health`, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        resolve({
                            success: result.status === 'healthy',
                            name,
                            port
                        });
                    } catch (error) {
                        resolve({ success: false, name, port });
                    }
                });
            });

            request.on('error', () => resolve({ success: false, name, port }));
            request.setTimeout(2000, () => {
                request.destroy();
                resolve({ success: false, name, port });
            });
        });
    }
}

// Run validation
const validator = new ServiceValidator();
validator.validateAll().then(success => {
    process.exit(success ? 0 : 1);
});