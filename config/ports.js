/**
 * Central port configuration for all services
 * This ensures no port conflicts between different systems
 */
module.exports = {
    // Main application port
    APP_PORT: process.env.PORT || 3000,
    
    // System health check ports
    AUTO_RECOVERY_PORT: process.env.AUTO_RECOVERY_PORT || 3001,
    HEALTH_MONITOR_PORT: process.env.HEALTH_MONITOR_PORT || 3004,
    ANTI_SLEEP_PORT: process.env.ANTI_SLEEP_PORT || 3005,
    
    // Make sure ports are not reused
    validate() {
        const ports = new Set();
        const addPort = (name, value) => {
            if (ports.has(value)) {
                throw new Error(`Port conflict detected: ${name} is using port ${value} which is already in use`);
            }
            ports.add(value);
        };

        addPort('APP_PORT', this.APP_PORT);
        addPort('AUTO_RECOVERY_PORT', this.AUTO_RECOVERY_PORT);
        addPort('HEALTH_MONITOR_PORT', this.HEALTH_MONITOR_PORT);
        addPort('ANTI_SLEEP_PORT', this.ANTI_SLEEP_PORT);
    }
};