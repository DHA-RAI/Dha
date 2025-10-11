const http = require('http');

// Create test servers
const servers = [
    { port: 3000, name: 'Main App' },
    { port: 3001, name: 'Auto Recovery' },
    { port: 3004, name: 'Health Monitor' },
    { port: 3005, name: 'Anti Sleep' }
];

servers.forEach(({ port, name }) => {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', service: name }));
    });

    server.listen(port, () => {
        console.log(`✅ ${name} test server running on port ${port}`);
    });

    server.on('error', (error) => {
        console.log(`❌ ${name} failed to start: ${error.message}`);
    });
});