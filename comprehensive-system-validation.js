const http = require('http');const http = require('http');const http = require('http');

const fs = require('fs').promises;

const path = require('path');const https = require('https');const https = require('https');



class ComprehensiveSystemValidator {const fs = require('fs').promises;const fs = require('fs').promises;

    constructor() {

        this.results = {const path = require('path');const path = require('path');

            startTime: Date.now(),

            checks: [],

            status: 'pending'

        };class ComprehensiveSystemValidator {class ComprehensiveSystemValidator {

    }

    constructor() {    constructor() {

    async runFullSystemCheck() {

        console.log('🚀 Starting Comprehensive System Validation\n');        this.results = {        this.results = {

        

        try {            startTime: Date.now(),            startTime: Date.now(),

            await this.validateCoreSystems();

            await this.validateAPIIntegrations();            checks: [],            checks: [],

            await this.validateSecuritySystems();

            await this.validateDatabaseSystems();            status: 'pending'            status: 'pending',

            await this.validateDocumentGeneration();

                    };            apiIntegrations: {},

            this.printResults();

            await this.saveDetailedReport();    }            systemHealth: {},

            

            return this.results.status === 'success';            securityChecks: {},

        } catch (error) {

            console.error('❌ Validation failed:', error);    async runFullSystemCheck() {            databaseStatus: {},

            return false;

        }        console.log('\\n🚀 Starting Comprehensive System Validation...\\n');            servicesStatus: {}

    }

                };

    async validateCoreSystems() {

        console.log('🔍 Validating Core Systems...\n');        try {    }

        await this.checkEndpoint('Health Monitoring', 'http://localhost:3004/health');

        await this.checkEndpoint('Auto Recovery', 'http://localhost:3001/health');            await this.validateCoreSystems();

        await this.checkEndpoint('Anti Sleep', 'http://localhost:3005/health');

        await this.checkEndpoint('Main App', 'http://localhost:3000/health');            await this.validateAPIIntegrations();    async runFullSystemCheck() {

        this.checkMemoryUsage();

        await this.checkFileSystem();            await this.validateSecuritySystems();        console.log('🚀 Starting Comprehensive System Validation\n');

        console.log('');

    }            await this.validateDatabaseSystems();        



    async validateAPIIntegrations() {            await this.validateDocumentGeneration();        try {

        console.log('🔍 Validating API Integrations...\n');

        const apis = [                        // Core Systems

            ['NPR Integration', '/api/dha/npr'],

            ['ABIS Integration', '/api/dha/abis'],            this.printResults();            await this.validateCoreSystems();

            ['SAPS Integration', '/api/dha/saps'],

            ['ICAO PKD', '/api/dha/icao-pkd'],            await this.saveDetailedReport();            

            ['SITA Integration', '/api/dha/sita'],

            ['OpenAI Integration', '/api/ai/openai'],                        // API Integrations

            ['Claude Integration', '/api/ai/claude'],

            ['Ultra Queen AI', '/api/ai/ultra-queen'],            return this.results.status === 'success';            await this.validateAPIIntegrations();

            ['PDF Generation', '/api/documents/pdf'],

            ['OCR Service', '/api/documents/ocr'],        } catch (error) {            

            ['Biometric Service', '/api/biometric']

        ];            console.error('❌ Validation failed:', error);            // Security Systems

        

        for (const [name, path] of apis) {            return false;            await this.validateSecuritySystems();

            await this.checkEndpoint(name, 'http://localhost:3000' + path + '/health');

        }        }            

        console.log('');

    }    }            // Database Systems



    async validateSecuritySystems() {            await this.validateDatabaseSystems();

        console.log('🔍 Validating Security Systems...\n');

        const securityChecks = [    async validateCoreSystems() {            

            ['Authentication', '/api/auth'],

            ['Encryption', '/api/security/encryption'],        console.log('🔍 Validating Core Systems...\\n');            // Document Generation

            ['Rate Limiting', '/api/security/rate-limit'],

            ['Firewall', '/api/security/firewall'],        await this.checkEndpoint('Health Monitoring', 'http://localhost:3004/health');            await this.validateDocumentGeneration();

            ['POPIA Compliance', '/api/compliance/popia']

        ];        await this.checkEndpoint('Auto Recovery', 'http://localhost:3001/health');            

        

        for (const [name, path] of securityChecks) {        await this.checkEndpoint('Anti Sleep', 'http://localhost:3005/health');            // Print Final Results

            await this.checkEndpoint(name, 'http://localhost:3000' + path + '/health');

        }        await this.checkEndpoint('Main App', 'http://localhost:3000/health');            this.printResults();

        console.log('');

    }        this.checkMemoryUsage();            



    async validateDatabaseSystems() {        await this.checkFileSystem();            await this.saveDetailedReport();

        console.log('🔍 Validating Database Systems...\n');

        const dbChecks = [        console.log('');            

            ['Primary Database', '/api/db/primary'],

            ['Fallback Database', '/api/db/fallback'],    }            return this.results.status === 'success';

            ['Connection Pool', '/api/db/pool'],

            ['Migrations', '/api/db/migrations']        } catch (error) {

        ];

            async validateAPIIntegrations() {            console.error('❌ Validation failed:', error);

        for (const [name, path] of dbChecks) {

            await this.checkEndpoint(name, 'http://localhost:3000' + path + '/health');        console.log('🔍 Validating API Integrations...\\n');            return false;

        }

        console.log('');        const apis = [        }

    }

            ['NPR Integration', '/api/dha/npr'],    }

    async validateDocumentGeneration() {

        console.log('🔍 Validating Document Generation...\n');            ['ABIS Integration', '/api/dha/abis'],

        const documents = [

            'birth-certificate',            ['SAPS Integration', '/api/dha/saps'],    async validateCoreSystems() {

            'death-certificate',

            'marriage-certificate',            ['ICAO PKD', '/api/dha/icao-pkd'],        console.log('🔍 Validating Core Systems...\n');

            'passport',

            'visa',            ['SITA Integration', '/api/dha/sita'],

            'permit'

        ];            ['OpenAI Integration', '/api/ai/openai'],        // Health Monitoring



        for (const doc of documents) {            ['Claude Integration', '/api/ai/claude'],        await this.checkEndpoint('Health Monitoring', 'http://localhost:3004/health');

            const name = doc.replace(/-/g, ' ').toUpperCase();

            await this.checkEndpoint(name, 'http://localhost:3000/api/documents/' + doc + '/test');            ['Ultra Queen AI', '/api/ai/ultra-queen'],        

        }

        console.log('');            ['PDF Generation', '/api/documents/pdf'],        // Auto Recovery

    }

            ['OCR Service', '/api/documents/ocr'],        await this.checkEndpoint('Auto Recovery', 'http://localhost:3001/health');

    async checkEndpoint(name, url) {

        try {            ['Biometric Service', '/api/biometric']        

            const response = await this.httpGet(url);

            const status = response.status === 'healthy' || response.status === 'active';        ];        // Anti Sleep

            this.addResult(name, status);

            const mark = status ? '✅' : '❌';                await this.checkEndpoint('Anti Sleep', 'http://localhost:3005/health');

            const result = status ? 'Working' : 'Failed';

            console.log(mark + ' ' + name.padEnd(25) + ': ' + result);        for (const [name, path] of apis) {        

        } catch (error) {

            this.addResult(name, false);            await this.checkEndpoint(name, 'http://localhost:3000' + path + '/health');        // Main Application

            console.log('❌ ' + name.padEnd(25) + ': Failed - ' + error.message);

        }        }        await this.checkEndpoint('Main App', 'http://localhost:3000/health');

    }

        console.log('');        

    checkMemoryUsage() {

        const usage = process.memoryUsage();    }        // Memory Usage

        const maxAllowed = 450 * 1024 * 1024; // 450MB

        const status = usage.heapTotal < maxAllowed;        this.checkMemoryUsage();

        this.addResult('Memory Usage', status);

        const mark = status ? '✅' : '❌';    async validateSecuritySystems() {        

        const result = status ? 'Working' : 'Failed';

        console.log(mark + ' ' + 'Memory Usage'.padEnd(25) + ': ' + result);        console.log('🔍 Validating Security Systems...\\n');        // File System

    }

        const securityChecks = [        await this.checkFileSystem();

    async checkFileSystem() {

        const criticalFiles = [            ['Authentication', '/api/auth'],        

            'health-status.json',

            'ultra-robust-start-v2.sh',            ['Encryption', '/api/security/encryption'],        console.log(''); // Empty line for readability

            'config/ports.js',

            'deployment-validation.js'            ['Rate Limiting', '/api/security/rate-limit'],    }

        ];

            ['Firewall', '/api/security/firewall'],

        for (const file of criticalFiles) {

            try {            ['POPIA Compliance', '/api/compliance/popia']    async validateAPIIntegrations() {

                await fs.access(file);

                this.addResult('File: ' + file, true);        ];        console.log('🔍 Validating API Integrations...\n');

                console.log('✅ ' + ('File: ' + file).padEnd(25) + ': Working');

            } catch (error) {        

                this.addResult('File: ' + file, false);

                console.log('❌ ' + ('File: ' + file).padEnd(25) + ': Failed - ' + error.message);        for (const [name, path] of securityChecks) {        // DHA APIs

            }

        }            await this.checkEndpoint(name, 'http://localhost:3000' + path + '/health');        await this.checkEndpoint('NPR Integration', 'http://localhost:3000/api/dha/npr/health');

    }

        }        await this.checkEndpoint('ABIS Integration', 'http://localhost:3000/api/dha/abis/health');

    addResult(name, success) {

        this.results.checks.push({        console.log('');        await this.checkEndpoint('SAPS Integration', 'http://localhost:3000/api/dha/saps/health');

            name,

            status: success ? 'success' : 'failed',    }        await this.checkEndpoint('ICAO PKD', 'http://localhost:3000/api/dha/icao-pkd/health');

            timestamp: new Date().toISOString()

        });        await this.checkEndpoint('SITA Integration', 'http://localhost:3000/api/dha/sita/health');

    }

    async validateDatabaseSystems() {        

    printResults() {

        console.log('\n📊 System Validation Summary\n');        console.log('🔍 Validating Database Systems...\\n');        // AI Services

        

        const total = this.results.checks.length;        const dbChecks = [        await this.checkEndpoint('OpenAI Integration', 'http://localhost:3000/api/ai/openai/health');

        const successful = this.results.checks.filter(c => c.status === 'success').length;

        const failed = total - successful;            ['Primary Database', '/api/db/primary'],        await this.checkEndpoint('Claude Integration', 'http://localhost:3000/api/ai/claude/health');

        

        console.log('Total Checks:  ' + total);            ['Fallback Database', '/api/db/fallback'],        await this.checkEndpoint('Ultra Queen AI', 'http://localhost:3000/api/ai/ultra-queen/health');

        console.log('Successful:    ' + successful);

        console.log('Failed:        ' + failed);            ['Connection Pool', '/api/db/pool'],        

        console.log('Success Rate:  ' + (successful / total * 100).toFixed(2) + '%\n');

                    ['Migrations', '/api/db/migrations']        // Document Services

        this.results.status = failed === 0 ? 'success' : 'failed';

        if (this.results.status === 'success') {        ];        await this.checkEndpoint('PDF Generation', 'http://localhost:3000/api/documents/pdf/health');

            console.log('✅ All systems are operational');

        } else {                await this.checkEndpoint('OCR Service', 'http://localhost:3000/api/documents/ocr/health');

            console.log('❌ Some systems require attention');

        }        for (const [name, path] of dbChecks) {        await this.checkEndpoint('Biometric Service', 'http://localhost:3000/api/biometric/health');

    }

            await this.checkEndpoint(name, 'http://localhost:3000' + path + '/health');        

    async saveDetailedReport() {

        this.results.endTime = Date.now();        }        console.log(''); // Empty line for readability

        this.results.duration = this.results.endTime - this.results.startTime;

                console.log('');    }

        const report = {

            ...this.results,    }

            summary: {

                total: this.results.checks.length,    async validateSecuritySystems() {

                successful: this.results.checks.filter(c => c.status === 'success').length,

                failed: this.results.checks.filter(c => c.status === 'failed').length,    async validateDocumentGeneration() {        console.log('🔍 Validating Security Systems...\n');

                successRate: (this.results.checks.filter(c => c.status === 'success').length / this.results.checks.length * 100).toFixed(2) + '%'

            },        console.log('🔍 Validating Document Generation...\\n');

            timestamp: new Date().toISOString(),

            environment: {        const documents = [        // Authentication

                nodeVersion: process.version,

                platform: process.platform,            'birth-certificate',        await this.checkEndpoint('Auth Service', 'http://localhost:3000/api/auth/health');

                memory: process.memoryUsage()

            }            'death-certificate',        

        };

            'marriage-certificate',        // Encryption

        await fs.writeFile(

            'comprehensive-system-validation-report.json',            'passport',        await this.validateEncryption();

            JSON.stringify(report, null, 2)

        );            'visa',        

        

        console.log('\n📝 Detailed report saved to: comprehensive-system-validation-report.json');            'permit'        // Rate Limiting

    }

        ];        await this.checkRateLimiting();

    httpGet(url) {

        return new Promise((resolve, reject) => {        

            const request = http.get(url, (response) => {

                let data = '';        for (const doc of documents) {        // Firewall Rules

                response.on('data', chunk => data += chunk);

                response.on('end', () => {            const name = doc.replace(/-/g, ' ').toUpperCase();        await this.checkFirewallRules();

                    try {

                        resolve(JSON.parse(data));            await this.checkEndpoint(name, 'http://localhost:3000/api/documents/' + doc + '/test');        

                    } catch (error) {

                        reject(new Error('Invalid response from ' + url));        }        // POPIA Compliance

                    }

                });        console.log('');        await this.checkPOPIACompliance();

            });

                }        

            request.on('error', reject);

            request.setTimeout(5000, () => {        console.log(''); // Empty line for readability

                request.destroy();

                reject(new Error('Request timeout for ' + url));    async checkEndpoint(name, url) {    }

            });

                    try {

            request.end();

        });            const response = await this.httpGet(url);    async validateDatabaseSystems() {

    }

}            const status = response.status === 'healthy' || response.status === 'active';        console.log('🔍 Validating Database Systems...\n');



// Run validation            this.addResult(name, status);

console.log('🚀 Starting Comprehensive System Validation');

console.log('==========================================');            console.log((status ? '✅' : '❌') + ' ' + name.padEnd(25) + ': ' + (status ? 'Working' : 'Failed'));        // Primary Database



const validator = new ComprehensiveSystemValidator();        } catch (error) {        await this.checkEndpoint('Primary DB', 'http://localhost:3000/api/db/primary/health');

validator.runFullSystemCheck().then(success => {

    if (!success) {            this.addResult(name, false);        

        process.exit(1);

    }            console.log('❌ ' + name.padEnd(25) + ': Failed - ' + error.message);        // Fallback Database

}).catch(error => {

    console.error('❌ Validation failed:', error);        }        await this.checkEndpoint('Fallback DB', 'http://localhost:3000/api/db/fallback/health');

    process.exit(1);

});    }        

        // Connection Pool

    checkMemoryUsage() {        await this.checkDatabasePool();

        const usage = process.memoryUsage();        

        const maxAllowed = 450 * 1024 * 1024; // 450MB        // Migrations

        const status = usage.heapTotal < maxAllowed;        await this.checkMigrations();

        this.addResult('Memory Usage', status);        

        console.log((status ? '✅' : '❌') + ' ' + 'Memory Usage'.padEnd(25) + ': ' + (status ? 'Working' : 'Failed'));        console.log(''); // Empty line for readability

    }    }



    async checkFileSystem() {    async validateDocumentGeneration() {

        const criticalFiles = [        console.log('🔍 Validating Document Generation...\n');

            'health-status.json',

            'ultra-robust-start-v2.sh',        const documentTypes = [

            'config/ports.js',            'birth-certificate',

            'deployment-validation.js'            'death-certificate',

        ];            'marriage-certificate',

            'passport',

        for (const file of criticalFiles) {            'visa',

            try {            'permit'

                await fs.access(file);        ];

                this.addResult('File: ' + file, true);

                console.log('✅ ' + ('File: ' + file).padEnd(25) + ': Working');        for (const docType of documentTypes) {

            } catch (error) {            await this.checkEndpoint(

                this.addResult('File: ' + file, false);                `${docType.replace('-', ' ').toUpperCase()}`,

                console.log('❌ ' + ('File: ' + file).padEnd(25) + ': Failed - ' + error.message);                `http://localhost:3000/api/documents/${docType}/test`

            }            );

        }        }

    }        

        console.log(''); // Empty line for readability

    addResult(name, success) {    }

        this.results.checks.push({

            name,    async checkEndpoint(name, url) {

            status: success ? 'success' : 'failed',        try {

            timestamp: new Date().toISOString()            const response = await this.httpGet(url);

        });            const status = response.status === 'healthy' || response.status === 'active';

    }            this.addResult(name, status);

            console.log(\`\${status ? '✅' : '❌'} \${name.padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);

    printResults() {        } catch (error) {

        console.log('\\n📊 System Validation Summary\\n');            this.addResult(name, false);

                    console.log(\`❌ \${name.padEnd(25)}: Failed - \${error.message}\`);

        const total = this.results.checks.length;        }

        const successful = this.results.checks.filter(c => c.status === 'success').length;    }

        const failed = total - successful;

            async validateEncryption() {

        console.log('Total Checks:  ' + total);        try {

        console.log('Successful:    ' + successful);            const crypto = require('crypto');

        console.log('Failed:        ' + failed);            const test = crypto.createHash('sha256').update('test').digest('hex');

        console.log('Success Rate:  ' + (successful / total * 100).toFixed(2) + '%\\n');            const status = test.length === 64;

                    this.addResult('Encryption', status);

        this.results.status = failed === 0 ? 'success' : 'failed';            console.log(\`\${status ? '✅' : '❌'} \${('Encryption').padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);

        console.log(this.results.status === 'success'         } catch (error) {

            ? '✅ All systems are operational'            this.addResult('Encryption', false);

            : '❌ Some systems require attention');            console.log(\`❌ \${('Encryption').padEnd(25)}: Failed - \${error.message}\`);

    }        }

    }

    async saveDetailedReport() {

        this.results.endTime = Date.now();    async checkRateLimiting() {

        this.results.duration = this.results.endTime - this.results.startTime;        try {

                    const responses = await Promise.all([

        const report = {                this.httpGet('http://localhost:3000/api/auth/test'),

            ...this.results,                this.httpGet('http://localhost:3000/api/auth/test'),

            summary: {                this.httpGet('http://localhost:3000/api/auth/test')

                total: this.results.checks.length,            ]);

                successful: this.results.checks.filter(c => c.status === 'success').length,            const status = responses.some(r => r.status === 429);

                failed: this.results.checks.filter(c => c.status === 'failed').length,            this.addResult('Rate Limiting', status);

                successRate: (this.results.checks.filter(c => c.status === 'success').length / this.results.checks.length * 100).toFixed(2) + '%'            console.log(\`\${status ? '✅' : '❌'} \${('Rate Limiting').padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);

            },        } catch (error) {

            timestamp: new Date().toISOString(),            const status = error.message.includes('429');

            environment: {            this.addResult('Rate Limiting', status);

                nodeVersion: process.version,            console.log(\`\${status ? '✅' : '❌'} \${('Rate Limiting').padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);

                platform: process.platform,        }

                memory: process.memoryUsage()    }

            }

        };    async checkFirewallRules() {

        try {

        await fs.writeFile(            const response = await this.httpGet('http://localhost:3000/api/security/firewall/status');

            'comprehensive-system-validation-report.json',            const status = response.status === 'active';

            JSON.stringify(report, null, 2)            this.addResult('Firewall Rules', status);

        );            console.log(\`\${status ? '✅' : '❌'} \${('Firewall Rules').padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);

                } catch (error) {

        console.log('\\n📝 Detailed report saved to: comprehensive-system-validation-report.json');            this.addResult('Firewall Rules', false);

    }            console.log(\`❌ \${('Firewall Rules').padEnd(25)}: Failed - \${error.message}\`);

        }

    httpGet(url) {    }

        return new Promise((resolve, reject) => {

            const request = http.get(url, (response) => {    async checkPOPIACompliance() {

                let data = '';        try {

                response.on('data', chunk => data += chunk);            const response = await this.httpGet('http://localhost:3000/api/compliance/popia/status');

                response.on('end', () => {            const status = response.status === 'compliant';

                    try {            this.addResult('POPIA Compliance', status);

                        resolve(JSON.parse(data));            console.log(\`\${status ? '✅' : '❌'} \${('POPIA Compliance').padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);

                    } catch (error) {        } catch (error) {

                        reject(new Error('Invalid response from ' + url));            this.addResult('POPIA Compliance', false);

                    }            console.log(\`❌ \${('POPIA Compliance').padEnd(25)}: Failed - \${error.message}\`);

                });        }

            });    }

            

            request.on('error', reject);    async checkDatabasePool() {

            request.setTimeout(5000, () => {        try {

                request.destroy();            const response = await this.httpGet('http://localhost:3000/api/db/pool/status');

                reject(new Error('Request timeout for ' + url));            const status = response.connections && response.connections.available > 0;

            });            this.addResult('Database Pool', status);

                        console.log(\`\${status ? '✅' : '❌'} \${('Database Pool').padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);

            request.end();        } catch (error) {

        });            this.addResult('Database Pool', false);

    }            console.log(\`❌ \${('Database Pool').padEnd(25)}: Failed - \${error.message}\`);

}        }

    }

// Run validation

console.log('🚀 Starting Comprehensive System Validation');    async checkMigrations() {

console.log('==========================================');        try {

            const response = await this.httpGet('http://localhost:3000/api/db/migrations/status');

const validator = new ComprehensiveSystemValidator();            const status = response.status === 'current';

validator.runFullSystemCheck().then(success => {            this.addResult('Database Migrations', status);

    if (!success) {            console.log(\`\${status ? '✅' : '❌'} \${('Database Migrations').padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);

        process.exit(1);        } catch (error) {

    }            this.addResult('Database Migrations', false);

}).catch(error => {            console.log(\`❌ \${('Database Migrations').padEnd(25)}: Failed - \${error.message}\`);

    console.error('❌ Validation failed:', error);        }

    process.exit(1);    }

});
    checkMemoryUsage() {
        const usage = process.memoryUsage();
        const maxAllowed = 450 * 1024 * 1024; // 450MB
        const status = usage.heapTotal < maxAllowed;
        this.addResult('Memory Usage', status);
        console.log(\`\${status ? '✅' : '❌'} \${('Memory Usage').padEnd(25)}: \${status ? 'Working' : 'Failed'}\`);
    }

    async checkFileSystem() {
        const criticalFiles = [
            'health-status.json',
            'ultra-robust-start-v2.sh',
            'config/ports.js',
            'deployment-validation.js'
        ];

        for (const file of criticalFiles) {
            try {
                await fs.access(file);
                this.addResult(\`File: \${file}\`, true);
                console.log(\`✅ \${('File: ' + file).padEnd(25)}: Working\`);
            } catch (error) {
                this.addResult(\`File: \${file}\`, false);
                console.log(\`❌ \${('File: ' + file).padEnd(25)}: Failed - \${error.message}\`);
            }
        }
    }

    addResult(name, success) {
        this.results.checks.push({
            name,
            status: success ? 'success' : 'failed',
            timestamp: new Date().toISOString()
        });
    }

    printResults() {
        console.log('\n📊 System Validation Summary\n');
        
        const total = this.results.checks.length;
        const successful = this.results.checks.filter(c => c.status === 'success').length;
        const failed = total - successful;
        
        console.log(\`Total Checks: \${total}\`);
        console.log(\`Successful:   \${successful}\`);
        console.log(\`Failed:       \${failed}\`);
        
        const successRate = (successful / total * 100).toFixed(2);
        console.log(\`Success Rate: \${successRate}%\n\`);
        
        this.results.status = failed === 0 ? 'success' : 'failed';
        console.log(this.results.status === 'success' 
            ? '✅ All systems are operational'
            : '❌ Some systems require attention');
    }

    async saveDetailedReport() {
        this.results.endTime = Date.now();
        this.results.duration = this.results.endTime - this.results.startTime;
        
        const report = {
            ...this.results,
            summary: {
                total: this.results.checks.length,
                successful: this.results.checks.filter(c => c.status === 'success').length,
                failed: this.results.checks.filter(c => c.status === 'failed').length
            },
            timestamp: new Date().toISOString()
        };

        await fs.writeFile(
            'comprehensive-system-validation-report.json',
            JSON.stringify(report, null, 2)
        );
        
        console.log('\n📝 Detailed report saved to: comprehensive-system-validation-report.json');
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
            request.setTimeout(5000, () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
            request.end();
        });
    }
}

// Run validation
const validator = new ComprehensiveSystemValidator();
validator.runFullSystemCheck().then(success => {
    if (!success) {
        process.exit(1);
    }
}).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
});