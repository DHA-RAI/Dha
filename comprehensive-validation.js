const http = require("http");
const fs = require("fs").promises;

class ComprehensiveSystemValidator {
    constructor() {
        this.results = { startTime: Date.now(), checks: [], status: "pending" };
    }
    
    async runFullSystemCheck() {
        try {
            console.log("🚀 Starting Comprehensive System Validation...\n");
            
            // Core Systems
            console.log("🔍 Validating Core Systems...\n");
            await this.checkEndpoint("Health Monitoring", "http://localhost:3004/health");
            await this.checkEndpoint("Auto Recovery", "http://localhost:3001/health");
            await this.checkEndpoint("Anti Sleep", "http://localhost:3005/health");
            await this.checkEndpoint("Main App", "http://localhost:3000/health");
            
            // API Integrations
            console.log("\n🔍 Validating API Integrations...\n");
            const apis = [
                ["NPR Integration", "/api/dha/npr"],
                ["ABIS Integration", "/api/dha/abis"],
                ["SAPS Integration", "/api/dha/saps"],
                ["ICAO PKD", "/api/dha/icao-pkd"],
                ["SITA Integration", "/api/dha/sita"]
            ];
            
            for (const [name, path] of apis) {
                await this.checkEndpoint(name, "http://localhost:3000" + path + "/health");
            }
            
            // Document Generation
            console.log("\n🔍 Validating Document Generation...\n");
            const docs = ["passport", "birth-certificate", "death-certificate", "marriage-certificate"];
            
            for (const doc of docs) {
                await this.checkEndpoint(
                    doc.toUpperCase(),
                    "http://localhost:3000/api/documents/" + doc + "/test"
                );
            }
            
            this.printResults();
            return true;
        } catch (error) {
            console.error("❌ Validation failed:", error);
            return false;
        }
    }

    async checkEndpoint(name, url) {
        try {
            const response = await this.httpGet(url);
            const status = response.status === "healthy" || response.status === "active";
            this.addResult(name, status);
            console.log((status ? "✅" : "❌") + " " + name.padEnd(25) + ": " + (status ? "Working" : "Failed"));
        } catch (error) {
            this.addResult(name, false);
            console.log("❌ " + name.padEnd(25) + ": Failed - " + error.message);
        }
    }

    addResult(name, success) {
        this.results.checks.push({
            name,
            status: success ? "success" : "failed",
            timestamp: new Date().toISOString()
        });
    }

    printResults() {
        console.log("\n📊 System Validation Summary\n");
        
        const total = this.results.checks.length;
        const successful = this.results.checks.filter(c => c.status === "success").length;
        const failed = total - successful;
        
        console.log("Total Checks:  " + total);
        console.log("Successful:    " + successful);
        console.log("Failed:        " + failed);
        console.log("Success Rate:  " + (successful / total * 100).toFixed(2) + "%\n");
        
        if (failed === 0) {
            console.log("✅ All systems are operational");
        } else {
            console.log("❌ Some systems require attention");
        }
    }

    httpGet(url) {
        return new Promise((resolve, reject) => {
            const request = http.get(url, response => {
                let data = "";
                response.on("data", chunk => data += chunk);
                response.on("end", () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error("Invalid response from " + url));
                    }
                });
            });
            
            request.on("error", reject);
            request.setTimeout(5000, () => {
                request.destroy();
                reject(new Error("Request timeout for " + url));
            });
            
            request.end();
        });
    }
}

const validator = new ComprehensiveSystemValidator();
validator.runFullSystemCheck().catch(console.error);
