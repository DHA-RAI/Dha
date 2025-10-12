"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoRecoverySystem = void 0;
var child_process_1 = require("child_process");
var http_1 = require("http");
var fs_1 = require("fs");
var os = require("os");
var AutoRecoverySystem = /** @class */ (function () {
    function AutoRecoverySystem() {
        this.config = {
            PORTS: {
                HEALTH: parseInt(process.env.HEALTH_PORT || '3001', 10),
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
    AutoRecoverySystem.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.startServer()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.startMonitoring()];
                    case 3:
                        _a.sent();
                        this.state.status = 'running';
                        console.log('✅ Auto-recovery system started successfully');
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        return [4 /*yield*/, this.handleError('startup', error_1)];
                    case 5:
                        _a.sent();
                        process.exit(1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.loadState()];
                    case 1:
                        _a.sent();
                        this.setupEventHandlers();
                        this.state.startTime = Date.now();
                        this.state.status = 'initializing';
                        return [4 /*yield*/, this.saveState()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        throw new Error("Initialization failed: ".concat(error_2.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.setupEventHandlers = function () {
        var _this = this;
        process.on('uncaughtException', function (error) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleError('uncaught', error)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        process.on('unhandledRejection', function (error) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleError('unhandled', error)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        ['SIGTERM', 'SIGINT'].forEach(function (signal) {
            process.on(signal, function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.shutdown(signal)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    AutoRecoverySystem.prototype.startServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.server = (0, http_1.createServer)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            var error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.handleRequest(req, res)];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_3 = _a.sent();
                                        res.writeHead(500).end(JSON.stringify({ error: error_3.message }));
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        _this.server.listen(_this.config.PORTS.HEALTH, function () {
                            console.log("Health server running on port ".concat(_this.config.PORTS.HEALTH));
                            resolve();
                        });
                        _this.server.on('error', reject);
                    })];
            });
        });
    };
    AutoRecoverySystem.prototype.handleRequest = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var routes, handler, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        routes = {
                            '/health': function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.getHealth()];
                            }); }); },
                            '/metrics': function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.getMetrics()];
                            }); }); },
                            '/status': function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.getStatus()];
                            }); }); },
                            '/reset': function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.resetSystem()];
                            }); }); }
                        };
                        handler = routes[req.url || ''];
                        if (!handler) {
                            res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, handler()];
                    case 1:
                        data = _a.sent();
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(data));
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.startMonitoring = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.intervals.health = setInterval(function () { return _this.runHealthCheck().catch(function (e) { return _this.handleError('health_check', e); }); }, this.config.INTERVALS.HEALTH_CHECK);
                this.intervals.metrics = setInterval(function () { return _this.updateMetrics().catch(function (e) { return _this.handleError('metrics', e); }); }, this.config.INTERVALS.METRICS);
                this.intervals.state = setInterval(function () { return _this.saveState().catch(function (e) { return _this.handleError('state_save', e); }); }, this.config.INTERVALS.STATE_SAVE);
                return [2 /*return*/];
            });
        });
    };
    AutoRecoverySystem.prototype.runHealthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var checks, failed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.checkMemory(),
                            this.checkCPU(),
                            this.checkDisk(),
                            this.checkProcesses()
                        ])];
                    case 1:
                        checks = _a.sent();
                        failed = checks.filter(function (check) { return !check.healthy; });
                        if (!(failed.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleHealthIssues(failed)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.state.lastCheck = new Date().toISOString();
                        return [4 /*yield*/, this.saveState()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.checkMemory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var used, total, usage;
            return __generator(this, function (_a) {
                used = process.memoryUsage();
                total = os.totalmem();
                usage = used.heapUsed / total;
                return [2 /*return*/, {
                        healthy: usage < this.config.THRESHOLDS.MEMORY,
                        type: 'memory',
                        usage: usage,
                        details: used
                    }];
            });
        });
    };
    AutoRecoverySystem.prototype.checkCPU = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cpus, usage;
            return __generator(this, function (_a) {
                cpus = os.cpus();
                usage = cpus.reduce(function (acc, cpu) {
                    var total = Object.values(cpu.times).reduce(function (a, b) { return a + b; });
                    var idle = cpu.times.idle;
                    return acc + ((total - idle) / total);
                }, 0) / cpus.length;
                return [2 /*return*/, {
                        healthy: usage < this.config.THRESHOLDS.CPU / 100,
                        type: 'cpu',
                        usage: usage * 100
                    }];
            });
        });
    };
    AutoRecoverySystem.prototype.checkDisk = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, usage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.execCommand('df -h / --output=pcent')];
                    case 1:
                        stdout = (_a.sent()).stdout;
                        usage = parseInt(stdout.trim().split('\n')[1], 10);
                        return [2 /*return*/, {
                                healthy: usage < this.config.THRESHOLDS.DISK,
                                type: 'disk',
                                usage: usage
                            }];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.checkProcesses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, processes, unhealthy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.execCommand('pm2 jlist')];
                    case 1:
                        stdout = (_a.sent()).stdout;
                        processes = JSON.parse(stdout);
                        unhealthy = processes.filter(function (p) { return p.pm2_env.status !== 'online'; });
                        return [2 /*return*/, {
                                healthy: unhealthy.length === 0,
                                type: 'processes',
                                details: unhealthy.map(function (p) { return ({
                                    name: p.name,
                                    status: p.pm2_env.status
                                }); })
                            }];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.handleHealthIssues = function (issues) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, issues_1, issue, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, issues_1 = issues;
                        _b.label = 1;
                    case 1:
                        if (!(_i < issues_1.length)) return [3 /*break*/, 11];
                        issue = issues_1[_i];
                        _a = issue.type;
                        switch (_a) {
                            case 'memory': return [3 /*break*/, 2];
                            case 'cpu': return [3 /*break*/, 4];
                            case 'disk': return [3 /*break*/, 6];
                            case 'processes': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 2: return [4 /*yield*/, this.handleMemoryIssue()];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this.handleCPUIssue()];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 6: return [4 /*yield*/, this.handleDiskIssue()];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, this.handleProcessIssue(issue.details)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 1];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.handleMemoryIssue = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (global.gc) {
                            global.gc();
                        }
                        return [4 /*yield*/, this.restartService('all')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.handleCPUIssue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, processes, _i, processes_1, proc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.execCommand('pm2 jlist')];
                    case 1:
                        stdout = (_a.sent()).stdout;
                        processes = JSON.parse(stdout);
                        _i = 0, processes_1 = processes;
                        _a.label = 2;
                    case 2:
                        if (!(_i < processes_1.length)) return [3 /*break*/, 5];
                        proc = processes_1[_i];
                        if (!(proc.monit.cpu > this.config.THRESHOLDS.CPU)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.restartService(proc.name)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.handleDiskIssue = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.execCommand('pm2 flush')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.execCommand('npm cache clean --force')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.execCommand('rm -rf ~/.npm/_logs/*')];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.handleProcessIssue = function (processes) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, processes_2, proc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, processes_2 = processes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < processes_2.length)) return [3 /*break*/, 4];
                        proc = processes_2[_i];
                        return [4 /*yield*/, this.restartService(proc.name)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.restartService = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.state.restartAttempts >= this.config.THRESHOLDS.MAX_RESTART_ATTEMPTS) {
                            throw new Error('Max restart attempts reached');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.execCommand("pm2 restart ".concat(name))];
                    case 2:
                        _a.sent();
                        this.state.restartAttempts++;
                        return [4 /*yield*/, this.saveState()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        throw new Error("Failed to restart ".concat(name, ": ").concat(error_4.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.execCommand = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        (0, child_process_1.exec)(command, function (error, stdout, stderr) {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve({ stdout: stdout, stderr: stderr });
                        });
                    })];
            });
        });
    };
    AutoRecoverySystem.prototype.updateMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.state;
                        _b = {};
                        return [4 /*yield*/, this.checkMemory()];
                    case 1:
                        _b.memory = _c.sent();
                        return [4 /*yield*/, this.checkCPU()];
                    case 2:
                        _b.cpu = _c.sent();
                        return [4 /*yield*/, this.checkDisk()];
                    case 3:
                        _a.metrics = (_b.disk = _c.sent(),
                            _b.uptime = process.uptime(),
                            _b);
                        return [4 /*yield*/, this.saveState()];
                    case 4:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.handleError = function (type, error) {
        return __awaiter(this, void 0, void 0, function () {
            var errorData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errorData = {
                            type: type,
                            message: error.message,
                            stack: error.stack,
                            timestamp: new Date().toISOString()
                        };
                        this.state.errors.push(errorData);
                        if (this.state.errors.length > 100) {
                            this.state.errors = this.state.errors.slice(-100);
                        }
                        return [4 /*yield*/, this.saveState()];
                    case 1:
                        _a.sent();
                        console.error("[".concat(type, "] ").concat(error.message));
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.loadState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, fs_1.promises.readFile(this.config.FILES.STATE, 'utf8')];
                    case 1:
                        data = _a.sent();
                        this.state = __assign(__assign({}, this.state), JSON.parse(data));
                        return [3 /*break*/, 4];
                    case 2:
                        error_5 = _a.sent();
                        return [4 /*yield*/, this.saveState()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.saveState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.writeFile(this.config.FILES.STATE, JSON.stringify(this.state, null, 2))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.resetSystem = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oldState, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oldState = __assign({}, this.state);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
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
                        return [4 /*yield*/, this.saveState()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { status: 'reset_successful' }];
                    case 3:
                        error_6 = _a.sent();
                        this.state = oldState;
                        throw new Error('Reset failed: ' + error_6.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AutoRecoverySystem.prototype.getHealth = function () {
        return {
            status: this.state.status,
            uptime: process.uptime(),
            lastCheck: this.state.lastCheck,
            restartAttempts: this.state.restartAttempts
        };
    };
    AutoRecoverySystem.prototype.getMetrics = function () {
        return __assign(__assign({}, this.state.metrics), { timestamp: new Date().toISOString() });
    };
    AutoRecoverySystem.prototype.getStatus = function () {
        return __assign(__assign({}, this.state), { timestamp: new Date().toISOString() });
    };
    AutoRecoverySystem.prototype.shutdown = function (signal) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Received ".concat(signal, ", shutting down..."));
                        Object.values(this.intervals).forEach(function (interval) {
                            if (interval) {
                                clearTimeout(interval);
                            }
                        });
                        if (!this.server) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return _this.server.close(function () { return resolve(); }); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.saveState()];
                    case 3:
                        _a.sent();
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        });
    };
    return AutoRecoverySystem;
}());
exports.AutoRecoverySystem = AutoRecoverySystem;
// Start the system
if (require.main === module) {
    var recovery = new AutoRecoverySystem();
    recovery.start().catch(function (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
