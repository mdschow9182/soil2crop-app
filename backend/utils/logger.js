/**
 * Logger Utility for Soil2Crop
 * 
 * Replaces console.log with structured, level-based logging
 * Supports different environments (development/production)
 */

const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'info';
    this.environment = process.env.NODE_ENV || 'development';
    this.logDir = path.join(__dirname, '..', 'logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      environment: this.environment,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Write log to file and console
   */
  writeLog(level, message, meta = {}) {
    // Skip if below current log level
    if (LOG_LEVELS[level] < LOG_LEVELS[this.level]) {
      return;
    }

    const logMessage = this.formatMessage(level, message, meta);

    // Always log to console in development
    if (this.environment === 'development') {
      const colorCodes = {
        debug: '\x1b[36m',  // Cyan
        info: '\x1b[32m',   // Green
        warn: '\x1b[33m',   // Yellow
        error: '\x1b[31m'   // Red
      };
      
      const reset = '\x1b[0m';
      const color = colorCodes[level] || '';
      
      console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`, meta);
    }

    // Write to file
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    try {
      fs.appendFileSync(logFile, logMessage + '\n');
    } catch (err) {
      console.error('Failed to write log file:', err);
    }
  }

  debug(message, meta = {}) {
    this.writeLog('debug', message, meta);
  }

  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  /**
   * Create a child logger with prefix
   */
  child(prefix) {
    const self = this;
    return {
      debug: (msg, meta) => self.debug(`[${prefix}] ${msg}`, meta),
      info: (msg, meta) => self.info(`[${prefix}] ${msg}`, meta),
      warn: (msg, meta) => self.warn(`[${prefix}] ${msg}`, meta),
      error: (msg, meta) => self.error(`[${prefix}] ${msg}`, meta)
    };
  }
}

// Export singleton instance
const logger = new Logger();
module.exports = logger;
