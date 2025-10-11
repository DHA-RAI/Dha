# System Port Configurations

## Overview
This document outlines the port configurations for the health and monitoring systems.

## Port Assignments

| System | Environment Variable | Default Port | Purpose |
|--------|---------------------|--------------|---------|
| Auto Recovery | `AUTO_RECOVERY_PORT` | 3001 | Handles system recovery and restarts |
| Health Monitor | `HEALTH_MONITOR_PORT` | 3002 | Monitors system health metrics |
| Anti Sleep | `ANTI_SLEEP_PORT` | 3003 | Prevents system from sleeping |

## Usage

Set these environment variables in your deployment configuration to override default ports:

```bash
export AUTO_RECOVERY_PORT=3001
export HEALTH_MONITOR_PORT=3002
export ANTI_SLEEP_PORT=3003
```

## System Communication

- Health Monitoring System communicates with Auto Recovery System using `AUTO_RECOVERY_PORT`
- Each system runs an independent HTTP server on its assigned port
- Default ports are used if environment variables are not set