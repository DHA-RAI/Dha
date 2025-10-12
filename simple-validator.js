const http = require('http');
const fs = require('fs').promises;

class SimpleValidator {
    async validate() {
        const results = {
            success: true,
            checks: []
        };

        try {
            // Check core services
            await this.checkService('Self-healing System', 3004);
            await this.checkService('Main Application', 3000);
            await this.checkService('Auto Recovery', 3001);

            // Check file system
            await this.checkFiles([
                'self-healing-system.js',
                'auto-recovery-system.js',
                'deployment-validator.js'
            ]);

            // Write results
            await fs.writeFile(
                'validation-results.json',
                JSON.stringify(results, null, 2)
            );

            console.log('✅ Validation passed');
            return true;
        } catch (error) {
            results.success = false;
            results.error = error.message;
            
            await fs.writeFile(
                'validation-results.json',
                JSON.stringify(results, null, 2)
            );

            console.error('❌ Validation failed:', error.message);
            return false;
        }
    }

    async checkService(name, port) {
        return new Promise((resolve, reject) => {
            const req = http.get(`http://localhost:${port}/health`, (res) => {
                if (res.statusCode === 200) {
                    resolve();
                } else {
                    reject(new Error(`${name} health check failed with status ${res.statusCode}`));
                }
            });

            req.on('error', () => {
                reject(new Error(`${name} is not responding`));
            });

            req.end();
        });
    }

    async checkFiles(files) {
        for (const file of files) {
            try {
                await fs.access(file);
            } catch {
                throw new Error(`Required file ${file} is missing`);
            }
        }
    }
}

module.exports = new SimpleValidator();